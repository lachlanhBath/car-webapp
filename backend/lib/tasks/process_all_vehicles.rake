namespace :vehicles do
  desc "Process all vehicles through the license plate extraction pipeline"
  task process_all: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting processing of all vehicles..."
    total = Vehicle.count
    processed = 0
    
    Vehicle.find_each(batch_size: batch_size) do |vehicle|
      puts "[#{processed + 1}/#{total}] Processing vehicle ##{vehicle.id}: #{vehicle.full_name}"
      
      # Enqueue the jobs
      ExtractLicensePlateJob.perform_later(vehicle.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} vehicles for processing"
  end
  
  desc "Process vehicles without registration"
  task process_unregistered: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting processing of vehicles without registration..."
    total = Vehicle.where(registration: nil).count
    processed = 0
    
    Vehicle.where(registration: nil).find_each(batch_size: batch_size) do |vehicle|
      puts "[#{processed + 1}/#{total}] Processing vehicle ##{vehicle.id}: #{vehicle.full_name}"
      
      # Enqueue the license plate extraction job
      ExtractLicensePlateJob.perform_later(vehicle.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} vehicles for license plate extraction"
  end
  
  desc "Process vehicles with registration but no DVLA data"
  task process_dvla: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting DVLA processing for vehicles with registration but no DVLA data..."
    total = Vehicle.where.not(registration: nil).where(dvla_data: nil).count
    processed = 0
    
    Vehicle.where.not(registration: nil).where(dvla_data: nil).find_each(batch_size: batch_size) do |vehicle|
      puts "[#{processed + 1}/#{total}] Processing vehicle ##{vehicle.id}: #{vehicle.full_name} (#{vehicle.registration})"
      
      # Skip the license plate extraction and go straight to DVLA
      DvlaVehicleEnquiryJob.perform_later(vehicle.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} vehicles for DVLA data retrieval"
  end
  
  desc "Process vehicles with registration but no MOT history"
  task process_mot: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting MOT history processing for vehicles with registration but no MOT history..."
    total = Vehicle.where.not(registration: nil).left_joins(:mot_histories).where(mot_histories: { id: nil }).count
    processed = 0
    
    Vehicle.where.not(registration: nil).left_joins(:mot_histories).where(mot_histories: { id: nil }).find_each(batch_size: batch_size) do |vehicle|
      puts "[#{processed + 1}/#{total}] Processing vehicle ##{vehicle.id}: #{vehicle.full_name} (#{vehicle.registration})"
      
      # Skip straight to MOT history
      MotHistoryJob.perform_later(vehicle.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} vehicles for MOT history retrieval"
  end

  desc "Process all listings to extract license plates and create/update vehicles"
  task process_all_listings: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting processing of all listings for license plate extraction..."
    total = Listing.count
    processed = 0
    
    Listing.find_each(batch_size: batch_size) do |listing|
      puts "[#{processed + 1}/#{total}] Processing listing ##{listing.id}: #{listing.title}"
      
      # Enqueue the listing processing job
      ProcessListingImagesJob.perform_later(listing.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} listings for license plate extraction"
  end

  desc "Process listings without associated vehicles"
  task process_orphan_listings: :environment do
    batch_size = (ENV['BATCH_SIZE'] || 10).to_i
    
    puts "Starting processing of listings without vehicles..."
    orphan_listings = Listing.left_joins(:vehicle).where(vehicles: { id: nil })
    total = orphan_listings.count
    processed = 0
    
    orphan_listings.find_each(batch_size: batch_size) do |listing|
      puts "[#{processed + 1}/#{total}] Processing orphan listing ##{listing.id}: #{listing.title}"
      
      # Enqueue the listing processing job
      ProcessListingImagesJob.perform_later(listing.id)
      
      processed += 1
    end
    
    puts "Queued #{processed} orphan listings for license plate extraction"
  end
end 