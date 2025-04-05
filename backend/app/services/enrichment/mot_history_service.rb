module Enrichment
  class MotHistoryService
    def self.fetch_history(registration)
      # This is a placeholder implementation
      # In a real service, this would call an external API to get MOT history
      # based on the vehicle registration number
      
      # For demo purposes, we'll generate some mock data
      generate_mock_data(registration)
    end
    
    private
    
    def self.generate_mock_data(registration)
      # Create between 1 and 5 MOT tests over the past few years
      num_tests = rand(1..5)
      
      tests = []
      last_date = Date.current - rand(1..6).months
      last_mileage = rand(30000..70000)
      
      num_tests.times do |i|
        test_date = last_date - i.years
        result = rand(10) < 8 ? 'pass' : 'fail' # 80% pass rate
        
        # Generate a random mileage that increases over time (newer tests have higher mileage)
        mileage = if i == 0
                    last_mileage
                  else
                    tests.last[:odometer] - rand(5000..10000)
                  end
        
        tests << {
          test_date: test_date,
          expiry_date: result == 'pass' ? test_date + 1.year : nil,
          odometer: mileage,
          result: result,
          advisory_notes: result == 'pass' ? generate_advisories : nil,
          failure_reasons: result == 'fail' ? generate_failures : nil
        }
      end
      
      tests
    end
    
    def self.generate_advisories
      advisories = [
        'Tyre worn close to legal limit',
        'Brake pads wearing thin',
        'Slight oil leak',
        'Windscreen has minor chips',
        'Suspension component has slight play',
        'Slight exhaust smoke visible during acceleration',
        'Minor corrosion on brake pipes',
        'Registration plate slightly damaged',
        'Wiper blades wearing but still effective'
      ]
      
      # Return between 0 and 3 random advisories
      advisories.sample(rand(0..3)).join('. ')
    end
    
    def self.generate_failures
      failures = [
        'Brake efficiency below minimum requirement',
        'Tyre tread depth below legal limit',
        'Headlight aim out of alignment',
        'Excessive exhaust emissions',
        'Steering component has excessive play',
        'Brake pipe corroded to the extent that failure is imminent',
        'Suspension component fractured or excessively worn',
        'Fuel leak present',
        'Seatbelt damaged or not functioning correctly'
      ]
      
      # Return between 1 and 3 random failures
      failures.sample(rand(1..3)).join('. ')
    end
  end
end 