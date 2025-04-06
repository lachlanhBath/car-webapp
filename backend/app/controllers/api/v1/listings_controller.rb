module Api
  module V1
    class ListingsController < Api::BaseController
      def index
        # Start with active and recent listings, and always include vehicle associations
        @listings = Listing.active.recent.includes(:vehicle)
        
        # Always join with vehicles and filter to only include listings with vehicles
        @listings = @listings.joins(:vehicle).where.not(vehicles: { id: nil })
        
        # Apply all filters
        
        # Title/keyword filters
        if params[:keyword].present?
          @listings = @listings.where('title ILIKE ?', "%#{params[:keyword]}%")
        end
        
        # Price filters - with explicit table name to avoid ambiguity
        if params[:min_price].present? && params[:max_price].present?
          @listings = @listings.where('listings.price BETWEEN ? AND ?', params[:min_price].to_f, params[:max_price].to_f)
        elsif params[:min_price].present?
          @listings = @listings.where('listings.price >= ?', params[:min_price].to_f)
        elsif params[:max_price].present?
          @listings = @listings.where('listings.price <= ?', params[:max_price].to_f)
        end
        
        # Location filters
        if params[:location].present?
          @listings = @listings.where('listings.location ILIKE ?', "%#{params[:location]}%")
        end
        
        # Vehicle make filter
        if params[:make].present?
          @listings = @listings.where('vehicles.make ILIKE ?', "%#{params[:make]}%")
        end
        
        # Vehicle model filter
        if params[:model].present?
          @listings = @listings.where('vehicles.model ILIKE ?', "%#{params[:model]}%")
        end
        
        # Vehicle year filters
        if params[:year_from].present? && params[:year_to].present?
          @listings = @listings.where('vehicles.year BETWEEN ? AND ?', params[:year_from].to_i, params[:year_to].to_i)
        elsif params[:year_from].present?
          @listings = @listings.where('vehicles.year >= ?', params[:year_from].to_i)
        elsif params[:year_to].present?
          @listings = @listings.where('vehicles.year <= ?', params[:year_to].to_i)
        end
        
        # Vehicle fuel type filter
        if params[:fuel_type].present?
          @listings = @listings.where('vehicles.fuel_type ILIKE ?', "%#{params[:fuel_type]}%")
        end
        
        # Vehicle transmission filter
        if params[:transmission].present?
          @listings = @listings.where('vehicles.transmission ILIKE ?', "%#{params[:transmission]}%")
        end
        
        # Save search if parameters exist
        save_search if search_params_present?
        
        # Pagination
        @listings = @listings.page(params[:page] || 1).per(params[:per_page] || 20)
        
        # Count results before rendering
        total_count = @listings.total_count
        
        render json: {
          listings: @listings.map { |listing| listing_json(listing) },
          meta: {
            total_count: total_count,
            total_pages: @listings.total_pages,
            current_page: @listings.current_page
          }
        }
      end
      
      def show
        @listing = Listing.includes(:vehicle).find(params[:id])
        
        # Return 404 if listing doesn't have an associated vehicle
        if @listing.vehicle.nil?
          render json: { error: "Listing with complete vehicle information not found" }, status: :not_found
          return
        end
        
        render json: listing_json(@listing, detailed: true)
      end
      
      def process_url
        # Validate URL is present and is an Autotrader URL
        unless params[:url].present?
          render json: { error: "URL is required" }, status: :bad_request
          return
        end
        
        url = params[:url].to_s.strip
        
        # Check if it's a valid Autotrader URL
        unless url.match?(/https?:\/\/(?:www\.)?autotrader\.co\.uk\/car-details\//)
          render json: { error: "Invalid Autotrader URL" }, status: :bad_request
          return
        end
        
        # Extract the listing ID from the URL
        source_id = url.match(/\/car-details\/(\d+)/)[1] rescue nil
        
        # Check if we already have this listing
        if source_id.present?
          existing_listing = Listing.find_by(source_id: source_id)
          if existing_listing
            # If the listing already exists, return it
            render json: { 
              success: true, 
              listing_id: existing_listing.id,
              message: "Listing already exists in database",
              processing: true
            }
            return
          end
        else
          render json: { error: "Invalid Autotrader URL format" }, status: :bad_request
          return
        end
        
        begin
          # Initialize the headless scraper
          scraper = Scrapers::AutotraderHeadlessScraper.new(debug: Rails.env.development?)
          
          # Scrape the URL
          result = scraper.scrape_autotrader_url(url)
          
          if result[:success]
            render json: { 
              success: true, 
              listing_id: result[:listing_id],
              message: result[:message],
              processing: true
            }
          else
            # If scraping failed but we have a valid source_id, try to create a minimal listing
            if source_id.present?
              # Create a basic listing with just the source ID and URL
              listing = Listing.create(
                source_id: source_id,
                source_url: url,
                title: "Autotrader Listing #{source_id}",
                status: "active",
                post_date: Date.current
              )
              
              if listing.persisted?
                # Start the processing pipeline
                ProcessListingImagesJob.perform_later(listing.id)
                
                render json: { 
                  success: true, 
                  listing_id: listing.id,
                  message: "Created basic listing from URL. Processing started.",
                  processing: true
                }
              else
                render json: { 
                  success: false, 
                  error: "Failed to create listing: #{listing.errors.full_messages.join(', ')}" 
                }, status: :unprocessable_entity
              end
            else
              render json: { 
                success: false, 
                error: result[:message] 
              }, status: :unprocessable_entity
            end
          end
        rescue => e
          # Last chance fallback - if there was an exception but we have a source_id
          if source_id.present?
            # Check if the listing was created despite the error
            listing = Listing.find_by(source_id: source_id)
            
            if listing
              # Start the processing pipeline
              ProcessListingImagesJob.perform_later(listing.id)
              
              render json: { 
                success: true, 
                listing_id: listing.id,
                message: "Listing found despite errors. Processing started.",
                processing: true
              }
              return
            end
            
            # Try to create a minimal listing
            begin
              listing = Listing.create(
                source_id: source_id,
                source_url: url,
                title: "Autotrader Listing #{source_id}",
                status: "active",
                post_date: Date.current
              )
              
              if listing.persisted?
                # Start the processing pipeline
                ProcessListingImagesJob.perform_later(listing.id)
                
                render json: { 
                  success: true, 
                  listing_id: listing.id,
                  message: "Created fallback listing after error. Processing started.",
                  processing: true
                }
                return
              end
            rescue => create_error
              Rails.logger.error("Failed to create fallback listing: #{create_error.message}")
            end
          end
          
          # If all else fails, return the error
          Rails.logger.error("Error processing URL: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          
          render json: { 
            success: false, 
            error: "Error processing URL: #{e.message}" 
          }, status: :unprocessable_entity
        end
      end
      
      def check_processing_status
        # This endpoint is used by the frontend to check if a vehicle is fully processed
        listing = Listing.includes(:vehicle).find(params[:id])
        
        unless listing
          render json: { error: "Listing not found" }, status: :not_found
          return
        end
        
        if listing.vehicle.nil?
          render json: { 
            processing: true,
            status: "Processing - waiting for vehicle data" 
          }
          return
        end
        
        # Check if the vehicle has been fully processed
        # A fully processed vehicle will have purchase_summary present
        if listing.vehicle.purchase_summary.present?
          render json: { 
            processing: false,
            status: "Complete",
            vehicle_id: listing.vehicle.id,
            listing_id: listing.id
          }
        else
          render json: { 
            processing: true,
            status: "Processing - enriching vehicle data" 
          }
        end
      end
      
      private
      
      def vehicle_filters_present?
        params[:make].present? || params[:model].present? || 
        params[:year_from].present? || params[:year_to].present? ||
        params[:fuel_type].present? || params[:transmission].present?
      end
      
      def vehicle_filter_params
        params.slice(:make, :model, :year_from, :year_to, :fuel_type, :transmission)
              .compact_blank
      end
      
      def listing_json(listing, detailed: false)
        json = {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          location: listing.location,
          post_date: listing.post_date,
          image_urls: listing.image_urls || []
        }
        
        if listing.vehicle.present?
          json[:vehicle] = {
            make: listing.vehicle.make,
            model: listing.vehicle.model,
            year: listing.vehicle.year,
            fuel_type: listing.vehicle.fuel_type,
            transmission: listing.vehicle.transmission,
            mileage: listing.vehicle.mileage,
            purchase_summary: listing.vehicle.purchase_summary,
            registration: listing.vehicle.registration,
            registration_source: listing.vehicle.registration_source,
            mot_status: listing.vehicle.mot_status,
            mot_expiry_date: listing.vehicle.mot_expiry_date,
            mot_repair_estimate: listing.vehicle.mot_repair_estimate,
            expected_lifetime: listing.vehicle.expected_lifetime,
            original_purchase_price: listing.vehicle.original_purchase_price
          }
        end
        
        if detailed
          json[:description] = listing.description
          json[:source_url] = listing.source_url
          
          if listing.vehicle.present?
            json[:vehicle].merge!({
              engine_size: listing.vehicle.engine_size,
              color: listing.vehicle.color,
              body_type: listing.vehicle.body_type,
              doors: listing.vehicle.doors,
              vin: listing.vehicle.vin
            })
          end
        end
        
        json
      end
      
      def search_params_present?
        params[:keyword].present? || params[:min_price].present? || 
        params[:max_price].present? || params[:location].present? ||
        vehicle_filters_present?
      end
      
      def save_search
        Search.create(
          query: {
            keyword: params[:keyword],
            min_price: params[:min_price],
            max_price: params[:max_price],
            location: params[:location],
            make: params[:make],
            model: params[:model],
            year_from: params[:year_from],
            year_to: params[:year_to],
            fuel_type: params[:fuel_type],
            transmission: params[:transmission]
          }.compact,
          ip_address: request.remote_ip
        )
      end
    end
  end
end 