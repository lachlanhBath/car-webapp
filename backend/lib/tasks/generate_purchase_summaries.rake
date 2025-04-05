namespace :vehicles do
  desc "Generate AI purchase summaries for all vehicles without one"
  task generate_purchase_summaries: :environment do
    puts "Starting purchase summary generation for vehicles..."
    
    # Find vehicles without summaries
    vehicles = Vehicle.where(purchase_summary: nil)
    total = vehicles.count
    
    puts "Found #{total} vehicles without purchase summaries"
    
    if total == 0
      puts "No summaries needed. Exiting."
      next
    end
    
    # Check if OpenAI API key is available
    if ENV['OPENAI_ACCESS_TOKEN'].blank?
      puts "ERROR: OPENAI_ACCESS_TOKEN environment variable is not set. Cannot proceed."
      next
    end
    
    # Process vehicles
    vehicles.find_each.with_index do |vehicle, index|
      puts "Processing vehicle #{index + 1}/#{total}: #{vehicle.full_name} (ID: #{vehicle.id})"
      
      begin
        # Queue the job to generate the purchase summary
        PurchaseSummaryJob.perform_later(vehicle.id)
        
        # Sleep briefly to avoid overwhelming the queue
        sleep(0.5)
        
        # Print progress every 10 vehicles
        if (index + 1) % 10 == 0
          puts "Progress: #{index + 1}/#{total} (#{((index + 1).to_f / total * 100).round(1)}%)"
        end
      rescue => e
        puts "ERROR processing vehicle #{vehicle.id}: #{e.message}"
      end
    end
    
    puts "All #{total} vehicles have been queued for summary generation."
    puts "The summaries will be generated asynchronously in the background."
  end
end 