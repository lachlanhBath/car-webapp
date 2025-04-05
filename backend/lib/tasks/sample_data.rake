namespace :sample_data do
  desc "Generate sample listings data"
  task generate: :environment do
    # Clear existing data
    puts "Clearing existing data..."
    Listing.destroy_all
    
    # Generate new listings
    puts "Generating listings..."
    autotrader_scraper = Scrapers::AutotraderScraper.new
    autotrader_scraper.perform
    
    # Enrich vehicle data
    puts "Enriching vehicle data..."
    Listing.find_each do |listing|
      vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
      vehicle = listing.create_vehicle(vehicle_data)
      
      # Add registration number to some vehicles
      if rand(10) > 3 # 70% chance
        letters = ('A'..'Z').to_a
        vehicle.update(
          registration: "#{letters.sample}#{letters.sample}#{rand(10..99)} #{letters.sample}#{letters.sample}#{letters.sample}",
          # Add some other random details
          color: ['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey'].sample,
          doors: [3, 5].sample
        )
      end
    end
    
    # Generate MOT histories
    puts "Generating MOT histories..."
    Vehicle.where.not(registration: nil).find_each do |vehicle|
      mot_data = Enrichment::MotHistoryService.fetch_history(vehicle.registration)
      
      mot_data.each do |test|
        vehicle.mot_histories.create(
          test_date: test[:test_date],
          expiry_date: test[:expiry_date],
          odometer: test[:odometer],
          result: test[:result],
          advisory_notes: test[:advisory_notes],
          failure_reasons: test[:failure_reasons]
        )
      end
    end
    
    # Generate some searches
    puts "Generating sample searches..."
    search_terms = [
      { keyword: 'Ford Fiesta', min_price: 5000, max_price: 15000 },
      { keyword: 'BMW', location: 'London' },
      { keyword: 'Automatic', min_price: 10000 },
      { keyword: 'Toyota Hybrid' },
      { location: 'Manchester', min_price: 5000, max_price: 20000 }
    ]
    
    search_terms.each do |terms|
      Search.create(query: terms, ip_address: '127.0.0.1')
    end
    
    # Print summary
    puts "Sample data generation complete!"
    puts "Created #{Listing.count} listings"
    puts "Created #{Vehicle.count} vehicles"
    puts "Created #{MotHistory.count} MOT histories"
    puts "Created #{Search.count} searches"
  end
end 