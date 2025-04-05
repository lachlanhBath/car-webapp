module Api
  module V1
    class VehiclesController < Api::BaseController
      def show
        @vehicle = Vehicle.includes(:mot_histories, :listing).find(params[:id])
        render json: vehicle_json(@vehicle)
      end
      
      private
      
      def vehicle_json(vehicle)
        {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          fuel_type: vehicle.fuel_type,
          transmission: vehicle.transmission,
          engine_size: vehicle.engine_size,
          color: vehicle.color,
          body_type: vehicle.body_type,
          doors: vehicle.doors,
          registration: vehicle.registration,
          vin: vehicle.vin,
          listing: {
            id: vehicle.listing.id,
            title: vehicle.listing.title,
            price: vehicle.listing.price,
            source_url: vehicle.listing.source_url
          },
          mot_histories: vehicle.mot_histories.chronological.map do |mot|
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
    end
  end
end 