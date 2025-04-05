module Api
  module V1
    class SearchesController < Api::BaseController
      def create
        @search = Search.new(
          query: search_params,
          ip_address: request.remote_ip
        )
        
        if @search.save
          @listings = @search.execute.page(params[:page] || 1).per(params[:per_page] || 20)
          
          render json: {
            search_id: @search.id,
            results: @listings.map { |listing| listing_json(listing) },
            meta: {
              total_count: @listings.total_count,
              total_pages: @listings.total_pages,
              current_page: @listings.current_page
            }
          }
        else
          render json: { error: @search.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def recent
        @searches = Search.recent.limit(10)
        
        render json: {
          searches: @searches.map do |search|
            {
              id: search.id,
              query: search.query,
              created_at: search.created_at
            }
          end
        }
      end
      
      def popular
        @popular_searches = Search.popular_in_timeframe(
          params[:days].present? ? params[:days].to_i : 7,
          params[:limit].present? ? params[:limit].to_i : 5
        )
        
        render json: {
          popular_searches: @popular_searches.map do |search|
            {
              query: search.query,
              count: search.count
            }
          end
        }
      end
      
      private
      
      def search_params
        params.require(:search).permit(:keyword, :location, :min_price, :max_price, 
                                     :make, :model, :min_year, :max_year, 
                                     :fuel_type, :transmission).to_h.compact
      end
      
      def listing_json(listing)
        {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          location: listing.location,
          post_date: listing.post_date,
          image_urls: listing.image_urls || []
        }
      end
    end
  end
end 