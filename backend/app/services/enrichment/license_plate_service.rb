require "openai"
require "httparty"

module Enrichment
  class LicensePlateService
    def initialize(api_key = nil)
      @api_key = api_key || ENV["OPENAI_ACCESS_TOKEN"]
      # Initialize OpenAI client
      @client = OpenAI::Client.new(access_token: @api_key)
    end

    def extract_from_listing(listing)
      return {} if listing.nil? || listing.image_urls.blank?

      puts "Extracting license plate for listing ##{listing.id}: #{listing.title}"

      # Try to extract from each image until we find a plate
      listing.image_urls.each do |image_url|
        result = extract_from_image(image_url)

        if result[:success] && result[:plate].present?
          puts "Found license plate: #{result[:plate]} in image: #{image_url}"
          return {
            registration: result[:plate],
            registration_confidence: result[:confidence],
            registration_image_url: image_url
          }
        end
      end

      puts "No license plate found in any images for listing ##{listing.id}"
      {}
    end

    def extract_from_image(image_url)
      puts "Analyzing image for license plate: #{image_url}"

      begin
        # Prepare the prompt for OpenAI
        prompt = "Look at this car image and tell me the license plate number. If there is no visible license plate, say 'No plate visible'. If the image doesn't show a car, say 'Not a car image'. If you can see a partial plate but it's not fully readable, share what you can see followed by '?' for missing characters. Format your response exactly like: 'License plate: AB12 CDE' or 'License plate: Not visible' or 'License plate: AB1? C?E'"

        # Call OpenAI API
        response = @client.chat(
          parameters: {
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: image_url } }
                ]
              }
            ],
            max_tokens: 300
          }
        )

        # Process the response
        if response["error"]
          puts "API Error: #{response["error"]["message"]}"
          return { success: false, error: response["error"]["message"] }
        end

        content = response.dig("choices", 0, "message", "content")
        puts "OpenAI response: #{content}"

        # Extract the plate from the response
        if content.present?
          if content.include?("No plate visible") || content.include?("Not visible") || content.include?("Not a car image")
            return { success: true, plate: nil, confidence: 0 }
          else
            # Try to extract the plate using regex
            match = content.match(/License plate:?\s*([A-Z0-9\s\?]+)/i)
            if match && match[1].present?
              plate = match[1].strip

              # Calculate confidence based on '?' characters
              confidence = plate.include?("?") ? 0.5 : 0.9

              return { success: true, plate: plate, confidence: confidence }
            end
          end
        end

        # If we reach here, we couldn't parse the response
        puts "Could not parse license plate from API response"
        return { success: false, error: "Could not parse response" }

      rescue => e
        puts "Error extracting license plate: #{e.message}"
        return { success: false, error: e.message }
      end
    end

    def extract_and_update_for_all_vehicles
      count = 0

      # Find vehicles without registration
      Vehicle.where(registration: nil).each do |vehicle|
        if vehicle.listing && vehicle.listing.image_urls.present?
          result = extract_from_listing(vehicle.listing)

          if result[:registration].present?
            vehicle.update(
              registration: result[:registration],
              registration_confidence: result[:registration_confidence],
              registration_source: "ai_vision",
              registration_image_url: result[:registration_image_url]
            )

            puts "Updated vehicle ##{vehicle.id} with registration: #{result[:registration]}"
            count += 1
          end
        end
      end

      count
    end
  end
end
