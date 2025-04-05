module Scrapers
  class AutotraderScraper < BaseScraper
    BASE_URL = 'https://www.autotrader.co.uk'
    SEARCH_URL = "#{BASE_URL}/car-search"
    
    def initialize(options = {})
      @options = {
        postcode: 'BR1 5AY',
        page: 1,
        max_pages: 2,
        max_listings: 20
      }.merge(options)
      
      @user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      @debug_enabled = options[:debug] || ENV['DEBUG'] == 'true'
      @logger = options[:logger]
    end
    
    def perform
      puts "Starting Autotrader scraper..."
      
      # Check if we should process a specific car URL directly
      if ENV['CAR_URL'].present?
        puts "Processing specific car URL: #{ENV['CAR_URL']}"
        return process_single_car_url(ENV['CAR_URL'])
      end
      
      found_listings = []
      current_page = @options[:page]
      max_pages = @options[:max_pages]
      postcode = @options[:postcode]
      
      while current_page <= max_pages && found_listings.size < @options[:max_listings]
        # Construct search URL
        url = "#{SEARCH_URL}?postcode=#{postcode}&homeDeliveryAdverts=include&advertising-location=at_cars&page=#{current_page}"
        debug("Scraping page #{current_page}: #{url}")
        
        begin
          page_content = fetch_page(url)
          
          # Check if the page contains any content at all
          if page_content.nil? || page_content.empty?
            debug("Received empty page content for #{url}")
            break
          end
          
          # For debugging, save the HTML content
          save_debug_html(page_content, "search_page_#{current_page}.html")
          
          # Log HTML details
          debug_html_analysis(page_content)
          
          # Extract listings from the HTML
          listings = extract_listings(page_content)
          
          puts "Found #{listings.size} listings on page #{current_page}"
          
          if listings.empty?
            debug("No listings found on page #{current_page}, trying next page")
            current_page += 1
            next
          end
          
          listings.each do |listing_url|
            break if found_listings.size >= @options[:max_listings]
            
            begin
              puts "Fetching listing details: #{listing_url}"
              listing_content = fetch_page(listing_url)
              
              if listing_content.nil? || listing_content.empty?
                puts "Received empty listing content for #{listing_url}"
                next
              end
              
              # For debugging, save the HTML content
              save_debug_html(listing_content, "listing_#{extract_id_from_url(listing_url)}.html")
              
              debug_html_analysis(listing_content, "car listing")
              
              listing_data = extract_listing_details(listing_content, listing_url)
              
              if listing_data
                found_listings << listing_data
                listing = save_listing(listing_data)
                puts "Saved listing: #{listing.title} (#{listing.id})"
              else
                puts "Failed to extract data from #{listing_url}"
              end
              
              # Sleep to avoid rate limiting
              sleep(rand(1.0..2.0))
            rescue => e
              puts "Error processing listing #{listing_url}: #{e.message}"
              puts e.backtrace.join("\n")
              next
            end
          end
          
          current_page += 1
          sleep(rand(2.0..3.0))
        rescue => e
          puts "Error scraping page #{current_page}: #{e.message}"
          puts e.backtrace.join("\n")
          break
        end
      end
      
      puts "Autotrader scraper completed. Found #{found_listings.size} listings."
      found_listings.size
    end
    
    # Process a single car URL directly
    def process_single_car_url(url)
      debug("Processing single car URL: #{url}")
      
      begin
        listing_content = fetch_page(url)
        
        if listing_content.nil? || listing_content.empty?
          puts "Received empty listing content for #{url}"
          return 0
        end
        
        # For debugging, save the HTML content
        save_debug_html(listing_content, "listing_single_#{extract_id_from_url(url)}.html")
        
        debug_html_analysis(listing_content, "car listing")
        
        listing_data = extract_listing_details(listing_content, url)
        
        if listing_data
          listing = save_listing(listing_data)
          puts "Saved listing: #{listing.title} (#{listing.id})"
          return 1
        else
          puts "Failed to extract data from #{url}"
          return 0
        end
      rescue => e
        puts "Error processing listing #{url}: #{e.message}"
        puts e.backtrace.join("\n")
        return 0
      end
    end
    
    def scrape_single_listing(url)
      debug("Scraping single listing: #{url}")
      
      begin
        # Fetch the listing content
        listing_content = fetch_page(url)
        
        if listing_content.nil? || listing_content.empty?
          puts "Received empty listing content for #{url}"
          return { listings_scraped: 0, vehicles_enriched: 0, mot_histories_generated: 0 }
        end
        
        # For debugging, save the HTML content
        save_debug_html(listing_content, "listing_single_#{extract_id_from_url(url)}.html")
        
        debug_html_analysis(listing_content, "car listing")
        
        # Extract listing details
        listing_data = extract_listing_details(listing_content, url)
        
        if listing_data
          # Save the listing to the database
          listing = create_or_update_listing(listing_data)
          puts "Saved listing: #{listing.title}"
          
          # Enrich vehicles and generate MOT histories
          vehicles_enriched = enrich_vehicles
          mot_histories_generated = generate_mot_histories
          
          return {
            listings_scraped: 1,
            vehicles_enriched: vehicles_enriched,
            mot_histories_generated: mot_histories_generated
          }
        else
          puts "Failed to extract data from #{url}"
          return { listings_scraped: 0, vehicles_enriched: 0, mot_histories_generated: 0 }
        end
      rescue => e
        puts "Error processing listing #{url}: #{e.message}"
        debug(e.backtrace.join("\n"))
        return { listings_scraped: 0, vehicles_enriched: 0, mot_histories_generated: 0 }
      end
    end
    
    def scrape_listings(options = {})
      postcode = options[:postcode] || "SW1A 1AA"
      max_pages = options[:max_pages] || 2
      max_listings = options[:max_listings] || 10
      
      listings_scraped = 0
      urls = []
      
      puts "Starting scraping with standard HTTP client..."
      
      # Scrape listing URLs from search pages
      (1..max_pages).each do |page|
        break if urls.size >= max_listings
        
        # Construct search URL with parameters
        search_url = "#{SEARCH_URL}?postcode=#{postcode.tr(" ", "+")}&advertising-location=at_cars&page=#{page}"
        puts "Scraping search page #{page}: #{search_url}"
        
        begin
          page_content = fetch_page(search_url)
          
          # Check if the page contains any content
          if page_content.nil? || page_content.empty?
            puts "Received empty page content for #{search_url}"
            next
          end
          
          # For debugging, save the HTML content
          save_debug_html(page_content, "search_page_#{page}.html")
          
          # Log HTML details
          debug_html_analysis(page_content)
          
          # Extract listings from the HTML
          page_urls = extract_listings(page_content)
          
          if page_urls.empty?
            puts "No listings found on page #{page}, trying next page"
            next
          end
          
          puts "Found #{page_urls.size} listing URLs on page #{page}"
          
          # Add unique URLs to our collection, respecting max_listings
          remaining = max_listings - urls.size
          urls += page_urls.first(remaining)
          
          puts "Added #{[page_urls.size, remaining].min} URLs from page #{page}, total: #{urls.size}/#{max_listings}"
          
          # Break if we've collected enough URLs
          break if urls.size >= max_listings
          
          # Add delay between pages
          sleep(rand(1.0..2.0))
        rescue => e
          puts "Error scraping search page #{page}: #{e.message}"
          debug(e.backtrace.join("\n"))
          next
        end
      end
      
      puts "Found #{urls.size} unique listing URLs across all pages"
      
      # Process each listing URL
      urls.each_with_index do |url, index|
        begin
          puts "Processing listing #{index + 1}/#{urls.size}: #{url}"
          
          listing_content = fetch_page(url)
          
          if listing_content.nil? || listing_content.empty?
            puts "Received empty listing content for #{url}"
            next
          end
          
          # For debugging, save the HTML content
          save_debug_html(listing_content, "listing_#{extract_id_from_url(url)}.html")
          
          debug_html_analysis(listing_content, "car listing")
          
          listing_data = extract_listing_details(listing_content, url)
          
          if listing_data
            create_or_update_listing(listing_data)
            listings_scraped += 1
            puts "Successfully scraped listing #{index + 1}: #{url}"
          else
            puts "Failed to scrape listing #{index + 1}: #{url}"
          end
          
          # Brief pause between processing listings
          sleep(rand(0.5..1.5)) unless index == urls.size - 1
          
        rescue => e
          puts "Error processing listing #{url}: #{e.message}"
          debug(e.backtrace.join("\n"))
        end
      end
      
      # Generate vehicle data and MOT histories
      vehicles_enriched = enrich_vehicles
      mot_histories_generated = generate_mot_histories
      
      {
        listings_scraped: listings_scraped,
        vehicles_enriched: vehicles_enriched,
        mot_histories_generated: mot_histories_generated
      }
    end
    
    private
    
    def debug(message)
      puts "[DEBUG] #{message}" if @debug_enabled
    end
    
    def fetch_page(url)
      puts "Fetching: #{url}"
      
      # Add random delay to seem more human-like
      sleep(rand(1.0..3.0))
      
      headers = {
        'User-Agent' => @user_agent,
        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language' => 'en-GB,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding' => 'gzip, deflate, br',
        'Referer' => 'https://www.autotrader.co.uk/',
        'DNT' => '1',
        'Connection' => 'keep-alive',
        'Cache-Control' => 'max-age=0',
        'Sec-Ch-Ua' => '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile' => '?0',
        'Sec-Ch-Ua-Platform' => '"Windows"',
        'Sec-Fetch-Dest' => 'document',
        'Sec-Fetch-Mode' => 'navigate',
        'Sec-Fetch-Site' => 'same-origin',
        'Sec-Fetch-User' => '?1',
        'Upgrade-Insecure-Requests' => '1'
      }
      
      response = HTTParty.get(url, 
        headers: headers,
        follow_redirects: true,
        timeout: 30
      )
      
      if response.code == 200
        debug("Successful response, content length: #{response.body.size}")
        response.body
      else
        puts "Error fetching page, status code: #{response.code}"
        puts "Response body: #{response.body[0..200]}..." if response.body
        ""
      end
    end
    
    def debug_html_analysis(html, context = "page")
      return unless @debug_enabled
      
      doc = Nokogiri::HTML(html)
      debug("HTML Analysis for #{context}:")
      debug("- Size: #{html.size} bytes")
      debug("- Title: '#{doc.title}'")
      debug("- Meta description: '#{doc.at_css('meta[name="description"]')&.[]('content')}'")
      
      # Count elements that might be relevant
      debug("- Number of links: #{doc.css('a').size}")
      debug("- Number of images: #{doc.css('img').size}")
      
      # Look for common Autotrader elements
      debug("- Search results container present: #{!doc.css('.search-page__results').empty?}")
      debug("- Search form present: #{!doc.css('form.search-form').empty?}")
      debug("- Search filter present: #{!doc.css('.search-filter').empty?}")
      
      # Sample of links
      links = doc.css('a').map { |a| a['href'] }.compact.uniq
      car_links = links.select { |link| link.include?('/car-details/') }
      debug("- Car detail links found: #{car_links.size}")
      debug("- Sample car links: #{car_links[0..2]}") if car_links.any?
      
      # Look for specific elements
      listing_container_selectors = [
        '.search-page__results', 
        '.search-results', 
        '.listings-container',
        '.vehicle-listings'
      ]
      
      listing_container_selectors.each do |selector|
        count = doc.css(selector).size
        debug("- '#{selector}' elements found: #{count}")
      end
      
      # Find potential listing card patterns
      potential_classes = []
      
      doc.css('div, li, article').each do |element|
        next unless element['class']
        
        # Look for classes that might represent listing cards
        if element['class'].include?('card') || 
           element['class'].include?('listing') || 
           element['class'].include?('result') || 
           element['class'].include?('vehicle') ||
           element['class'].include?('advert')
          potential_classes << element['class']
        end
      end
      
      unique_classes = potential_classes.uniq
      debug("- Potential listing card classes found: #{unique_classes.size}")
      debug("- Sample classes: #{unique_classes[0..5]}") if unique_classes.any?
    end
    
    def extract_listings(html)
      doc = Nokogiri::HTML(html)
      puts "HTML size: #{html.size} bytes, title: #{doc.title}"
      
      # Primary selector for car listings as specified by the user
      primary_selector = '[data-testid="ola-trader-seller-listing"]'
      
      # Fallback selectors if primary selector doesn't work
      fallback_selectors = [
        '.search-page__results li',
        '.search-results__result',
        'li.search-page__result',
        'li[data-testid="search-card"]',
        'article[data-testid="search-result"]',
        'div.search-listing',
        'li.product-card',
        'div.vehicle-listing',
        'article.advert-card',
        'div.advert',
        'div[class*="search-result"]',
        'div[class*="search-card"]',
        'div[class*="listing-item"]',
        'div[class*="car-item"]'
      ]
      
      urls = []
      
      # First try with the primary selector
      listing_cards = doc.css(primary_selector)
      if listing_cards.any?
        puts "Found #{listing_cards.size} listing cards using primary selector: #{primary_selector}"
        
        listing_cards.each do |card|
          # Try to find links within each card
          links = card.css('a')
          links.each do |link|
            href = link['href']
            next unless href
            
            if href.include?('/car-details/')
              full_url = href.start_with?('/') ? "#{BASE_URL}#{href}" : href
              urls << full_url
            end
          end
        end
      else
        debug("No listings found with primary selector, trying fallback selectors...")
        
        # Try fallback selectors
        fallback_selectors.each do |selector|
          listing_cards = doc.css(selector)
          if listing_cards.any?
            puts "Found #{listing_cards.size} listing cards using fallback selector: #{selector}"
            
            listing_cards.each do |card|
              # Try to find links within each card
              links = card.css('a')
              links.each do |link|
                href = link['href']
                next unless href
                
                if href.include?('/car-details/')
                  full_url = href.start_with?('/') ? "#{BASE_URL}#{href}" : href
                  urls << full_url
                end
              end
            end
            
            break if urls.any?
          end
        end
      end
      
      # If no luck with specific selectors, try a general approach
      if urls.empty?
        puts "No listing cards found with specific selectors, trying general link extraction..."
        
        # Look for all links containing car-details in the href
        doc.css('a').each do |link|
          href = link['href']
          next unless href
          
          if href.include?('/car-details/')
            full_url = href.start_with?('/') ? "#{BASE_URL}#{href}" : href
            urls << full_url
          end
        end
      end
      
      urls = urls.uniq
      
      if urls.empty?
        # If we still can't find URLs, look for script tags containing car details
        debug("No URLs found, searching in script tags...")
        doc.css('script').each do |script|
          content = script.text
          # Look for car detail URLs in JSON or JavaScript
          matches = content.scan(/\"(\/car-details\/[^\"]+)\"/)
          matches.flatten.each do |match|
            urls << "#{BASE_URL}#{match}"
          end
        end
      end
      
      puts "Extracted #{urls.size} unique listing URLs"
      
      # Print some example URLs
      if urls.any? && @debug_enabled
        debug("Sample URLs:")
        urls[0..2].each_with_index do |url, index|
          debug("  #{index+1}. #{url}")
        end
      end
      
      urls
    end
    
    def extract_listing_details(html, url)
      doc = Nokogiri::HTML(html)
      puts "Listing HTML size: #{html.size} bytes, title: #{doc.title}"
      
      # Extract basic information - try multiple selectors
      title_selectors = [
        'h1.advert-heading__title', 
        'h1[data-testid="advert-title"]', 
        'h1.listing-title',
        'h1.vehicle-title',
        'h1.vehicle-header__title',
        'h1'
      ]
      
      title_element = find_element(doc, title_selectors)
      
      unless title_element
        puts "Could not find title element for #{url}"
        return nil
      end
      
      title = title_element.text.strip
      puts "Found title: #{title}"
      
      # Extract price - use specified selector first, then fall back to alternatives
      price_element = doc.at_css('[data-testid="advert-price"]')
      
      # Fall back to alternative selectors if specific one not found
      if price_element.nil?
        price_selectors = [
          'div.advert-price__cash-price', 
          'span.price',
          '[data-testid="price"]',
          '.advert__price',
          '.vehicle-header__price'
        ]
        
        price_element = find_element(doc, price_selectors)
      end
      
      price = price_element ? extract_price(price_element.text.strip) : nil
      puts "Found price: #{price}"
      
      # Extract location - try multiple selectors
      location_selectors = [
        'span.seller-location__town',
        'span[data-testid="seller-location"]',
        'div.vehicle-location',
        '.seller__location',
        '.seller-location'
      ]
      
      location_element = find_element(doc, location_selectors)
      location = location_element ? location_element.text.strip : nil
      puts "Found location: #{location}"
      
      # Extract description - try specific selector first
      description_title = doc.at_css('[data-gui="advert-description-title"]')
      description_element = description_title ? description_title.next_element : nil
      
      # Fall back to alternative selectors if specific one not found
      if description_element.nil?
        description_selectors = [
          'div.advert-description__full-description',
          'div[data-testid="advert-description"]',
          'div.vehicle-description',
          '.description',
          'p.listing-description',
          '.advert__description'
        ]
        
        description_element = find_element(doc, description_selectors)
      end
      
      description = description_element ? description_element.text.strip : nil
      puts "Found description: #{description ? 'Yes (length: ' + description.length.to_s + ')' : 'No'}"
      
      # Extract image URLs - first try the specific selector with atds-image class
      image_elements = doc.css('[class*="atds-image"]')
      
      # If no images found with specific selector, try alternatives
      if image_elements.empty?
        image_selectors = [
          'img.image-gallery__image',
          'img[data-testid="gallery-image"]',
          'img.advert-image',
          'img[src*="images"]',
          'img[src*="media"]'
        ]
        
        image_selectors.each do |selector|
          elements = doc.css(selector)
          if elements.any?
            image_elements = elements
            break
          end
        end
      end
      
      # As a fallback, get all images that might be car photos
      if image_elements.empty?
        image_elements = doc.css('img').select do |img| 
          src = img['src'] || img['data-src'] || ''
          src.include?('car') || src.include?('vehicle') || src.include?('image') || src.include?('photo') || src.include?('media')
        end
      end
      
      # Check for images in data attributes or script tags if nothing found
      if image_elements.empty?
        debug("No images found with selectors, searching in script tags...")
        doc.css('script').each do |script|
          content = script.text
          # Look for image URLs in JSON or JavaScript
          matches = content.scan(/\"(https:\/\/[^\"]+\.(jpg|jpeg|png|webp))\"/)
          if matches.any?
            image_urls = matches.flatten.select { |url| url.end_with?('jpg', 'jpeg', 'png', 'webp') }
            image_elements = image_urls.map { |url| { 'src' => url } }
          end
        end
      end
      
      image_urls = image_elements.map { |img| img.is_a?(Hash) ? img['src'] : (img['src'] || img['data-src']) }.compact
      puts "Found #{image_urls.size} images"
      
      # Extract vehicle details - try multiple selectors
      key_specs_selectors = [
        'ul.key-specifications li',
        'ul.vehicle-specs li',
        'div.specs-list div',
        'ul.listing-key-specs li',
        '.technical-specification li',
        '.key-facts__list li'
      ]
      
      specs = []
      key_specs_selectors.each do |selector|
        elements = doc.css(selector)
        if elements.any?
          specs = elements.map { |spec| spec.text.strip }
          break
        end
      end
      
      puts "Found #{specs.size} specification items"
      
      # Extract date - try multiple selectors
      date_selectors = [
        'span.advert-heading__sub-heading',
        'span[data-testid="listing-date"]',
        'div.listing-date',
        '.advert__published',
        '.vehicle-header__listed-date'
      ]
      
      date_element = find_element(doc, date_selectors)
      date_text = date_element ? date_element.text.strip : nil
      post_date = date_text ? parse_date(date_text) : Date.current
      puts "Found post date: #{post_date}"
      
      # Extract source ID from URL
      source_id = extract_id_from_url(url)
      puts "Extracted source ID: #{source_id}"
      
      {
        source_url: url,
        title: title,
        price: price,
        location: location,
        description: description,
        image_urls: image_urls,
        post_date: post_date,
        source_id: source_id,
        status: 'active',
        specs: specs
      }
    end
    
    def find_element(doc, selectors)
      selectors.each do |selector|
        element = doc.at_css(selector)
        debug("Checking selector: #{selector} - Found: #{!!element}") if @debug_enabled
        return element if element
      end
      nil
    end
    
    def extract_price(price_text)
      return nil unless price_text
      
      # Extract numbers from the price text
      match = price_text.match(/[£$]?([0-9,]+)/)
      return nil unless match
      
      # Remove commas and convert to integer
      match[1].gsub(',', '').to_i
    end
    
    def extract_id_from_url(url)
      return nil unless url
      
      # Extract ID from URL using regex
      match = url.match(/\/car-details\/(\d+)/)
      match ? match[1] : nil
    end
    
    def parse_date(date_text)
      return Date.current unless date_text
      
      # Try to extract date using various patterns
      patterns = [
        /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
        /Added on (\d{1,2})[a-z]{2} (\w+) (\d{4})/i,
        /Added (\d{1,2})[a-z]{2} (\w+) (\d{4})/i,
        /(\d{1,2})[a-z]{2} (\w+) (\d{4})/i,
        /(\w+) (\d{1,2})[a-z]{2}, (\d{4})/i
      ]
      
      patterns.each do |pattern|
        match = date_text.match(pattern)
        if match
          month_names = %w[jan feb mar apr may jun jul aug sep oct nov dec]
          
          day = match[1].to_i
          month = match[2].downcase.include?('jan') ? 1 :
                  match[2].downcase.include?('feb') ? 2 :
                  match[2].downcase.include?('mar') ? 3 :
                  match[2].downcase.include?('apr') ? 4 :
                  match[2].downcase.include?('may') ? 5 :
                  match[2].downcase.include?('jun') ? 6 :
                  match[2].downcase.include?('jul') ? 7 :
                  match[2].downcase.include?('aug') ? 8 :
                  match[2].downcase.include?('sep') ? 9 :
                  match[2].downcase.include?('oct') ? 10 :
                  match[2].downcase.include?('nov') ? 11 :
                  match[2].downcase.include?('dec') ? 12 : 1
          year = match[3].to_i
          
          return Date.new(year, month, day)
        end
      end
      
      # If we can't parse the date, return current date
      Date.current
    end
    
    def save_debug_html(html, filename)
      # Create a tmp directory for debug files if it doesn't exist
      debug_dir = Rails.root.join('tmp', 'debug')
      FileUtils.mkdir_p(debug_dir)
      
      # Save the HTML content to a file
      File.write(debug_dir.join(filename), html)
      puts "Saved debug HTML to tmp/debug/#{filename}"
    rescue => e
      puts "Error saving debug HTML: #{e.message}"
    end
    
    def create_or_update_listing(listing_data)
      return if listing_data[:source_id].blank?
      
      # Find existing listing or create new one
      listing = Listing.find_or_initialize_by(source_id: listing_data[:source_id])
      
      # Update attributes
      listing.assign_attributes(
        source_url: listing_data[:source_url],
        title: listing_data[:title],
        price: listing_data[:price],
        description: listing_data[:description],
        location: listing_data[:location],
        image_urls: listing_data[:image_urls],
        post_date: listing_data[:post_date],
        status: listing_data[:status]
      )
      
      # Add any tags/categories
      if listing_data[:specs].present?
        listing.specs = listing_data[:specs]
      end
      
      # Save the listing
      if listing.save
        puts "Saved listing: #{listing.title}"
      else
        puts "Error saving listing: #{listing.errors.full_messages.join(', ')}"
      end
      
      listing
    end
    
    def enrich_vehicles
      count = 0
      
      # Find listings that don't have an associated vehicle yet
      Listing.where("source_id LIKE '%'").left_joins(:vehicle).where(vehicles: { id: nil }).find_each do |listing|
        vehicle_data = Enrichment::VehicleDataService.extract_from_listing(listing)
        vehicle = listing.create_vehicle(vehicle_data)
        
        puts "Created vehicle for listing ##{listing.id}: #{vehicle.full_name}"
        count += 1
        
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
      
      count
    end
    
    def generate_mot_histories
      count = 0
      
      # Generate MOT histories for vehicles with registration numbers
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
          count += 1
        end
      end
      
      count
    end
  end
end 