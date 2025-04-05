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
      
      def operating_cost_estimate
        @vehicle = Vehicle.find(params[:id])
        
        # Validate required parameters
        unless params[:weekly_miles].present?
          return render json: { error: "Weekly miles parameter is required" }, status: :bad_request
        end
        
        weekly_miles = params[:weekly_miles].to_f
        driving_style = params[:driving_style] || 'normal'
        driver_age = params[:driver_age].present? ? params[:driver_age].to_i : 30
        
        # Calculate costs based on vehicle attributes and driving habits
        fuel_cost = calculate_fuel_cost(@vehicle, weekly_miles, driving_style)
        maintenance_cost = calculate_maintenance_cost(@vehicle, weekly_miles)
        tax_cost = calculate_tax_cost(@vehicle)
        insurance_cost = calculate_insurance_cost(@vehicle, driver_age)
        
        total_cost = fuel_cost + maintenance_cost + tax_cost + insurance_cost
        
        render json: {
          vehicle_id: @vehicle.id,
          make: @vehicle.make,
          model: @vehicle.model,
          estimated_monthly_cost: {
            total: total_cost.round(2),
            fuel: fuel_cost.round(2),
            maintenance: maintenance_cost.round(2),
            tax: tax_cost.round(2),
            insurance: insurance_cost.round(2)
          },
          parameters: {
            weekly_miles: weekly_miles,
            driving_style: driving_style,
            driver_age: driver_age
          }
        }
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
      
      # Helper methods for cost calculations
      
      def calculate_fuel_cost(vehicle, weekly_miles, driving_style)
        # Basic calculation based on fuel type, engine size, and driving style
        base_cost = 165.50 # Base monthly fuel cost for average car at 200 miles/week
        
        # Adjust for fuel type
        fuel_multiplier = case vehicle.fuel_type.to_s.downcase
                          when 'diesel' then 1.43  # Diesel is more expensive
                          when 'electric' then 0.4  # Electric is cheaper
                          when 'hybrid' then 0.7  # Hybrid is more efficient
                          else 1.36  # Petrol (default)
                          end
        
        # Adjust for engine size if available
        engine_multiplier = if vehicle.engine_size.present?
                             size = vehicle.engine_size.to_f
                             size > 2.0 ? 1.3 : (size > 1.6 ? 1.1 : 1.0)
                           else
                             1.0
                           end
        
        # Adjust for driving style
        style_multiplier = case driving_style
                           when 'eco' then 0.85
                           when 'aggressive' then 1.2
                           else 1.0 # normal
                           end
        
        # Adjust for weekly miles (proportional to 200 miles/week baseline)
        mileage_multiplier = weekly_miles / 200.0
        
        base_cost * fuel_multiplier * engine_multiplier * style_multiplier * mileage_multiplier
      end
      
      def calculate_maintenance_cost(vehicle, weekly_miles)
        # Basic calculation based on vehicle age, type and mileage
        base_cost = 45.0
        
        # Adjust for age
        age = Time.current.year - (vehicle.year || Time.current.year - 5)
        age_multiplier = [1.0, 1.0 + (age - 3) * 0.05].max # Increases by 10% per year after 3 years
        
        # Adjust for weekly miles (proportional to 200 miles/week baseline)
        mileage_multiplier = weekly_miles / 200.0
        
        base_cost * age_multiplier * mileage_multiplier
      end
      
      def calculate_tax_cost(vehicle)
        # Simplified tax calculation based on engine size/emissions
        if vehicle.fuel_type.to_s.downcase == 'electric'
          0.0 # Electric vehicles are often tax exempt
        else
          15.0 # Average monthly tax
        end
      end
      
      def calculate_insurance_cost(vehicle, driver_age = 30)
        # Very simplified insurance calculation
        base_cost = 100.0
        
        # Adjust for vehicle value and age
        value_factor = if vehicle.year.present?
                        case vehicle.year
                        when Time.current.year-1..Time.current.year then 1.3
                        when Time.current.year-3..Time.current.year-2 then 1.1
                        when Time.current.year-7..Time.current.year-4 then 0.9
                        else 0.8
                        end
                      else
                        1.0
                      end
        
        # Adjust for driver age (new)
        age_factor = case driver_age
                    when 17..20 then 2.0    # Young drivers pay much more
                    when 21..25 then 1.5    # Young adult drivers pay more
                    when 26..40 then 1.0    # Prime age range - baseline
                    when 41..55 then 0.9    # Experienced drivers get discount
                    when 56..70 then 1.0    # Slight increase as age advances
                    else 1.2                # Elderly drivers pay more
                    end
        
        base_cost * value_factor * age_factor
      end
    end
  end
end 