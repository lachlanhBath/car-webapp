# Rails API Routes Configuration

This document outlines how to configure the Rails routes for our car listing API based on the OpenAPI specification.

## Overview

The API follows RESTful principles and uses a versioned URL structure (`/api/v1`) to ensure backward compatibility as the API evolves.

## Namespace Structure

All API routes should be defined within a proper namespace structure:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Resources defined below
    end
  end
end
```

## API Routes Implementation

Here's the complete routes configuration for our API:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Listings
      resources :listings, only: [:index, :show]
      
      # Vehicles
      resources :vehicles, only: [:show] do
        collection do
          post :lookup, to: 'vehicles#lookup_by_registration'
        end
        
        member do
          get :mot_histories
        end
      end
      
      # Searches
      resources :searches, only: [:create] do
        collection do
          get :recent
        end
      end
    end
  end
end
```

## Controller Structure

The controllers should be organized to match the namespace structure:

```
app/controllers/
├── application_controller.rb
└── api/
    ├── base_controller.rb
    └── v1/
        ├── listings_controller.rb
        ├── vehicles_controller.rb
        └── searches_controller.rb
```

## Base API Controller

Create a base controller for all API controllers to inherit from:

```ruby
# app/controllers/api/base_controller.rb
module Api
  class BaseController < ApplicationController
    # Skip CSRF protection for API endpoints
    skip_before_action :verify_authenticity_token
    
    # Set JSON as the default response format
    respond_to :json
    
    # Common error handling for API controllers
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActionController::ParameterMissing, with: :bad_request
    rescue_from StandardError, with: :server_error
    
    private
    
    def not_found(exception)
      render_error('resource_not_found', exception.message, :not_found)
    end
    
    def bad_request(exception)
      render_error('invalid_request', exception.message, :bad_request)
    end
    
    def server_error(exception)
      # Log the error for internal debugging
      Rails.logger.error(exception.message)
      Rails.logger.error(exception.backtrace.join("\n"))
      
      render_error('server_error', 'An unexpected error occurred', :internal_server_error)
    end
    
    def render_error(code, message, status)
      render json: {
        status: 'error',
        error: {
          code: code,
          message: message
        }
      }, status: status
    end
    
    def render_success(data, status = :ok)
      render json: {
        status: 'success',
        data: data
      }, status: status
    end
  end
end
```

## Controller Implementations

### Listings Controller

```ruby
# app/controllers/api/v1/listings_controller.rb
module Api
  module V1
    class ListingsController < Api::BaseController
      def index
        listings = apply_filters(Listing.all)
                    .includes(:vehicle)
                    .order(order_params)
                    .page(page_params[:page])
                    .per(page_params[:per_page])
        
        render_success({
          listings: listings_json(listings),
          pagination: pagination_json(listings)
        })
      end
      
      def show
        listing = Listing.includes(vehicle: :mot_histories).find(params[:id])
        
        render_success({ listing: listing_detail_json(listing) })
      end
      
      private
      
      def apply_filters(scope)
        scope = scope.joins(:vehicle) if vehicle_filter_params.any?
        
        # Apply price filters
        scope = scope.where('price >= ?', filter_params[:min_price]) if filter_params[:min_price].present?
        scope = scope.where('price <= ?', filter_params[:max_price]) if filter_params[:max_price].present?
        
        # Apply vehicle filters
        vehicle_filter_params.each do |key, value|
          scope = scope.where(vehicles: { key => value })
        end
        
        scope
      end
      
      def filter_params
        params.permit(:min_price, :max_price)
      end
      
      def vehicle_filter_params
        params.permit(:make, :model, :year_from, :year_to, :fuel_type, :transmission)
              .to_h
              .reject { |_, v| v.blank? }
              .transform_keys do |key|
                case key
                when :year_from
                  :year
                when :year_to
                  :year
                else
                  key
                end
              end
      end
      
      def order_params
        order_field = params[:sort_by] || 'post_date'
        order_direction = params[:sort_order] || 'desc'
        
        { order_field => order_direction }
      end
      
      def page_params
        {
          page: (params[:page] || 1).to_i,
          per_page: [(params[:per_page] || 20).to_i, 50].min # Maximum 50 items per page
        }
      end
      
      def listings_json(listings)
        listings.map do |listing|
          {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            location: listing.location,
            thumbnail_url: listing.image_urls&.first,
            post_date: listing.post_date,
            vehicle: {
              make: listing.vehicle&.make,
              model: listing.vehicle&.model,
              year: listing.vehicle&.year,
              fuel_type: listing.vehicle&.fuel_type,
              transmission: listing.vehicle&.transmission,
              mileage: listing.vehicle&.mileage
            }
          }
        end
      end
      
      def listing_detail_json(listing)
        {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          location: listing.location,
          description: listing.description,
          post_date: listing.post_date,
          source_url: listing.source_url,
          image_urls: listing.image_urls,
          vehicle: vehicle_detail_json(listing.vehicle)
        }
      end
      
      def vehicle_detail_json(vehicle)
        return nil unless vehicle
        
        {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          variant: vehicle.variant,
          year: vehicle.year,
          fuel_type: vehicle.fuel_type,
          transmission: vehicle.transmission,
          engine_size: vehicle.engine_size,
          body_type: vehicle.body_type,
          doors: vehicle.doors,
          color: vehicle.color,
          mileage: vehicle.mileage,
          registration: vehicle.registration,
          vin: vehicle.vin,
          tax_status: vehicle.tax_status,
          tax_due_date: vehicle.tax_due_date,
          mot_status: vehicle.mot_status,
          mot_expiry_date: vehicle.mot_expiry_date
        }
      end
      
      def pagination_json(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
end
```

### Vehicles Controller

```ruby
# app/controllers/api/v1/vehicles_controller.rb
module Api
  module V1
    class VehiclesController < Api::BaseController
      def show
        vehicle = Vehicle.find(params[:id])
        
        render_success({ vehicle: vehicle_detail_json(vehicle) })
      end
      
      def lookup_by_registration
        # Validate parameters
        unless params[:registration].present?
          return render_error('missing_registration', 'Registration is required', :bad_request)
        end
        
        # First check if we already have this vehicle in our database
        vehicle = Vehicle.find_by(registration: params[:registration])
        
        # If not found, fetch from external API and create a new record
        unless vehicle
          vehicle_service = VehicleEnrichmentService.new
          
          begin
            vehicle_data = vehicle_service.get_vehicle_by_registration(params[:registration])
            
            # Create a new vehicle record with the data
            vehicle = Vehicle.create!(
              registration: params[:registration],
              make: vehicle_data[:make],
              model: vehicle_data[:model],
              # Add other fields as appropriate
            )
          rescue => e
            return render_error('vehicle_lookup_failed', 'Could not find vehicle with this registration', :not_found)
          end
        end
        
        render_success({ vehicle: vehicle_detail_json(vehicle) })
      end
      
      def mot_histories
        vehicle = Vehicle.find(params[:id])
        histories = vehicle.mot_histories.order(test_date: :desc)
        
        render_success({ mot_histories: mot_histories_json(histories) })
      end
      
      private
      
      def vehicle_detail_json(vehicle)
        {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          variant: vehicle.variant,
          year: vehicle.year,
          fuel_type: vehicle.fuel_type,
          transmission: vehicle.transmission,
          engine_size: vehicle.engine_size,
          body_type: vehicle.body_type,
          doors: vehicle.doors,
          color: vehicle.color,
          mileage: vehicle.mileage,
          registration: vehicle.registration,
          vin: vehicle.vin,
          listing_id: vehicle.listing_id,
          tax_status: vehicle.tax_status,
          tax_due_date: vehicle.tax_due_date,
          mot_status: vehicle.mot_status,
          mot_expiry_date: vehicle.mot_expiry_date
        }
      end
      
      def mot_histories_json(histories)
        histories.map do |history|
          {
            id: history.id,
            test_date: history.test_date,
            expiry_date: history.expiry_date,
            odometer: history.odometer,
            result: history.result,
            advisory_notes: history.advisory_notes,
            failure_reasons: history.failure_reasons
          }
        end
      end
    end
  end
end
```

### Searches Controller

```ruby
# app/controllers/api/v1/searches_controller.rb
module Api
  module V1
    class SearchesController < Api::BaseController
      def create
        search = Search.new(
          query: search_params.to_h,
          ip_address: request.remote_ip
        )
        
        if search.save
          render_success({ search_id: search.id }, :created)
        else
          render_error('invalid_search', 'Failed to save search', :bad_request)
        end
      end
      
      def recent
        searches = Search.order(created_at: :desc).limit(10)
        
        render_success({ searches: searches_json(searches) })
      end
      
      private
      
      def search_params
        params.permit(:make, :model, :min_price, :max_price, :year_from, 
                      :year_to, :fuel_type, :transmission)
      end
      
      def searches_json(searches)
        searches.map do |search|
          {
            id: search.id,
            query: search.query,
            created_at: search.created_at
          }
        end
      end
    end
  end
end
```

## Testing Routes

You can use the following command to see all defined routes:

```
rails routes -g api
```

This will filter the routes to show only those related to the API.

## Route Testing

Make sure to thoroughly test your routes with appropriate request specs:

```ruby
# spec/requests/api/v1/listings_spec.rb
require 'rails_helper'

RSpec.describe 'API V1 Listings', type: :request do
  describe 'GET /api/v1/listings' do
    it 'returns a list of listings' do
      create_list(:listing, 3)
      
      get '/api/v1/listings'
      
      expect(response).to have_http_status(:success)
      expect(json_response['status']).to eq('success')
      expect(json_response['data']['listings'].size).to eq(3)
    end
    
    # Additional tests for filtering, pagination, etc.
  end
  
  describe 'GET /api/v1/listings/:id' do
    it 'returns a specific listing' do
      listing = create(:listing)
      
      get "/api/v1/listings/#{listing.id}"
      
      expect(response).to have_http_status(:success)
      expect(json_response['status']).to eq('success')
      expect(json_response['data']['listing']['id']).to eq(listing.id)
    end
    
    it 'returns 404 for non-existent listing' do
      get '/api/v1/listings/999'
      
      expect(response).to have_http_status(:not_found)
      expect(json_response['status']).to eq('error')
    end
  end
  
  # Helpers
  def json_response
    JSON.parse(response.body)
  end
end
```

## Conclusion

This routes configuration provides a solid foundation for our car listing API. It follows RESTful principles, uses proper namespace isolation, and provides a consistent structure that can be extended as needed. The controllers include comprehensive error handling and a standardized response format.

Be sure to adapt the serialization in each controller to match your specific model structure while maintaining the response format defined in the OpenAPI specification. 