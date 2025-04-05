module Api
  module V1
    class VehiclesController < Api::BaseController
      def show
        @vehicle = Vehicle.includes(:mot_histories, :listing).find(params[:id])
        render json: vehicle_json(@vehicle)
      end
      
      def lookup
        registration = params[:registration]
        
        unless registration.present?
          return render json: { error: "Registration is required" }, status: :bad_request
        end
        
        @vehicle = Vehicle.find_by(registration: registration)
        
        if @vehicle
          render json: { vehicle: vehicle_json(@vehicle) }
        else
          # If vehicle not found, create a background job to fetch its data
          job = FetchVehicleByRegistrationJob.perform_later(registration)
          render json: { error: "Vehicle not found", job_id: job.job_id }, status: :not_found
        end
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
          registration_source: vehicle.registration_source,
          vin: vehicle.vin,
          mileage: vehicle.mileage,
          purchase_summary: vehicle.purchase_summary,
          mot_repair_estimate: vehicle.mot_repair_estimate,
          listing: vehicle.listing ? {
            id: vehicle.listing.id,
            title: vehicle.listing.title,
            price: vehicle.listing.price,
            source_url: vehicle.listing.source_url
          } : nil,
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
          end,
          expected_lifetime: vehicle.expected_lifetime
        }
      end
    end
  end
end 