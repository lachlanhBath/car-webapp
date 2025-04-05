require 'httparty'

module Enrichment
  class DvlaEnquiryService
    include HTTParty
    
    API_ENDPOINT = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'
    
    def initialize(api_key = nil)
      @api_key = api_key || ENV['DVLA_API_KEY']
    end
    
    def fetch_vehicle_details(registration)
      return sample_data(registration) if Rails.env.development? || Rails.env.test? || @api_key.blank?
      
      clean_reg = sanitize_registration(registration)
      Rails.logger.info "Fetching DVLA data for registration: #{clean_reg}"
      
      begin
        response = HTTParty.post(
          API_ENDPOINT,
          headers: {
            'Content-Type' => 'application/json',
            'x-api-key' => @api_key
          },
          body: { registrationNumber: clean_reg }.to_json,
          timeout: 10
        )
        
        if response.code == 200
          data = JSON.parse(response.body, symbolize_names: true)
          Rails.logger.info "DVLA data retrieved successfully for #{clean_reg}"
          
          # Format and return the data
          {
            make: data[:make]&.titleize,
            model: data[:model]&.titleize,
            color: data[:colour]&.titleize,
            fuel_type: data[:fuelType]&.titleize,
            year: data[:yearOfManufacture],
            engine_size: data[:engineCapacity],
            transmission: extract_transmission(data),
            co2_emissions: data[:co2Emissions],
            tax_status: data[:taxStatus],
            tax_due_date: parse_date(data[:taxDueDate]),
            mot_status: data[:motStatus],
            mot_expiry_date: parse_date(data[:motExpiryDate]),
            first_registration_date: parse_date(data[:monthOfFirstRegistration]),
            wheelplan: data[:wheelplan],
            type_approval: data[:typeApproval],
            raw_data: data
          }
        else
          error_message = response.body.present? ? JSON.parse(response.body)['message'] : "HTTP Error: #{response.code}"
          Rails.logger.error "DVLA API error for #{clean_reg}: #{error_message}"
          {}
        end
      rescue => e
        Rails.logger.error "Error fetching DVLA data: #{e.message}"
        {}
      end
    end
    
    private
    
    def sanitize_registration(registration)
      registration.gsub(/[^A-Z0-9]/i, '').upcase
    end
    
    def parse_date(date_string)
      return nil unless date_string
      Date.parse(date_string) rescue nil
    end
    
    def extract_transmission(data)
      # DVLA API may not directly provide transmission info, this is a placeholder
      # In a real system, this might use various data points to determine transmission
      nil
    end
    
    # Generate sample data for development/testing
    def sample_data(registration)
      manufacturers = ['Ford', 'BMW', 'Audi', 'Mercedes', 'Toyota', 'Honda', 'Volkswagen', 'Nissan']
      models = {
        'Ford' => ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma'],
        'BMW' => ['1 Series', '3 Series', '5 Series', 'X3', 'X5'],
        'Audi' => ['A1', 'A3', 'A4', 'Q3', 'Q5'],
        'Mercedes' => ['A Class', 'C Class', 'E Class', 'GLC', 'GLE'],
        'Toyota' => ['Yaris', 'Corolla', 'RAV4', 'Prius', 'Auris'],
        'Honda' => ['Jazz', 'Civic', 'CR-V', 'HR-V', 'Accord'],
        'Volkswagen' => ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc'],
        'Nissan' => ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf']
      }
      colors = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey', 'Green']
      fuel_types = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
      
      # Seed the random generator with the registration to get consistent results
      seeded_rand = Random.new(registration.sum(&:ord))
      
      make = manufacturers.sample(random: seeded_rand)
      model = models[make].sample(random: seeded_rand)
      year = seeded_rand.rand(2008..2023)
      mot_status = seeded_rand.rand(1..10) > 2 ? 'Valid' : 'No MOT'
      tax_status = seeded_rand.rand(1..10) > 2 ? 'Taxed' : 'SORN'
      
      {
        make: make, 
        model: model,
        color: colors.sample(random: seeded_rand),
        fuel_type: fuel_types.sample(random: seeded_rand), 
        year: year,
        engine_size: seeded_rand.rand(10..60) * 100,
        transmission: ['Manual', 'Automatic'].sample(random: seeded_rand),
        co2_emissions: seeded_rand.rand(90..250),
        tax_status: tax_status,
        tax_due_date: tax_status == 'Taxed' ? Date.today + seeded_rand.rand(1..360) : nil,
        mot_status: mot_status,
        mot_expiry_date: mot_status == 'Valid' ? Date.today + seeded_rand.rand(1..360) : nil,
        first_registration_date: Date.new(year, seeded_rand.rand(1..12), seeded_rand.rand(1..28))
      }
    end
  end
end 