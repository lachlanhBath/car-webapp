class DvlaVehicleEnquiryJob < ApplicationJob
  queue_as :default

  def perform(vehicle_id)
    vehicle = Vehicle.find_by(id: vehicle_id)
    return unless vehicle

    Rails.logger.info "Starting DVLA enquiry for vehicle ##{vehicle.id}"

    # Skip if no registration available
    unless vehicle.registration.present?
      Rails.logger.info "Vehicle ##{vehicle.id} has no registration - skipping DVLA enquiry"
      return
    end

    begin
      # Sanitize registration to remove any non-alphanumeric characters
      registration = vehicle.registration.gsub(/[^A-Z0-9]/i, "")

      # Call the DVLA service
      dvla_service = Enrichment::DvlaEnquiryService.new
      dvla_data = dvla_service.fetch_vehicle_details(registration)

      if dvla_data.present?
        # Update vehicle with DVLA data - completely replace all vehicle details
        vehicle.update(
          # Use DVLA data directly without fallbacks to existing values
          make: dvla_data[:make],
          model: dvla_data[:model],
          color: dvla_data[:color],
          fuel_type: dvla_data[:fuel_type],
          year: dvla_data[:year],
          engine_size: dvla_data[:engine_size],
          transmission: dvla_data[:transmission] || vehicle.transmission,
          co2_emissions: dvla_data[:co2_emissions],
          tax_status: dvla_data[:tax_status],
          tax_due_date: dvla_data[:tax_due_date],
          mot_status: dvla_data[:mot_status],
          mot_expiry_date: dvla_data[:mot_expiry_date],
          dvla_data: dvla_data[:raw_data].to_json,
          # Only keep essential fields that aren't provided by DVLA
          price: vehicle.price,
          # Ensure we keep registration info
          registration: vehicle.registration,
          registration_confidence: vehicle.registration_confidence,
          registration_source: vehicle.registration_source,
          registration_image_url: vehicle.registration_image_url
        )

        Rails.logger.info "Updated vehicle ##{vehicle.id} with complete DVLA data"
      else
        Rails.logger.info "No DVLA data found for vehicle ##{vehicle.id} with registration #{vehicle.registration}"
      end

      # Continue to the next job in the pipeline regardless of the result
      MotHistoryJob.perform_later(vehicle_id)
    rescue => e
      Rails.logger.error "Error in DvlaVehicleEnquiryJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Still try to get MOT history even if DVLA fails
      MotHistoryJob.perform_later(vehicle_id)
    end
  end
end
