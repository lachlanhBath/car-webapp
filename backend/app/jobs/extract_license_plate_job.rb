class ExtractLicensePlateJob < ApplicationJob
  queue_as :default

  def perform(vehicle_id)
    vehicle = Vehicle.find_by(id: vehicle_id)
    return unless vehicle && vehicle.listing

    Rails.logger.info "Starting license plate extraction for vehicle ##{vehicle.id}"

    # Skip if vehicle already has a real registration
    if vehicle.registration.present? && vehicle.registration_source == "ai_vision"
      Rails.logger.info "Vehicle ##{vehicle.id} already has AI-verified registration: #{vehicle.registration}"
      # Enqueue the next job in the pipeline
      DvlaVehicleEnquiryJob.perform_later(vehicle_id)
      return
    end

    # Check if OpenAI API key is configured
    if ENV['OPENAI_ACCESS_TOKEN'].blank?
      Rails.logger.error "OpenAI access token missing! Cannot proceed with license plate extraction."
      return # Don't proceed if AI is not available
    end

    begin
      # Initialize the license plate service
      service = Enrichment::LicensePlateService.new

      # Extract license plate from listing images
      if vehicle.listing.image_urls.present?
        result = service.extract_from_listing(vehicle.listing)

        if result[:registration].present?
          # Update ONLY the registration details, clear other fields that might have been set
          vehicle.update(
            # Reset all fields except ID and listing_id
            make: nil,
            model: nil,
            year: nil,
            fuel_type: nil,
            transmission: nil,
            engine_size: nil,
            color: nil,
            body_type: nil,
            doors: nil,
            vin: nil,
            # Set registration info
            registration: result[:registration],
            registration_confidence: result[:registration_confidence],
            registration_source: "ai_vision",
            registration_image_url: result[:registration_image_url]
          )

          Rails.logger.info "Updated vehicle ##{vehicle.id} with ONLY registration: #{result[:registration]}"

          # Enqueue the next job in the pipeline to populate vehicle details
          DvlaVehicleEnquiryJob.perform_later(vehicle_id)
        else
          Rails.logger.info "No license plate detected for vehicle ##{vehicle.id}"

          # If the vehicle doesn't have an AI-verified registration, we should delete it
          if vehicle.registration_source != "ai_vision"
            Rails.logger.info "Deleting vehicle ##{vehicle.id} as no license plate could be extracted"
            vehicle.destroy
          end
        end
      else
        Rails.logger.info "No images available for vehicle ##{vehicle.id}"

        # If the vehicle doesn't have an AI-verified registration and no images to process, delete it
        if vehicle.registration_source != "ai_vision"
          Rails.logger.info "Deleting vehicle ##{vehicle.id} as no license plate could be extracted (no images)"
          vehicle.destroy
        end
      end
    rescue => e
      Rails.logger.error "Error in ExtractLicensePlateJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end
end
