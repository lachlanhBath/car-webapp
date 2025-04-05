require "net/http"
require "json"

module Enrichment
  class MotHistoryService
    TOKEN_URL = "https://login.microsoftonline.com/a455b827-244f-4c97-b5b4-ce5d13b4d00c/oauth2/v2.0/token"
    BASE_URL = "https://history.mot.api.gov.uk"
    SCOPE_URL = "https://tapi.dvsa.gov.uk/.default"

    def initialize(api_key = nil)
      @api_key = api_key || ENV["MOT_HISTORY_API_KEY"]
    end

    def fetch_history(registration)
      # Simply return the raw API response
      fetch_mot_history(registration)
    end

    private

    def fetch_mot_history(registration_number)
      clean_reg = sanitize_registration(registration_number)
      Rails.logger.info("Fetching MOT history for: #{clean_reg}")

      if ENV["MOT_HISTORY_CLIENT_ID"].blank? || ENV["MOT_HISTORY_CLIENT_SECRET"].blank? || @api_key.blank?
        Rails.logger.error("Missing MOT History API credentials")
        return {"error" => "Missing MOT History API credentials"}
      end

      access_token = get_access_token
      if access_token.blank?
        Rails.logger.error("Failed to obtain access token")
        return {"error" => "Failed to authenticate with MOT History API"}
      end

      uri = URI.parse("#{BASE_URL}/v1/trade/vehicles/registration/#{clean_reg}")
      Rails.logger.info("Making request to: #{uri}")

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER

      request = Net::HTTP::Get.new(uri)
      request["Authorization"] = "Bearer #{access_token}"
      request["x-api-key"] = @api_key

      Rails.logger.info("Sending request with headers: Authorization=Bearer TOKEN, x-api-key=#{@api_key}")

      response = http.request(request)

      Rails.logger.info("Response status: #{response.code}")

      case response
      when Net::HTTPSuccess
        Rails.logger.info("Successful response received.")
        begin
          parsed_data = JSON.parse(response.body)
          Rails.logger.info("Response body: #{safe_truncate(parsed_data.inspect)}")
          # Return raw parsed data without processing
          parsed_data
        rescue JSON::ParserError => e
          Rails.logger.error("JSON parsing error: #{e.message}")
          Rails.logger.error("Response body: #{safe_truncate(response.body)}")
          {"error" => "Failed to parse API response: #{e.message}"}
        end
      when Net::HTTPNotFound
        Rails.logger.info("Vehicle not found")
        {"error" => "Vehicle MOT history not found"}
      else
        Rails.logger.error("API error: #{response.code} - #{response.message}")
        Rails.logger.error("Response body: #{safe_truncate(response.body)}")
        {"error" => "API error: #{response.code} - #{response.message}"}
      end
    rescue => e
      Rails.logger.error("MOT history request failed: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      {"error" => "Request failed: #{e.message}"}
    end

    def sanitize_registration(registration)
      registration.gsub(/[^A-Z0-9]/i, "").upcase
    end

    def safe_truncate(str, length = 500)
      return "" if str.nil?
      (str.length > length) ? str[0...length] + "..." : str
    end

    def get_access_token
      uri = URI(TOKEN_URL)
      request = Net::HTTP::Post.new(uri)
      request.set_form_data(
        "grant_type" => "client_credentials",
        "client_id" => ENV["MOT_HISTORY_CLIENT_ID"],
        "client_secret" => ENV["MOT_HISTORY_CLIENT_SECRET"],
        "scope" => SCOPE_URL
      )

      http = Net::HTTP.new(uri.hostname, uri.port)
      http.use_ssl = true

      response = http.request(request)

      if response.code == "200"
        token_data = JSON.parse(response.body)
        token_data["access_token"]
      else
        Rails.logger.error("Failed to get access token: #{response.body}")
        nil
      end
    rescue => e
      Rails.logger.error("Error getting access token: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      nil
    end
  end
end
