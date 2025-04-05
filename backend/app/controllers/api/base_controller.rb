module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token
    
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActionController::ParameterMissing, with: :bad_request
    rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
    
    private
    
    def not_found
      render json: { error: 'Resource not found' }, status: :not_found
    end
    
    def bad_request(error)
      render json: { error: error.message }, status: :bad_request
    end
    
    def unprocessable_entity(error)
      render json: { error: error.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end 