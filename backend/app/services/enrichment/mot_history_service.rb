require 'httparty'

module Enrichment
  class MotHistoryService
    include HTTParty
    
    API_ENDPOINT = 'https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests'
    
    def initialize(api_key = nil)
      @api_key = api_key || ENV['MOT_API_KEY']
    end
    
    def fetch_history(registration)
      return sample_data(registration) if Rails.env.development? || Rails.env.test? || @api_key.blank?
      
      clean_reg = sanitize_registration(registration)
      Rails.logger.info "Fetching MOT history for registration: #{clean_reg}"
      
      begin
        response = HTTParty.get(
          "#{API_ENDPOINT}?registration=#{clean_reg}",
          headers: {
            'Accept' => 'application/json+v6',
            'x-api-key' => @api_key
          },
          timeout: 10
        )
        
        if response.code == 200
          data = JSON.parse(response.body, symbolize_names: true)
          Rails.logger.info "MOT history retrieved successfully for #{clean_reg}"
          
          return format_mot_data(data)
        else
          error_message = response.body.present? ? JSON.parse(response.body)['message'] : "HTTP Error: #{response.code}"
          Rails.logger.error "MOT API error for #{clean_reg}: #{error_message}"
          []
        end
      rescue => e
        Rails.logger.error "Error fetching MOT history: #{e.message}"
        []
      end
    end
    
    private
    
    def sanitize_registration(registration)
      registration.gsub(/[^A-Z0-9]/i, '').upcase
    end
    
    def format_mot_data(data)
      return [] unless data.is_a?(Array) && data.any?
      
      vehicle_data = data.first
      mot_tests = vehicle_data[:motTests] || []
      
      mot_tests.map do |test|
        {
          test_date: parse_date(test[:completedDate]),
          expiry_date: parse_date(test[:expiryDate]),
          odometer: extract_odometer(test),
          result: test[:testResult],
          advisory_notes: extract_advisory_notes(test),
          failure_reasons: extract_failure_reasons(test)
        }
      end
    end
    
    def parse_date(date_string)
      return nil unless date_string
      Date.parse(date_string) rescue nil
    end
    
    def extract_odometer(test)
      return nil unless test[:odometerValue].present?
      test[:odometerValue].to_i
    end
    
    def extract_advisory_notes(test)
      rfrs = test[:rfrAndComments] || []
      advisories = rfrs.select { |rfr| rfr[:type] == 'ADVISORY' }
      advisories.map { |adv| adv[:text] }.join("\n")
    end
    
    def extract_failure_reasons(test)
      rfrs = test[:rfrAndComments] || []
      failures = rfrs.select { |rfr| rfr[:type] == 'FAIL' }
      failures.map { |fail| fail[:text] }.join("\n")
    end
    
    # Generate sample data for development/testing
    def sample_data(registration)
      # Seed the random generator with the registration to get consistent results
      seeded_rand = Random.new(registration.sum(&:ord))
      
      # Determine how many MOT tests to generate
      test_count = seeded_rand.rand(0..5)
      
      # Generate a consistent start date and base mileage
      base_year = seeded_rand.rand(2018..2023)
      base_date = Date.new(base_year, seeded_rand.rand(1..12), seeded_rand.rand(1..28))
      base_mileage = seeded_rand.rand(10000..80000)
      
      # Generate the test history from newest to oldest
      tests = []
      test_count.times do |i|
        test_date = base_date - (i * 365)
        expiry_date = test_date + 365
        
        # Each older test has lower mileage
        mileage = base_mileage - (i * seeded_rand.rand(5000..10000))
        
        # Randomize pass/fail and advisories based on registration
        result = (seeded_rand.rand(1..10) > 2) ? 'PASS' : 'FAIL'
        
        tests << {
          test_date: test_date,
          expiry_date: expiry_date,
          odometer: mileage,
          result: result,
          advisory_notes: generate_sample_advisories(seeded_rand, i),
          failure_reasons: result == 'FAIL' ? generate_sample_failures(seeded_rand, i) : nil
        }
      end
      
      tests
    end
    
    def generate_sample_advisories(seeded_rand, age_factor)
      advisory_options = [
        "Tyre worn close to legal limit",
        "Brake pad wearing thin",
        "Minor oil leak",
        "Suspension component has slight play",
        "Wiper blades showing signs of wear",
        "Light lens slightly damaged but functional",
        "Exhaust showing signs of corrosion",
        "Engine mounting has minor deterioration",
        "Front brake disc lightly scored",
        "Headlamp aim at limit of compliance"
      ]
      
      # Older tests are more likely to have more advisories
      advisory_count = [0, 0, 1, 1, 2, 3].sample(random: seeded_rand) + (age_factor / 2)
      advisory_count = [advisory_count, advisory_options.size].min
      
      if advisory_count > 0
        advisory_options.sample(advisory_count, random: seeded_rand).join("\n")
      else
        nil
      end
    end
    
    def generate_sample_failures(seeded_rand, age_factor)
      failure_options = [
        "Tyre tread depth below legal limit",
        "Brake efficiency below minimum requirement",
        "Headlamp aim out of alignment",
        "Excessive exhaust emissions",
        "Excessive play in steering",
        "Significant structural corrosion",
        "Brake pipe corroded to the extent that failure is imminent",
        "Windscreen damage impairing driver's view",
        "Suspension component with excessive play",
        "Seat belt mounting insecure"
      ]
      
      # Older tests are more likely to have failures
      failure_count = 1 + (age_factor / 2)
      failure_count = [failure_count, failure_options.size].min
      
      failure_options.sample(failure_count, random: seeded_rand).join("\n")
    end
  end
end 