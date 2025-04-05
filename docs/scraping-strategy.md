# Scraping Strategy

## Overview

This document outlines our approach to scraping car listings from various websites. The goal is to collect comprehensive, up-to-date car listings data while respecting website terms of service and maintaining ethical scraping practices.

## Data Sources

We plan to scrape car listings from the following UK-based sources:

1. **Major Car Listing Websites**
   - AutoTrader
   - Motors.co.uk
   - Gumtree (car section)
   - eBay Motors
   - Car & Classic (for classic/vintage vehicles)

2. **Dealer Websites**
   - Major dealership networks
   - Independent local dealers

## Scraping Architecture

### Components

```
                   ┌─────────────────┐
                   │ Scraping Manager│
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼─────────┐ ┌─────▼──────────┐ ┌────▼─────────────┐
│ Source-specific   │ │ Source-specific│ │ Source-specific  │
│ Scraper 1         │ │ Scraper 2      │ │ Scraper 3        │
└─────────┬─────────┘ └─────────┬──────┘ └────┬─────────────┘
          │                     │             │
          └──────────┬──────────┘             │
                     │                        │
          ┌──────────▼────────────────────────▼───┐
          │ Data Normalization & Enrichment Layer │
          └──────────┬────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ PostgreSQL   │
              └──────────────┘
```

### Key Components

1. **Scraping Manager**
   - Orchestrates scraping jobs
   - Manages scheduling and priorities
   - Handles retries and error reporting
   - Monitors system health and performance

2. **Source-specific Scrapers**
   - Implements site-specific scraping logic
   - Handles pagination and navigation
   - Parses HTML/JSON responses
   - Respects rate limits and robots.txt
   - Includes anti-blocking measures

3. **Data Normalization & Enrichment Layer**
   - Standardizes data formats
   - Removes duplicates
   - Validates data quality
   - Enhances with additional information

## Implementation Details

### Scraper Base Class

All scrapers inherit from a base class that provides:

```ruby
# app/services/scrapers/base_scraper.rb
module Scrapers
  class BaseScraper
    attr_reader :options
    
    def initialize(options = {})
      @options = default_options.merge(options)
      @http_client = build_http_client
      @logger = Rails.logger
    end
    
    def scrape
      raise NotImplementedError, "Subclasses must implement scrape method"
    end
    
    def scrape_listing(url)
      raise NotImplementedError, "Subclasses must implement scrape_listing method"
    end
    
    private
    
    def default_options
      {
        max_pages: 10,
        delay_between_requests: 2..5, # seconds
        user_agents: [
          # List of common user agents
        ],
        proxy_list: nil,
        respect_robots_txt: true
      }
    end
    
    def build_http_client
      # Configure HTTP client with appropriate headers, timeouts, etc.
    end
    
    def parse_price(price_string)
      # Common price parsing logic
    end
    
    def random_delay
      sleep rand(options[:delay_between_requests])
    end
    
    def rotate_user_agent
      # Logic to rotate user agents
    end
    
    def rotate_proxy
      # Logic to rotate proxies if available
    end
    
    def normalize_data(raw_data)
      # Common data normalization
    end
    
    def log_scraping_event(event_type, details = {})
      # Log scraping events
    end
  end
end
```

### Example Scraper Implementation

```ruby
# app/services/scrapers/autotrader_scraper.rb
module Scrapers
  class AutotraderScraper < BaseScraper
    BASE_URL = "https://www.autotrader.co.uk"
    SEARCH_URL = "#{BASE_URL}/car-search"
    
    def scrape(search_params = {})
      @search_params = search_params
      @results = []
      @page = 1
      
      while @page <= options[:max_pages]
        page_results = scrape_page(@page)
        break if page_results.empty?
        
        @results.concat(page_results)
        @page += 1
        random_delay
      end
      
      @results
    end
    
    def scrape_listing(url)
      response = @http_client.get(url)
      return nil unless response.success?
      
      doc = Nokogiri::HTML(response.body)
      
      # Extract listing details using site-specific selectors
      listing_data = {
        title: extract_title(doc),
        price: extract_price(doc),
        description: extract_description(doc),
        # ... other fields
      }
      
      normalize_data(listing_data)
    end
    
    private
    
    def scrape_page(page_number)
      url = build_search_url(page_number)
      response = @http_client.get(url)
      
      return [] unless response.success?
      
      doc = Nokogiri::HTML(response.body)
      listing_elements = doc.css('.search-page__results .search-listing')
      
      listing_elements.map do |element|
        listing_url = BASE_URL + element.at_css('a.listing-fpa-link')['href']
        
        # Extract basic listing data from search results
        listing_data = {
          source_url: listing_url,
          title: element.at_css('.product-card-details__title').text.strip,
          price: extract_price_from_element(element),
          # ... other fields
        }
        
        # Optionally fetch full listing details
        if options[:fetch_full_details]
          full_details = scrape_listing(listing_url)
          listing_data.merge!(full_details) if full_details
        end
        
        listing_data
      end
    end
    
    def build_search_url(page_number)
      # Construct search URL with pagination and filters
    end
    
    def extract_title(doc)
      # Extract title using appropriate selectors
    end
    
    def extract_price(doc)
      # Extract and normalize price
    end
    
    def extract_price_from_element(element)
      # Extract price from search result element
    end
    
    def extract_description(doc)
      # Extract full description
    end
  end
end
```

## Sidekiq Job Implementation

```ruby
# app/jobs/scraper_job.rb
class ScraperJob < ApplicationJob
  queue_as :scrapers
  
  sidekiq_options retry: 3, backtrace: true
  
  def perform(source, search_params = {})
    scraper = scraper_for_source(source).new
    
    begin
      results = scraper.scrape(search_params)
      process_results(results, source)
    rescue StandardError => e
      Rails.logger.error("Scraping error for #{source}: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      raise
    end
  end
  
  private
  
  def scraper_for_source(source)
    case source.to_sym
    when :autotrader
      Scrapers::AutotraderScraper
    when :motors
      Scrapers::MotorsScraper
    when :gumtree
      Scrapers::GumtreeScraper
    when :ebay
      Scrapers::EbayMotorsScraper
    else
      raise ArgumentError, "Unknown source: #{source}"
    end
  end
  
  def process_results(results, source)
    results.each do |result|
      existing_listing = Listing.find_by(source_url: result[:source_url])
      
      if existing_listing
        # Update if needed
        if listing_changed?(existing_listing, result)
          existing_listing.update(result)
        end
      else
        # Create new listing
        listing = Listing.create!(result.merge(source: source))
        
        # Trigger vehicle data enrichment
        VehicleEnrichmentJob.perform_later(listing.id)
      end
    end
  end
  
  def listing_changed?(listing, new_data)
    # Check if listing data has changed
  end
end
```

## Scheduling

Scraping jobs are scheduled using Sidekiq Scheduler:

```ruby
# config/sidekiq_scheduler.yml
scrape_autotrader:
  cron: "0 */2 * * *"  # Every 2 hours
  class: "ScraperJob"
  args: ["autotrader"]
  queue: scrapers
  description: "Scrape AutoTrader listings"

scrape_motors:
  cron: "30 */2 * * *"  # Every 2 hours, offset by 30 minutes
  class: "ScraperJob"
  args: ["motors"]
  queue: scrapers
  description: "Scrape Motors.co.uk listings"

scrape_gumtree:
  cron: "0 */3 * * *"  # Every 3 hours
  class: "ScraperJob"
  args: ["gumtree"]
  queue: scrapers
  description: "Scrape Gumtree car listings"

scrape_ebay:
  cron: "30 */3 * * *"  # Every 3 hours, offset by 30 minutes
  class: "ScraperJob"
  args: ["ebay"]
  queue: scrapers
  description: "Scrape eBay Motors listings"
```

## Ethical Considerations

We maintain ethical scraping practices by:

1. **Respecting robots.txt**: Checking and adhering to robots.txt directives
2. **Rate Limiting**: Implementing appropriate delays between requests
3. **Identification**: Using appropriate user-agent strings
4. **Minimal Impact**: Only requesting necessary pages
5. **Caching**: Storing results to minimize repeat requests
6. **Terms of Service**: Reviewing and respecting website terms

## Error Handling

The system includes robust error handling:

1. **Retry Logic**: Failed jobs are retried with exponential backoff
2. **Error Logging**: Detailed error information is captured
3. **Monitoring**: Alerts for persistent failures
4. **Graceful Degradation**: System continues to function with partial data

## Performance Considerations

To optimize scraping performance:

1. **Concurrent Scraping**: Multiple scraper instances run concurrently
2. **Resource Limits**: CPU and memory usage are monitored and limited
3. **Prioritization**: More valuable sources are scraped more frequently
4. **Incremental Updates**: Only scrape new/changed listings when possible

## Data Quality Assurance

We ensure data quality through:

1. **Validation**: Basic validation of scraped data
2. **Normalization**: Standardizing formats across sources
3. **Duplicate Detection**: Identifying and merging duplicate listings
4. **Anomaly Detection**: Flagging suspicious data for review

## Monitoring and Analytics

The scraping system is monitored using:

1. **Job Dashboard**: Sidekiq dashboard for job status
2. **Success Rates**: Tracking of successful vs. failed scrapes
3. **Volume Metrics**: Number of listings scraped per source/run
4. **Error Reports**: Summary of common errors

## Legal Considerations

Before implementation, we will:

1. Review each website's Terms of Service
2. Implement appropriate rate limiting
3. Consider using official APIs where available
4. Store only publicly available information
5. Respect copyright and intellectual property rights

## Future Improvements

Potential future enhancements include:

1. **Machine Learning**: Using ML to improve data extraction
2. **API Integration**: Adding support for official APIs
3. **Dynamic Scraping**: Adapting to website changes automatically
4. **Distributed Scraping**: Scaling across multiple servers
5. **Proxy Rotation**: Using a pool of proxies to avoid IP blocks 