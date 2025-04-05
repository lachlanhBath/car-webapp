class ExtractLicensePlateJob < ApplicationJob
  queue_as :default
  
  def perform(vehicle_id)
    vehicle = Vehicle.find_by(id: vehicle_id)
    return unless vehicle && vehicle.listing
    
    Rails.logger.info "Starting license plate extraction for vehicle ##{vehicle.id}"
    
    # Skip if registration already exists
    if vehicle.registration.present?
      Rails.logger.info "Vehicle ##{vehicle.id} already has registration: #{vehicle.registration}"
      # Enqueue the next job in the pipeline if registration exists
      DvlaVehicleEnquiryJob.perform_later(vehicle_id)
      return
    end
    
    # Initialize the license plate service
    service = Enrichment::LicensePlateService.new
    
    # Extract license plate from listing images
    if vehicle.listing.image_urls.present?
      result = service.extract_from_listing(vehicle.listing)
      
      if result[:registration].present?
        vehicle.update(
          registration: result[:registration],
          registration_confidence: result[:registration_confidence],
          registration_source: "ai_vision",
          registration_image_url: result[:registration_image_url]
        )
        
        Rails.logger.info "Updated vehicle ##{vehicle.id} with registration: #{result[:registration]}"
        
        # Enqueue the next job in the pipeline
        DvlaVehicleEnquiryJob.perform_later(vehicle_id)
      else
        Rails.logger.info "No license plate detected for vehicle ##{vehicle.id}"
      end
    else
      Rails.logger.info "No images available for vehicle ##{vehicle.id}"
    end
  rescue => e
    Rails.logger.error "Error in ExtractLicensePlateJob for vehicle ##{vehicle_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end
end 