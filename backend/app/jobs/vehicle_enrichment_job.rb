class VehicleEnrichmentJob < ApplicationJob
  queue_as :default
  
  def perform(*args)
    # Placeholder for vehicle enrichment implementation
    Rails.logger.info "Running vehicle enrichment job at #{Time.now}"
    
    # Find vehicles without purchase summaries
    vehicles_without_summaries = Vehicle.where(purchase_summary: nil)
    count = vehicles_without_summaries.count
    
    Rails.logger.info "Found #{count} vehicles without purchase summaries"
    
    # Generate summaries for up to 50 vehicles per run to avoid overwhelming the API
    vehicles_without_summaries.limit(50).each do |vehicle|
      PurchaseSummaryJob.perform_later(vehicle.id)
      Rails.logger.info "Queued purchase summary generation for vehicle ##{vehicle.id}"
    end
    
    # For backwards compatibility, still trigger the MOT history job
    MotHistoryJob.perform_later
  end
end 