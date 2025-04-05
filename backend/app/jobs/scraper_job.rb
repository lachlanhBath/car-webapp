class ScraperJob < ApplicationJob
  queue_as :default
  
  def perform(*args)
    # Placeholder for scraper implementation
    Rails.logger.info "Running scraper job at #{Time.now}"
    
    # This would call the individual site scrapers in the future
    # AutotraderScraper.new.perform
    # GumtreeScraper.new.perform
    
    # Schedule the vehicle enrichment job for new listings
    VehicleEnrichmentJob.perform_later
  end
end 