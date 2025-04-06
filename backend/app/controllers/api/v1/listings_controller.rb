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