class MotHistoryJob < ApplicationJob
  queue_as :default
  
  def perform(vehicle_id)
    vehicle = Vehicle.find_by(id: vehicle_id)
    return unless vehicle
    
    Rails.logger.info "Starting MOT history retrieval for vehicle ##{vehicle.id}"
    
    # Skip if no registration available
    unless vehicle.registration.present?
      Rails.logger.info "Vehicle ##{vehicle.id} has no registration - skipping MOT history"
      return
    end
    
    # Skip if already has MOT history
    if vehicle.mot_histories.exists?
      Rails.logger.info "Vehicle ##{vehicle.id} already has MOT history entries"
      return
    end
    
    begin
      # Sanitize registration to remove any non-alphanumeric characters
      registration = vehicle.registration.gsub(/[^A-Z0-9]/i, '')
      
      # Call the MOT history service
      mot_service = Enrichment::MotHistoryService.new
      mot_data = mot_service.fetch_history(registration)
      
      if mot_data.present? && mot_data.is_a?(Array)
        mot_data.each do |test|
          vehicle.mot_histories.create(
            test_date: test[:test_date],
            expiry_date: test[:expiry_date],
            odometer: test[:odometer],
            result: test[:result],
            advisory_notes: test[:advisory_notes],
            failure_reasons: test[:failure_reasons]
          )
        end
        
        Rails.logger.info "Added #{mot_data.size} MOT history entries for vehicle ##{vehicle.id}"
      else
        Rails.logger.info "No MOT history found for vehicle ##{vehicle.id} with registration #{vehicle.registration}"
      end
      
    rescue => e
      Rails.logger.error "Error in MotHistoryJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end
end 