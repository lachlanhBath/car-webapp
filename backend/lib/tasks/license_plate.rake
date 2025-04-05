namespace :license_plate do
  desc "Extract license plates from vehicle images using OpenAI Vision API"
  task extract: :environment do
    begin
      puts "Starting license plate extraction..."
      
      # Initialize the service
      service = Enrichment::LicensePlateService.new
      
      # Process specific listing if URL provided
      if ENV['LISTING_ID'].present?
        listing_id = ENV['LISTING_ID']
        listing = Listing.find_by(id: listing_id)
        
        if listing
          puts "Processing specific listing ##{listing.id}: #{listing.title}"
          result = service.extract_from_listing(listing)
          
          if result[:registration].present?
            # Update the vehicle if it exists
            if listing.vehicle
              listing.vehicle.update(
                registration: result[:registration],
                registration_confidence: result[:registration_confidence],
                registration_source: "ai_vision",
                registration_image_url: result[:registration_image_url]
              )
              puts "Updated vehicle ##{listing.vehicle.id} with registration: #{result[:registration]}"
            else
              puts "Listing has no associated vehicle. Creating vehicle with registration #{result[:registration]}"
              vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
              vehicle_data.merge!(
                registration: result[:registration],
                registration_confidence: result[:registration_confidence],
                registration_source: "ai_vision",
                registration_image_url: result[:registration_image_url]
              )
              listing.create_vehicle(vehicle_data)
            end
          else
            puts "No license plate found for listing ##{listing.id}"
          end
        else
          puts "Error: Listing ##{listing_id} not found"
        end
      else
        # Process all vehicles without registration
        start_time = Time.now
        count = service.extract_and_update_for_all_vehicles
        end_time = Time.now
        duration = (end_time - start_time).round(2)
        
        puts "Completed license plate extraction in #{duration} seconds"
        puts "Updated #{count} vehicles with license plates"
      end
      
    rescue => e
      puts "Error during license plate extraction: #{e.message}"
      puts e.backtrace.join("\n") if ENV['DEBUG'] == 'true'
    end
  end
  
  desc "Extract license plate from a specific image URL"
  task extract_from_url: :environment do
    image_url = ENV['IMAGE_URL']
    
    if image_url.blank?
      puts "Error: IMAGE_URL environment variable is required"
      exit 1
    end
    
    puts "Extracting license plate from image: #{image_url}"
    
    begin
      service = Enrichment::LicensePlateService.new
      result = service.extract_from_image(image_url)
      
      if result[:success]
        if result[:plate].present?
          puts "Found license plate: #{result[:plate]}"
          puts "Confidence: #{result[:confidence]}"
        else
          puts "No license plate found in the image"
        end
      else
        puts "Error: #{result[:error]}"
      end
    rescue => e
      puts "Error during license plate extraction: #{e.message}"
      puts e.backtrace.join("\n") if ENV['DEBUG'] == 'true'
    end
  end
end 