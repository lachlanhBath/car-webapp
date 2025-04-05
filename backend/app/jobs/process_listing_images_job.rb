class ProcessListingImagesJob < ApplicationJob
  queue_as :default
  
  def perform(listing_id)
    listing = Listing.find_by(id: listing_id)
    return unless listing && listing.image_urls.present?
    
    Rails.logger.info "Starting license plate extraction for listing ##{listing.id}"
    
    # Initialize the license plate service
    service = Enrichment::LicensePlateService.new
    
    # Extract license plate from listing images
    result = service.extract_from_listing(listing)
    
    if result[:registration].present?
      registration = result[:registration]
      Rails.logger.info "Found registration: #{registration} for listing ##{listing.id}"
      
      # Find or create a vehicle with this registration
      vehicle = Vehicle.find_or_create_by(registration: registration) do |v|
        # Set initial values when creating a new vehicle
        vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
        v.assign_attributes(vehicle_data)
        
        # Add registration details
        v.registration_confidence = result[:registration_confidence]
        v.registration_source = "ai_vision"
        v.registration_image_url = result[:registration_image_url]
        
        Rails.logger.info "Created new vehicle with registration: #{registration}"
      end
      
      # Associate the vehicle with this listing if not already associated
      if vehicle.listing_id != listing.id
        # If the vehicle is already associated with another listing, create a new vehicle
        if vehicle.listing_id.present?
          Rails.logger.info "Vehicle with registration #{registration} already associated with listing ##{vehicle.listing_id}"
          
          # Create a new vehicle specifically for this listing
          vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
          vehicle = listing.create_vehicle(vehicle_data.merge({
            registration: registration,
            registration_confidence: result[:registration_confidence],
            registration_source: "ai_vision",
            registration_image_url: result[:registration_image_url]
          }))
          
          Rails.logger.info "Created duplicate vehicle for listing ##{listing.id} with registration: #{registration}"
        else
          # Associate the existing vehicle with this listing
          vehicle.update(listing_id: listing.id)
          Rails.logger.info "Associated existing vehicle with listing ##{listing.id}"
        end
      end
      
      # Enqueue the vehicle enrichment jobs
      DvlaVehicleEnquiryJob.perform_later(vehicle.id)
      MotHistoryJob.perform_later(vehicle.id)
    else
      Rails.logger.info "No license plate detected for listing ##{listing.id}"
      
      # Even if no license plate is found, still create a vehicle with available data
      unless listing.vehicle
        vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
        vehicle = listing.create_vehicle(vehicle_data)
        Rails.logger.info "Created vehicle without registration for listing ##{listing.id}: #{vehicle.full_name}"
      end
    end
  rescue => e
    Rails.logger.error "Error in ProcessListingImagesJob for listing ##{listing_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end
end 