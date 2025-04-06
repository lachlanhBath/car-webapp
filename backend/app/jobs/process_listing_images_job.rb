class ProcessListingImagesJob < ApplicationJob
  queue_as :default

  def perform(listing_id)
    listing = Listing.find_by(id: listing_id)
    return unless listing && listing.image_urls.present?

    Rails.logger.info "Starting license plate extraction for listing ##{listing.id}"

    begin
      # Initialize the license plate service with required AI
      if ENV["OPENAI_ACCESS_TOKEN"].blank?
        Rails.logger.error "OpenAI access token missing! Cannot proceed with license plate extraction."
        return # Don't proceed if AI is not available
      end

      service = Enrichment::LicensePlateService.new

      # Extract license plate from listing images
      result = service.extract_from_listing(listing)

      if result[:registration].present?
        registration = result[:registration]
        Rails.logger.info "Found registration: #{registration} for listing ##{listing.id}"

        # Find or create a vehicle with ONLY this registration
        vehicle = Vehicle.find_or_create_by(registration: registration) do |v|
          # Only set registration details, let DVLA API fill in the rest
          v.registration_confidence = result[:registration_confidence]
          v.registration_source = "ai_vision"
          v.registration_image_url = result[:registration_image_url]
          v.price = listing.price

          Rails.logger.info "Created new vehicle with only registration: #{registration}"
        end

        # Associate the vehicle with this listing if not already associated
        if vehicle.listing_id != listing.id
          # If the vehicle is already associated with another listing, create a new vehicle
          if vehicle.listing_id.present?
            Rails.logger.info "Vehicle with registration #{registration} already associated with listing ##{vehicle.listing_id}"

            # Create a new vehicle specifically for this listing with ONLY registration
            vehicle = listing.create_vehicle({
              registration: registration,
              registration_confidence: result[:registration_confidence],
              registration_source: "ai_vision",
              registration_image_url: result[:registration_image_url],
              price: listing.price,
              transmission: listing.transmission
            })

            Rails.logger.info "Created duplicate vehicle for listing ##{listing.id} with only registration: #{registration}"
          else
            # Associate the existing vehicle with this listing
            vehicle.update(listing_id: listing.id)
            Rails.logger.info "Associated existing vehicle with listing ##{listing.id}"
          end
        end

        sleep(1) # wait for database to update
        # Enqueue the vehicle enrichment jobs to get the rest of the data
        DvlaVehicleEnquiryJob.perform_later(vehicle.id)
      else
        Rails.logger.info "No license plate detected for listing ##{listing.id} - no vehicle will be created"
        listing.destroy
      end
    rescue => e
      Rails.logger.error "Error in ProcessListingImagesJob for listing ##{listing_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end
end
