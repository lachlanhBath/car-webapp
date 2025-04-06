require "selenium-webdriver"
require "webdrivers/chromedriver"

module Scrapers
  class AutotraderHeadlessScraper < AutotraderScraper
    BASE_URL = "https://www.autotrader.co.uk".freeze
    SEARCH_PATH = "/car-search".freeze

    def initialize(logger: nil, debug: false)
      super
      @driver = nil
    end

    def scrape_listings(options = {})
      postcode = options[:postcode] || "SW1A 1AA"
      max_pages = options[:max_pages] || 2
      max_listings = options[:max_listings] || 10

      start_browser

      listings_scraped = 0
      urls = []

      puts "Starting scraping with Selenium headless browser..."

      # Scrape listing URLs from search pages
      (1..max_pages).each do |page|
        break if urls.size >= max_listings

        # Construct search URL with parameters
        search_url = "#{BASE_URL}#{SEARCH_PATH}?postcode=#{postcode.tr(" ", "+")}&advertising-location=at_cars&page=#{page}"
        puts "Scraping search page #{page}: #{search_url}"

        begin
          @driver.navigate.to(search_url)

          # Wait for the listings to load (the key selector specified by user)
          wait = Selenium::WebDriver::Wait.new(timeout: 15)
          begin
            wait.until { @driver.find_elements(css: '[data-testid="ola-trader-seller-listing"]').size > 0 }
          rescue Selenium::WebDriver::Error::TimeoutError
            puts "Timeout waiting for listings to load on page #{page}. Checking for other selectors..."
          end

          # Save the full HTML for debugging
          if @debug_enabled
            save_debug_html("search_page_#{page}.html", @driver.page_source)
          end

          # Extract listing URLs using primary selector
          page_urls = []
          listing_cards = @driver.find_elements(css: '[data-testid="ola-trader-seller-listing"]')
          puts "Found #{listing_cards.size} listing cards on page #{page} using primary selector"

          # Handle case where primary selector doesn't find elements
          if listing_cards.empty?
            puts "Primary selector found no listings, trying fallback selectors..."

            # Try fallback selectors
            fallback_selectors = [
              ".search-page__results li",
              ".search-results__result",
              "li.search-page__result",
              'li[data-testid="search-card"]',
              'article[data-testid="search-result"]',
              "div.search-listing",
              "li.product-card",
              "div.vehicle-listing",
              "article.advert-card"
            ]

            fallback_selectors.each do |selector|
              elements = @driver.find_elements(css: selector)
              if elements.any?
                puts "Found #{elements.size} cards using fallback selector: #{selector}"
                listing_cards = elements
                break
              end
            rescue => e
              puts "Error with selector #{selector}: #{e.message}"
            end
          end

          # Process all cards we found
          if listing_cards.any?
            listing_cards.each do |card|
              # Find links within each card

              links = card.find_elements(tag_name: "a")
              links.each do |link|
                href = link.attribute("href")
                next unless href && href.include?("/car-details/")

                page_urls << href unless page_urls.include?(href)
              rescue => e
                puts "Error getting href from link: #{e.message}"
              end
            rescue => e
              puts "Error finding links in card: #{e.message}"
            end
          else
            # Last resort - get all links on the page
            puts "No listing cards found with any selectors, getting all links..."
            begin
              all_links = @driver.find_elements(tag_name: "a")
              all_links.each do |link|
                href = link.attribute("href")
                next unless href && href.include?("/car-details/")

                page_urls << href unless page_urls.include?(href)
              rescue => e
                puts "Error processing generic link: #{e.message}"
              end
            rescue => e
              puts "Error getting all links: #{e.message}"
            end
          end

          # Add unique URLs to our collection
          page_urls.uniq!
          puts "Found #{page_urls.size} unique car detail URLs on page #{page}"

          # Add to main URL collection, respecting max_listings
          remaining = max_listings - urls.size
          urls += page_urls.first(remaining)

          puts "Added #{[page_urls.size, remaining].min} URLs from page #{page}, total: #{urls.size}/#{max_listings}"

          # Break if we've collected enough URLs
          break if urls.size >= max_listings
        rescue => e
          puts "Error scraping search page #{page}: #{e.message}"
          debug(e.backtrace.join("\n"))
        end
      end

      puts "Found #{urls.size} unique listing URLs across all pages"

      # Process each listing URL
      urls.each_with_index do |url, index|
        puts "Processing listing #{index + 1}/#{urls.size}: #{url}"

        result = scrape_single_url(url)
        if result
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

      # Generate vehicle data and MOT histories
      vehicles_enriched = enrich_vehicles
      mot_histories_generated = generate_mot_histories

      # Clean up
      stop_browser

      {
        listings_scraped: listings_scraped,
        vehicles_enriched: vehicles_enriched,
        mot_histories_generated: mot_histories_generated
      }
    end

    def scrape_single_listing(url)
      start_browser

      begin
        result = scrape_single_url(url)

        # Generate vehicle data and MOT histories
        vehicles_enriched = enrich_vehicles
        mot_histories_generated = generate_mot_histories

        stop_browser

        {
          listings_scraped: result ? 1 : 0,
          vehicles_enriched: vehicles_enriched,
          mot_histories_generated: mot_histories_generated
        }
      rescue => e
        stop_browser
        puts "Error scraping URL #{url}: #{e.message}"
        debug(e.backtrace.join("\n"))

        {
          listings_scraped: 0,
          vehicles_enriched: 0,
          mot_histories_generated: 0
        }
      end
    end

    private

    def start_browser
      puts "Starting headless Chrome browser..."

      options = Selenium::WebDriver::Chrome::Options.new
      options.add_argument("--headless")
      options.add_argument("--disable-gpu")
      options.add_argument("--no-sandbox")
      options.add_argument("--disable-dev-shm-usage")
      options.add_argument("--window-size=1920,1080")
      options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36")

      # Try to find Chrome binary in common locations for WSL
      chrome_paths = [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
        "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
      ]

      chrome_path = nil
      chrome_paths.each do |path|
        if File.exist?(path)
          chrome_path = path
          puts "Found Chrome at: #{chrome_path}"
          break
        end
      end

      if chrome_path
        options.add_argument("--binary=#{chrome_path}")
        # Set the binary location explicitly
        options.binary = chrome_path
      else
        puts "Warning: Chrome binary not found in common locations."
        puts "Please install Chrome with: sudo apt update && sudo apt install -y google-chrome-stable"
        puts "Or set the CHROME_PATH environment variable to point to your Chrome executable."

        # Check if CHROME_PATH environment variable is set
        if ENV["CHROME_PATH"] && File.exist?(ENV["CHROME_PATH"])
          chrome_path = ENV["CHROME_PATH"]
          puts "Using Chrome from CHROME_PATH: #{chrome_path}"
          options.add_argument("--binary=#{chrome_path}")
          options.binary = chrome_path
        end
      end

      begin
        @driver = Selenium::WebDriver.for :chrome, options: options
        @driver.manage.timeouts.implicit_wait = 10
      rescue => e
        puts "Error starting Chrome browser: #{e.message}"
        puts "Full error details: #{e.class.name} - #{e.backtrace.join("\n")}"
        puts "\nTrying to use a different approach for WSL environments..."

        # Try a more WSL-friendly approach
        begin
          require "webdrivers"
          Webdrivers.install_dir = File.expand_path("~/.webdrivers")

          options = Selenium::WebDriver::Chrome::Options.new
          options.add_argument("--headless")
          options.add_argument("--disable-gpu")
          options.add_argument("--no-sandbox")
          options.add_argument("--disable-dev-shm-usage")

          @driver = Selenium::WebDriver.for :chrome, options: options
          @driver.manage.timeouts.implicit_wait = 10
          puts "Successfully started Chrome using webdrivers!"
        rescue => e2
          puts "Second attempt also failed: #{e2.message}"
          puts "Unable to start headless Chrome. Please ensure Chrome is installed on your system."
          puts "If you're using WSL, you may need to install Chrome with: sudo apt update && sudo apt install -y google-chrome-stable"
          puts "Alternatively, try running the scraper without the HEADLESS option."
          raise "Failed to start Chrome browser. Try running without HEADLESS=true or install Chrome on your system."
        end
      end
    end

    def stop_browser
      return unless @driver

      puts "Closing browser..."
      @driver.quit
      @driver = nil
    end

    def scrape_single_url(url)
      puts "Navigating to: #{url}"
      @driver.navigate.to(url)

      # Wait for the page to load
      wait = Selenium::WebDriver::Wait.new(timeout: 15)
      begin
        # Wait for title element to be present
        wait.until { @driver.find_element(tag_name: "h1").displayed? }
      rescue Selenium::WebDriver::Error::TimeoutError
        puts "Timeout waiting for page to load: #{url}"
        # Continue anyway, we'll check content below
      end

      # Save the HTML for debugging
      if @debug_enabled
        listing_id = extract_id_from_url(url)
        save_debug_html("listing_single_#{listing_id}.html", @driver.page_source)
      end

      # Parse the HTML with Nokogiri
      doc = Nokogiri::HTML(@driver.page_source)

      # Extract basic information
      puts "Extracting details from #{url}"

      # Title - try multiple selectors
      title_element = find_element_in_doc(doc, [
        'h1[data-testid="advert-title"]',
        "h1.advert-heading__title",
        "h1.listing-title",
        "h1"
      ])

      unless title_element
        puts "Could not find title element for #{url}"
        return false
      end

      title = title_element.text.strip
      puts "Found title: #{title}"

      # Price using specific selector
      price_element = doc.at_css('[data-testid="advert-price"]')
      if price_element.nil?
        # Fallback selectors
        price_element = find_element_in_doc(doc, [
          "div.advert-price__cash-price",
          "span.price",
          '[data-testid="price"]'
        ])
      end

      price = price_element ? extract_price(price_element.text.strip) : nil
      puts "Found price: #{price}"

      # Location
      location_element = find_element_in_doc(doc, [
        "span.seller-location__town",
        'span[data-testid="seller-location"]',
        "div.vehicle-location"
      ])

      location = location_element ? location_element.text.strip : nil
      puts "Found location: #{location}"

      # Extract transmission from Gearbox field
      transmission = nil

      # First try using the exact structure provided
      # Look for div containing a span with text "Gearbox" and another span with data-testid="details"
      doc.css("div").each do |div|
        term_span = div.at_css('span.term_details, span:contains("Gearbox")')
        if term_span && term_span.text.strip == "Gearbox"
          value_span = div.at_css('span[data-testid="details"], span.value_details')
          if value_span
            transmission = value_span.text.strip
            puts "Found transmission using exact structure: #{transmission}"
            break
          end
        end
      end

      # If not found, try more general selectors
      if transmission.nil?
        # Look for any div with Gearbox text and a value nearby
        doc.css("div, span, p").each do |element|
          if element.text.include?("Gearbox")
            # Look for the next element or child element with value
            value_element = element.next_element || element.at_css("span")
            if value_element && ["Manual", "Automatic", "Semi-Auto", "CVT", "DSG"].any? { |t| value_element.text.include?(t) }
              transmission = value_element.text.strip
              puts "Found transmission from general selector: #{transmission}"
              break
            end
          end
        end
      end

      # If still not found, try looking for key-value pairs in specs/details
      if transmission.nil?
        details_selectors = [
          "ul.key-specifications li",
          "ul.vehicle-specs li",
          "div.specs-list div",
          'div[class*="key-specifications"] li',
          'div[class*="specs"] li',
          'div[class*="details"] li'
        ]

        details_selectors.each do |selector|
          doc.css(selector).each do |item|
            if item.text.include?("Gearbox") || item.text.include?("Transmission")
              item.css("span").each do |span|
                if ["Manual", "Automatic", "Semi-Auto", "CVT", "DSG"].any? { |t| span.text.include?(t) }
                  transmission = span.text.strip
                  puts "Found transmission from specs list: #{transmission}"
                  break
                end
              end
              break if transmission
            end
          end
          break if transmission
        end
      end

      puts "Final transmission value: #{transmission || "Not found"}"

      # Description using specific selector
      description_title = doc.at_css('[data-gui="advert-description-title"]')
      description_element = description_title ? description_title.next_element : nil

      # Fallback if specific selector not found
      if description_element.nil?
        description_element = find_element_in_doc(doc, [
          "div.advert-description__full-description",
          'div[data-testid="advert-description"]',
          "div.vehicle-description"
        ])
      end

      description = description_element ? description_element.text.strip : nil
      puts "Found description: #{description ? "Yes (length: " + description.length.to_s + ")" : "No"}"

      # Images using specific selector
      image_elements = doc.css('[class*="atds-image"]')

      # Fallback selectors if specific one not found
      if image_elements.empty?
        image_elements = []
        [
          "img.image-gallery__image",
          'img[data-testid="gallery-image"]',
          "img.advert-image",
          'img[src*="images"]'
        ].each do |selector|
          elements = doc.css(selector)
          if elements.any?
            image_elements = elements
            break
          end
        end
      end

      image_urls = image_elements.map { |img| img["src"] || img["data-src"] }.compact
      puts "Found #{image_urls.size} images"

      # Extract vehicle details
      specs = []
      [
        "ul.key-specifications li",
        "ul.vehicle-specs li",
        "div.specs-list div"
      ].each do |selector|
        elements = doc.css(selector)
        if elements.any?
          specs = elements.map { |spec| spec.text.strip }
          break
        end
      end

      puts "Found #{specs.size} specification items"

      # Extract date
      date_element = find_element_in_doc(doc, [
        "span.advert-heading__sub-heading",
        'span[data-testid="listing-date"]',
        "div.listing-date"
      ])

      date_text = date_element ? date_element.text.strip : nil
      post_date = date_text ? parse_date(date_text) : Date.current
      puts "Found post date: #{post_date}"

      # Extract source ID from URL
      source_id = extract_id_from_url(url)
      puts "Extracted source ID: #{source_id}"

      # Create or update the listing in the database
      listing_data = {
        source_url: url,
        title: title,
        price: price,
        location: location,
        description: description,
        image_urls: image_urls,
        post_date: post_date,
        source_id: source_id,
        status: "active",
        specs: specs,
        transmission: transmission
      }

      create_or_update_listing(listing_data)

      true
    end

    def find_element_in_doc(doc, selectors)
      selectors.each do |selector|
        element = doc.at_css(selector)
        return element if element
      end
      nil
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
        status: listing_data[:status],
        transmission: listing_data[:transmission] # Store transmission on the listing as well
      )
      
      # Add any tags/categories
      if listing_data[:specs].present?
        listing.specs = listing_data[:specs]
      end

      listing.save
    end
  end
end
