# Vehicle Data API Integration Guide

## Overview
This document outlines how to integrate with the DVLA Vehicle Enquiry Service and MOT History API to retrieve vehicle information. These APIs are used to enrich vehicle data in our application.

## API Credentials

### MOT History API
The MOT History API requires:
- Client ID
- Client Secret
- API Key

Store these in your environment variables or Rails credentials:
```ruby
# config/credentials.yml.enc
mot_history:
  client_id: your_client_id
  client_secret: your_client_secret
  api_key: your_api_key
```

### DVLA Vehicle Enquiry Service
The DVLA Vehicle Enquiry Service requires:
- API Key
- Base URL

Store these in your environment variables or Rails credentials:
```ruby
# config/credentials.yml.enc
dvla:
  api_key: your_api_key
  base_url: https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles
```

## DVLA Vehicle Enquiry Service

### Service Description
The Vehicle Enquiry Service API provides vehicle details based on the registration number. This includes information about tax status, MOT status, make, model, color, engine size, and more.

### Endpoint
```
POST https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles
```

### Headers
- `x-api-key`: Your API key (required)
- `X-Correlation-Id`: Consumer correlation ID (optional)
- `Content-Type`: application/json

### Request Body
```json
{
  "registrationNumber": "AB12CDE"
}
```

### Response
The API returns a JSON object with vehicle details, including:
- Registration number
- Tax status and due date
- MOT status and expiry date
- Make, color, fuel type
- Engine capacity, CO2 emissions
- Year of manufacture
- And more

### Rails Gateway Implementation

```ruby
# app/services/dvla/vehicle_enquiry_service.rb
module Dvla
  class VehicleEnquiryService
    include HTTParty
    
    base_uri ENV.fetch('DVLA_BASE_URL', 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1')
    
    def initialize
      @api_key = Rails.application.credentials.dvla[:api_key]
      @headers = {
        'x-api-key' => @api_key,
        'Content-Type' => 'application/json'
      }
    end
    
    def get_vehicle_details(registration_number)
      response = self.class.post(
        '/vehicles',
        body: { registrationNumber: registration_number }.to_json,
        headers: @headers
      )
      
      if response.success?
        response.parsed_response
      else
        handle_error(response)
      end
    end
    
    private
    
    def handle_error(response)
      case response.code
      when 400
        raise InvalidRequestError, "Invalid request: #{response.body}"
      when 404
        raise VehicleNotFoundError, "Vehicle not found with the provided registration number"
      when 500
        raise ServerError, "DVLA server error: #{response.body}"
      when 503
        raise ServiceUnavailableError, "DVLA service unavailable: #{response.body}"
      else
        raise UnknownError, "Unknown error: #{response.code} - #{response.body}"
      end
    end
  end
  
  class InvalidRequestError < StandardError; end
  class VehicleNotFoundError < StandardError; end
  class ServerError < StandardError; end
  class ServiceUnavailableError < StandardError; end
  class UnknownError < StandardError; end
end
```

## MOT History API

### Service Description
The MOT History API provides access to MOT test data for vehicles in Great Britain. It returns detailed information about MOT tests, including test dates, results, odometer readings, and any defects found.

### Available Endpoints
- `GET /v1/trade/vehicles/registration/{registration}`: Get MOT tests by registration number
- `GET /v1/trade/vehicles/vin/{vin}`: Get MOT tests by vehicle identification number
- `GET /v1/trade/vehicles/bulk-download`: Get MOT history in bulk

### Authentication
The MOT History API requires both Bearer token authentication and an API key:
- Bearer token: JWT obtained from the client ID and client secret
- API key: Provided when you register for the API

### Response Format
The API returns detailed information about MOT tests, including:
- Test dates and results
- Expiry dates
- Odometer readings
- Defects and advisories
- Vehicle details (make, model, registration, etc.)

### Rails Gateway Implementation

```ruby
# app/services/mot/history_service.rb
module Mot
  class HistoryService
    include HTTParty
    
    base_uri 'https://history.mot.api.gov.uk'
    
    def initialize
      @client_id = Rails.application.credentials.mot_history[:client_id]
      @client_secret = Rails.application.credentials.mot_history[:client_secret]
      @api_key = Rails.application.credentials.mot_history[:api_key]
      @token = fetch_token
    end
    
    def get_vehicle_by_registration(registration)
      response = self.class.get(
        "/v1/trade/vehicles/registration/#{registration}",
        headers: auth_headers
      )
      
      if response.success?
        response.parsed_response
      else
        handle_error(response)
      end
    end
    
    def get_vehicle_by_vin(vin)
      response = self.class.get(
        "/v1/trade/vehicles/vin/#{vin}",
        headers: auth_headers
      )
      
      if response.success?
        response.parsed_response
      else
        handle_error(response)
      end
    end
    
    private
    
    def auth_headers
      {
        'Authorization' => "Bearer #{@token}",
        'X-API-Key' => @api_key
      }
    end
    
    def fetch_token
      # In a real implementation, you would request a JWT token from the MOT API
      # using your client ID and secret. This is a simplified example.
      # You should also cache this token as it's valid for multiple requests.
      
      # This is pseudocode - implement the actual OAuth flow as required by the MOT API
      oauth_response = request_oauth_token(@client_id, @client_secret)
      oauth_response['access_token']
    end
    
    def handle_error(response)
      case response.code
      when 400
        raise BadRequestError, "Bad request: #{response.body}"
      when 404
        raise NotFoundError, "Vehicle not found: #{response.body}"
      when 500
        raise ServerError, "MOT API server error: #{response.body}"
      else
        raise UnknownError, "Unknown error: #{response.code} - #{response.body}"
      end
    end
  end
  
  class BadRequestError < StandardError; end
  class NotFoundError < StandardError; end
  class ServerError < StandardError; end
  class UnknownError < StandardError; end
end
```

## Integration in Vehicle Enrichment Job

```ruby
# app/jobs/vehicle_enrichment_job.rb
class VehicleEnrichmentJob < ApplicationJob
  queue_as :default
  
  def perform(vehicle_id)
    vehicle = Vehicle.find(vehicle_id)
    
    # Skip if no registration number
    return unless vehicle.registration.present?
    
    # First, try to get basic vehicle details from DVLA
    enrich_with_dvla(vehicle)
    
    # Then, try to get MOT history
    enrich_with_mot_history(vehicle)
    
    vehicle.save!
  rescue StandardError => e
    Rails.logger.error("Vehicle enrichment failed for vehicle #{vehicle_id}: #{e.message}")
    # Consider retrying the job with backoff
  end
  
  private
  
  def enrich_with_dvla(vehicle)
    dvla_service = Dvla::VehicleEnquiryService.new
    
    begin
      data = dvla_service.get_vehicle_details(vehicle.registration)
      
      # Update vehicle with DVLA data
      vehicle.make ||= data['make']
      vehicle.color ||= data['colour']
      vehicle.fuel_type ||= data['fuelType']&.downcase
      vehicle.engine_size ||= data['engineCapacity']&.to_s
      vehicle.year ||= data['yearOfManufacture']
      vehicle.tax_status = data['taxStatus']
      vehicle.tax_due_date = data['taxDueDate']
      vehicle.mot_status = data['motStatus']
      vehicle.mot_expiry_date = data['motExpiryDate']
      vehicle.co2_emissions = data['co2Emissions']
      
    rescue Dvla::VehicleNotFoundError
      # Vehicle not found, log and continue
      Rails.logger.info("Vehicle not found in DVLA database: #{vehicle.registration}")
    rescue => e
      # Log other errors but don't fail the job
      Rails.logger.error("DVLA enrichment error: #{e.message}")
    end
  end
  
  def enrich_with_mot_history(vehicle)
    mot_service = Mot::HistoryService.new
    
    begin
      data = mot_service.get_vehicle_by_registration(vehicle.registration)
      
      # Process MOT history data
      if data.is_a?(Array) && data.first['motTests'].present?
        vehicle_data = data.first
        
        # Update vehicle with MOT data if not already set by DVLA
        vehicle.make ||= vehicle_data['make']
        vehicle.model ||= vehicle_data['model']
        
        # Create MOT history records
        vehicle_data['motTests'].each do |mot_test|
          # Skip if we already have this test
          next if vehicle.mot_histories.exists?(test_number: mot_test['motTestNumber'])
          
          vehicle.mot_histories.build(
            test_date: mot_test['completedDate'],
            expiry_date: mot_test['expiryDate'],
            result: mot_test['testResult'] == 'PASSED' ? 'pass' : 'fail',
            odometer: mot_test['odometerValue'],
            odometer_unit: mot_test['odometerUnit']&.downcase,
            test_number: mot_test['motTestNumber']
          )
        end
      end
    rescue Mot::NotFoundError
      # Vehicle not found, log and continue
      Rails.logger.info("Vehicle not found in MOT database: #{vehicle.registration}")
    rescue => e
      # Log other errors but don't fail the job
      Rails.logger.error("MOT enrichment error: #{e.message}")
    end
  end
end
```

## Error Handling Considerations

1. **Rate Limiting**: Both APIs have rate limits. Implement exponential backoff and retry mechanisms.
2. **Data Inconsistency**: Data may differ between the two APIs. Implement logic to resolve conflicts.
3. **Service Unavailability**: Handle temporary service outages gracefully.
4. **Security**: Store API credentials securely using Rails credentials or a secret management service.

## Production Considerations

1. **Token Caching**: Cache OAuth tokens to reduce authentication overhead.
2. **Result Caching**: Cache API responses to reduce costs and improve performance.
3. **Background Processing**: Always fetch vehicle data in background jobs, not in web requests.
4. **Monitoring**: Log API usage and success/failure rates for monitoring.
5. **Fallback Strategy**: Implement a fallback strategy for when APIs are unavailable.

## Testing

Use VCR to record and replay HTTP requests in tests:

```ruby
# test/services/dvla/vehicle_enquiry_service_test.rb
require 'test_helper'

class Dvla::VehicleEnquiryServiceTest < ActiveSupport::TestCase
  setup do
    @service = Dvla::VehicleEnquiryService.new
    @registration = 'AB12CDE'
  end
  
  test "gets vehicle details successfully" do
    stub_http_requests do
      response = @service.get_vehicle_details(@registration)
      
      assert_equal @registration, response['registrationNumber']
      assert_includes response.keys, 'make'
      assert_includes response.keys, 'taxStatus'
    end
  end
  
  test "handles vehicle not found error" do
    stub_http_requests(cassette_name: 'vehicle_not_found') do
      assert_raises(Dvla::VehicleNotFoundError) do
        @service.get_vehicle_details('INVALID')
      end
    end
  end
end
```

```ruby
# test/jobs/vehicle_enrichment_job_test.rb
require 'test_helper'

class VehicleEnrichmentJobTest < ActiveJob::TestCase
  setup do
    @vehicle = create(:vehicle, registration: 'AB12CDE')
  end
  
  test "enriches vehicle with DVLA and MOT data" do
    stub_http_requests do
      assert_difference -> { @vehicle.reload.mot_histories.count }, 2 do
        perform_enqueued_jobs do
          VehicleEnrichmentJob.perform_later(@vehicle.id)
        end
      end
      
      @vehicle.reload
      assert_equal 'VOLKSWAGEN', @vehicle.make
      assert_equal 'Blue', @vehicle.color
      assert_equal 'petrol', @vehicle.fuel_type
      assert_not_nil @vehicle.mot_status
    end
  end
end
```

When you run these tests for the first time, VCR will record the actual HTTP requests and responses. On subsequent runs, it will use the recorded responses, making tests faster and more reliable while not depending on the actual API endpoints. 