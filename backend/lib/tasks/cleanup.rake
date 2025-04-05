namespace :cleanup do
  desc "Clean up duplicate vehicles with the same registration"
  task deduplicate_vehicles: :environment do
    puts "Starting vehicle deduplication process..."
    
    # Find vehicles with duplicate registrations
    duplicates = Vehicle.where.not(registration: nil)
                        .group(:registration)
                        .having("COUNT(*) > 1")
                        .count
    
    puts "Found #{duplicates.size} registrations with duplicate vehicles"
    
    duplicates.each do |registration, count|
      puts "Processing #{count} vehicles with registration: #{registration}"
      
      # Find all vehicles with this registration, ordered by created_at
      vehicles = Vehicle.where(registration: registration).order(created_at: :asc)
      
      # Keep the first (oldest) vehicle as the primary one
      primary_vehicle = vehicles.first
      duplicate_vehicles = vehicles.offset(1)
      
      # For each duplicate, update the listing to point to the primary vehicle
      duplicate_vehicles.each do |duplicate|
        if duplicate.listing.present?
          puts "  Updating listing ##{duplicate.listing.id} to point to primary vehicle ##{primary_vehicle.id}"
          
          # Update the listing to point to the primary vehicle
          duplicate.listing.update(vehicle_id: primary_vehicle.id)
          
          # Move any MOT histories to the primary vehicle if they don't exist there
          if duplicate.mot_histories.exists?
            puts "  Moving #{duplicate.mot_histories.count} MOT histories to primary vehicle"
            
            duplicate.mot_histories.each do |mot|
              # Check if a similar MOT history already exists on the primary vehicle
              existing = primary_vehicle.mot_histories.where(
                test_date: mot.test_date,
                result: mot.result
              ).first
              
              if existing
                puts "    Skipping duplicate MOT history from #{mot.test_date}"
              else
                mot.update(vehicle_id: primary_vehicle.id)
                puts "    Moved MOT history from #{mot.test_date}"
              end
            end
          end
          
          # Destroy the duplicate vehicle
          puts "  Destroying duplicate vehicle ##{duplicate.id}"
          duplicate.destroy
        else
          puts "  Destroying orphaned duplicate vehicle ##{duplicate.id} (no listing)"
          duplicate.destroy
        end
      end
    end
    
    puts "Vehicle deduplication complete"
  end
end 