class VehicleEnrichmentJob < ApplicationJob
  queue_as :default
  
  def perform(*args)
    # Placeholder for vehicle enrichment implementation
    Rails.logger.info "Running vehicle enrichment job at #{Time.now}"
    
    
    
    # For backwards compatibility, still trigger the MOT history job
    MotHistoryJob.perform_later
  end
end 