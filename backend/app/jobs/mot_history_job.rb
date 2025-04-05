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
      # Get the unmodified registration - service will handle sanitization
      registration = vehicle.registration

      # Call the MOT history service
      mot_service = Enrichment::MotHistoryService.new
      mot_data = mot_service.fetch_history(registration)

      # Check for error response
      if mot_data.is_a?(Hash) && mot_data["error"].present?
        Rails.logger.error "Error retrieving MOT history: #{mot_data["error"]}"
        return
      end

      # Process the MOT data - could be a single vehicle hash or array of vehicles
      if mot_data.is_a?(Hash) && mot_data["motTests"].present?
        # Single vehicle format
        mot_tests = mot_data["motTests"] || []
        process_mot_tests(vehicle, mot_tests)

        # also update some information on the vehicle that is only available in the MOT history
        # like the model and most recent mileage
        vehicle.update(
          model: mot_data["model"],
          mileage: extract_odometer(mot_tests.max_by { |test| test["completedDate"] })
        )
      elsif mot_data.is_a?(Array) && mot_data.any?
        # Array format
        vehicle_data = mot_data.first
        mot_tests = vehicle_data["motTests"] || []
        process_mot_tests(vehicle, mot_tests)
      else
        Rails.logger.info "No MOT history found for vehicle ##{vehicle.id} with registration #{vehicle.registration}"
      end
    rescue => e
      Rails.logger.error "Error in MotHistoryJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  private

  def process_mot_tests(vehicle, mot_tests)
    if mot_tests.any?
      mot_tests.each do |test|
        vehicle.mot_histories.create(
          test_date: parse_date(test["completedDate"]),
          expiry_date: parse_date(test["expiryDate"]),
          odometer: extract_odometer(test),
          result: (test["testResult"] == "PASSED") ? "PASS" : "FAIL",
          advisory_notes: extract_advisory_notes_array(test),
          failure_reasons: extract_failure_reasons_array(test)
        )
      end
      Rails.logger.info "Added #{mot_tests.size} MOT history entries for vehicle ##{vehicle.id}"
    else
      Rails.logger.info "No MOT test data found in the response for vehicle ##{vehicle.id}"
    end
  end

  def parse_date(date_string)
    return nil unless date_string
    begin
      Date.parse(date_string)
    rescue
      nil
    end
  end

  def extract_odometer(test)
    return nil unless test["odometerValue"].present?
    test["odometerValue"].to_i
  end

  def extract_advisory_notes_array(test)
    defects = test["defects"] || []
    advisories = defects.select { |defect| defect["type"] == "ADVISORY" }
    advisories.map { |adv| adv["text"] }
  end

  def extract_failure_reasons_array(test)
    defects = test["defects"] || []
    failures = defects.select { |defect| defect["type"] == "FAIL" || defect["type"] == "DANGEROUS" || defect["type"] == "MAJOR" }
    failures.map { |fail| fail["text"] }
  end
end
