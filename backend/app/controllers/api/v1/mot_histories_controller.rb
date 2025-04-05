module Api
  module V1
    class MotHistoriesController < Api::BaseController
      def index
        @vehicle = Vehicle.find(params[:vehicle_id])
        @mot_histories = @vehicle.mot_histories.chronological
        
        render json: {
          vehicle_id: @vehicle.id,
          mot_histories: @mot_histories.map do |mot|
            {
              id: mot.id,
              test_date: mot.test_date,
              expiry_date: mot.expiry_date,
              odometer: mot.odometer,
              result: mot.result,
              advisory_notes: mot.advisory_notes,
              failure_reasons: mot.failure_reasons
            }
          end
        }
      end
      
      def show
        @mot_history = MotHistory.find(params[:id])
        
        render json: {
          id: @mot_history.id,
          vehicle_id: @mot_history.vehicle_id,
          test_date: @mot_history.test_date,
          expiry_date: @mot_history.expiry_date,
          odometer: @mot_history.odometer,
          result: @mot_history.result,
          advisory_notes: @mot_history.advisory_notes,
          failure_reasons: @mot_history.failure_reasons,
          days_until_expiry: @mot_history.days_until_expiry,
          expired: @mot_history.expired?
        }
      end
    end
  end
end 