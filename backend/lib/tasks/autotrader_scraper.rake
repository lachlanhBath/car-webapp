namespace :autotrader do
  desc "Scrape Autotrader listings with options: POSTCODE, MAX_PAGES, MAX_LISTINGS, CAR_URL, DEBUG, HEADLESS"
  task scrape: :environment do
    require "logger"

    postcode = ENV["POSTCODE"] || "SW1A 1AA"
    max_pages = (ENV["MAX_PAGES"] || 2).to_i
    max_listings = (ENV["MAX_LISTINGS"] || 10).to_i
    debug_enabled = ENV["DEBUG"] == "true"
    headless_enabled = ENV["HEADLESS"] == "true"

    puts "Starting Autotrader scraper with options:"
    puts "  Postcode: #{postcode}"
    puts "  Max pages: #{max_pages}"
    puts "  Max listings: #{max_listings}"
    puts "  Debug mode: #{debug_enabled}"
    puts "  Headless browser: #{headless_enabled}"

    begin
      # Create a logger if debug mode is enabled
      logger = nil
      if debug_enabled
        log_dir = Rails.root.join("log")
        FileUtils.mkdir_p(log_dir) unless File.directory?(log_dir)
        logger = Logger.new(File.join(log_dir, "autotrader_scraper.log"))
        logger.level = Logger::DEBUG
      end

      # Initialize the appropriate scraper based on headless mode
      scraper = if headless_enabled
        Scrapers::AutotraderHeadlessScraper.new(logger: logger, debug: debug_enabled)
      else
        Scrapers::AutotraderScraper.new(logger: logger, debug: debug_enabled)
      end

      start_time = Time.now

      # Run the scraper with the specified options
      result = scraper.scrape_listings(
        postcode: postcode,
        max_pages: max_pages,
        max_listings: max_listings
      )

      end_time = Time.now
      duration = (end_time - start_time).round(2)

      # Print results
      puts "\nScraping completed in #{duration} seconds"
      puts "  #{result[:listings_scraped]} listings scraped"
      puts "  #{result[:vehicles_enriched]} vehicles enriched"
      puts "  #{result[:mot_histories_generated]} MOT histories generated"
    rescue => e
      puts "Error: #{e.message}"
      puts e.backtrace.join("\n") if debug_enabled
    end
  end

  desc "Scrape a single Autotrader listing by URL"
  task scrape_url: :environment do
    require "logger"

    car_url = ENV["CAR_URL"]
    debug_enabled = ENV["DEBUG"] == "true"
    headless_enabled = ENV["HEADLESS"] == "true"

    if car_url.blank?
      puts "Error: CAR_URL environment variable is required"
      exit 1
    end

    puts "Starting Autotrader URL scraper with options:"
    puts "  URL: #{car_url}"
    puts "  Debug mode: #{debug_enabled}"
    puts "  Headless browser: #{headless_enabled}"

    begin
      # Create a logger if debug mode is enabled
      logger = nil
      if debug_enabled
        log_dir = Rails.root.join("log")
        FileUtils.mkdir_p(log_dir) unless File.directory?(log_dir)
        logger = Logger.new(File.join(log_dir, "autotrader_scraper.log"))
        logger.level = Logger::DEBUG
      end

      # Initialize the appropriate scraper based on headless mode
      scraper = if headless_enabled
        Scrapers::AutotraderHeadlessScraper.new(logger: logger, debug: debug_enabled)
      else
        Scrapers::AutotraderScraper.new(logger: logger, debug: debug_enabled)
      end

      start_time = Time.now

      # Run the scraper with the specified URL
      result = scraper.scrape_single_listing(car_url)

      end_time = Time.now
      duration = (end_time - start_time).round(2)

      # Print results
      puts "\nScraping completed in #{duration} seconds"
      puts "  #{result[:listings_scraped]} listing scraped"
      puts "  #{result[:vehicles_enriched]} vehicles enriched"
      puts "  #{result[:mot_histories_generated]} MOT histories generated"
    rescue => e
      puts "Error: #{e.message}"
      puts e.backtrace.join("\n") if debug_enabled
    end
  end
  
  desc "Test transmission extraction from a single Autotrader listing URL"
  task test_transmission: :environment do
    require "logger"
    
    car_url = ENV["CAR_URL"]
    debug_enabled = true
    
    if car_url.blank?
      puts "Error: CAR_URL environment variable is required"
      exit 1
    end
    
    puts "Testing transmission extraction from URL: #{car_url}"
    
    begin
      # Create a logger to record details
      log_dir = Rails.root.join("log")
      FileUtils.mkdir_p(log_dir) unless File.directory?(log_dir)
      logger = Logger.new(File.join(log_dir, "transmission_test.log"))
      logger.level = Logger::DEBUG
      
      # Initialize the standard scraper (no headless) for better debugging
      scraper = Scrapers::AutotraderScraper.new(logger: logger, debug: true)
      
      # Fetch the page HTML
      html = scraper.send(:fetch_page, car_url)
      
      if html.blank?
        puts "Error: Failed to fetch HTML from URL"
        exit 1
      end
      
      # Parse the HTML to extract the document
      doc = Nokogiri::HTML(html)
      
      # Look for divs with text containing 'Gearbox'
      gearbox_divs = doc.css('div').select { |div| div.text.include?('Gearbox') }
      
      puts "Found #{gearbox_divs.size} divs containing 'Gearbox' text"
      
      gearbox_divs.each_with_index do |div, index|
        puts "Div ##{index+1} text: #{div.text.strip}"
        puts "Div ##{index+1} HTML: #{div.to_html[0..200]}..."
        
        # Check for spans within this div
        spans = div.css('span')
        puts "  Found #{spans.size} spans in this div"
        
        spans.each_with_index do |span, span_index|
          puts "  Span ##{span_index+1} text: #{span.text.strip}"
          puts "  Span ##{span_index+1} class: #{span['class']}"
          puts "  Span ##{span_index+1} data-testid: #{span['data-testid']}"
        end
      end
      
      # Now attempt to extract the transmission using our regular method
      transmission = nil
      
      # Try method 1: Look for the specific structure
      doc.css('div').each do |div|
        term_span = div.at_css('span.term_details, span:contains("Gearbox")')
        if term_span && term_span.text.strip == 'Gearbox'
          value_span = div.at_css('span[data-testid="details"], span.value_details')
          if value_span
            transmission = value_span.text.strip
            puts "\nFound transmission using exact structure: #{transmission}"
            break
          end
        end
      end
      
      # Try method 2: More general approach
      if transmission.nil?
        doc.css('div, span, p').each do |element|
          if element.text.include?('Gearbox')
            value_element = element.next_element || element.at_css('span')
            if value_element && ['Manual', 'Automatic', 'Semi-Auto', 'CVT', 'DSG'].any? { |t| value_element.text.include?(t) }
              transmission = value_element.text.strip
              puts "\nFound transmission from general selector: #{transmission}"
              break
            end
          end
        end
      end
      
      # Try method 3: Look in specs lists
      if transmission.nil?
        details_selectors = [
          'ul.key-specifications li',
          'ul.vehicle-specs li',
          'div.specs-list div',
          'div[class*="key-specifications"] li',
          'div[class*="specs"] li',
          'div[class*="details"] li'
        ]
        
        details_selectors.each do |selector|
          doc.css(selector).each do |item|
            if item.text.include?('Gearbox') || item.text.include?('Transmission')
              item.css('span').each do |span|
                if ['Manual', 'Automatic', 'Semi-Auto', 'CVT', 'DSG'].any? { |t| span.text.include?(t) }
                  transmission = span.text.strip
                  puts "\nFound transmission from specs list: #{transmission}"
                  break
                end
              end
              break if transmission
            end
          end
          break if transmission
        end
      end
      
      puts "\nFinal transmission value: #{transmission || 'Not found'}"
      
      # Save the full HTML for examination if needed
      debug_dir = Rails.root.join('tmp', 'debug')
      FileUtils.mkdir_p(debug_dir)
      listing_id = car_url.match(/\/car-details\/(\d+)/)&.[](1) || 'unknown'
      file_path = debug_dir.join("transmission_test_#{listing_id}.html")
      File.write(file_path, html)
      puts "Saved full HTML to #{file_path} for further examination"
      
    rescue => e
      puts "Error: #{e.message}"
      puts e.backtrace.join("\n")
    end
  end

  desc "Clear Autotrader scraped data"
  task clear: :environment do
    puts "Clearing Autotrader scraped data..."
    Listing.where("source_id LIKE '%'").destroy_all
    puts "Data cleared."
  end
end
