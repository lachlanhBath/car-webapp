module Scrapers
  class BaseScraper
    def perform
      raise NotImplementedError, "#{self.class} must implement #perform method"
    end
    
    protected
    
    def extract_data(page)
      raise NotImplementedError, "#{self.class} must implement #extract_data method"
    end
    
    def save_listing(data)
      # Extract main fields
      listing_attributes = {
        source_url: data[:source_url],
        title: data[:title],
        price: data[:price],
        location: data[:location],
        description: data[:description],
        image_urls: data[:image_urls],
        post_date: data[:post_date],
        source_id: data[:source_id],
        status: 'active'
      }
      
      # Store all data in raw_data for future reference
      raw_data = data.dup
      raw_data.delete(:image_urls) if raw_data[:image_urls].is_a?(Array) # Don't duplicate large arrays
      
      listing_attributes[:raw_data] = raw_data
      
      # Create the listing
      listing = Listing.where(source_id: data[:source_id]).first_or_initialize
      listing.assign_attributes(listing_attributes)
      listing.save
      
      listing
    end
  end
end 