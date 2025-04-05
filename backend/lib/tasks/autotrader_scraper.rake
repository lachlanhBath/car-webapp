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

  desc "Clear Autotrader scraped data"
  task clear: :environment do
    puts "Clearing Autotrader scraped data..."
    Listing.where("source_id LIKE '%'").destroy_all
    puts "Data cleared."
  end
end
