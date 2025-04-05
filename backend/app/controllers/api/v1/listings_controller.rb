module Api
  module V1
    class ListingsController < Api::BaseController
      def index
        @listings = Listing.active.recent.includes(:vehicle)
        
        # Apply filters if provided
        if params[:keyword].present?
          @listings = @listings.where('title ILIKE ?', "%#{params[:keyword]}%")
        end
        
        if params[:min_price].present? && params[:max_price].present?
          @listings = @listings.price_range(params[:min_price], params[:max_price])
        end
        
        if params[:location].present?
          @listings = @listings.where('location ILIKE ?', "%#{params[:location]}%")
        end
        
        # Save search if parameters exist
        save_search if search_params_present?
        
        # Pagination
        @listings = @listings.page(params[:page] || 1).per(params[:per_page] || 20)
        
        render json: {
          listings: @listings.map { |listing| listing_json(listing) },
          meta: {
            total_count: @listings.total_count,
            total_pages: @listings.total_pages,
            current_page: @listings.current_page
          }
        }
      end
      
      def show
        @listing = Listing.includes(:vehicle).find(params[:id])
        render json: listing_json(@listing, detailed: true)
      end
      
      private
      
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
            transmission: listing.vehicle.transmission
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
              registration: listing.vehicle.registration,
              vin: listing.vehicle.vin
            })
          end
        end
        
        json
      end
      
      def search_params_present?
        params[:keyword].present? || params[:min_price].present? || 
        params[:max_price].present? || params[:location].present?
      end
      
      def save_search
        Search.create(
          query: {
            keyword: params[:keyword],
            min_price: params[:min_price],
            max_price: params[:max_price],
            location: params[:location]
          }.compact,
          ip_address: request.remote_ip
        )
      end
    end
  end
end 