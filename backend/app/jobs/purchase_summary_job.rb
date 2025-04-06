class PurchaseSummaryJob < ApplicationJob
  queue_as :default

  def perform(vehicle_id)
    vehicle = Vehicle.find_by(id: vehicle_id)
    return unless vehicle

    # Check if OpenAI API key is configured
    if ENV["OPENAI_ACCESS_TOKEN"].blank?
      Rails.logger.error "OpenAI access token missing! Cannot proceed with purchase summary generation."
      return # Don't proceed if AI is not available
    end

    begin
      # Generate the summary based on vehicle data
      summary = generate_summary(vehicle)

      # Generate expected lifetime estimate
      lifetime = generate_expected_lifetime(vehicle)

      # Generate original purchase price estimate
      original_price = generate_original_purchase_price(vehicle)

      # Check if vehicle has failed MOT and generate repair estimate if needed
      repair_estimate = generate_mot_repair_estimate(vehicle) if needs_mot_repair_estimate?(vehicle)

      # Update the vehicle with all generated information
      vehicle.update(
        purchase_summary: summary,
        mot_repair_estimate: repair_estimate,
        expected_lifetime: lifetime,
        original_purchase_price: original_price,
        transmission: vehicle.listing.transmission
      )

      Rails.logger.info "Updated vehicle ##{vehicle.id} with AI purchase summary"
      Rails.logger.info "Generated MOT repair estimate for vehicle ##{vehicle.id}" if repair_estimate.present?
      Rails.logger.info "Generated expected lifetime for vehicle ##{vehicle.id}" if lifetime.present?
      Rails.logger.info "Generated original purchase price for vehicle ##{vehicle.id}" if original_price.present?
    rescue => e
      Rails.logger.error "Error in PurchaseSummaryJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  private

  def generate_expected_lifetime(vehicle)
    # Collect relevant vehicle data
    make = vehicle.make
    model = vehicle.model
    year = vehicle.year
    mileage = vehicle.mileage
    fuel_type = vehicle.fuel_type
    mot_history = vehicle.mot_histories.chronological

    # Calculate current age
    current_age = Time.current.year - year.to_i if year

    # Get failure rate from MOT history
    failures = mot_history.select { |mot| mot.result.to_s.upcase == "FAIL" }
    failure_rate = mot_history.present? ? (failures.count.to_f / mot_history.count) : nil

    # Call OpenAI to get the expected lifetime
    prompt = build_lifetime_prompt(
      make: make,
      model: model,
      year: year,
      mileage: mileage,
      current_age: current_age,
      fuel_type: fuel_type,
      failure_rate: failure_rate
    )

    # Call OpenAI API
    service = Enrichment::OpenAiService.new
    response = service.generate_text(prompt, "gpt-4o-mini", 100)

    # Return the generated lifetime estimate
    response || default_lifetime(vehicle)
  end

  def build_lifetime_prompt(make:, model:, year:, mileage:, current_age:, fuel_type:, failure_rate:)
    prompt = "You are an automotive expert estimating the expected lifetime of a #{year} #{make} #{model} (#{fuel_type}) with current mileage of #{mileage || "unknown"} miles and age of #{current_age || "unknown"} years.\n\n"

    prompt += "Consider:\n"
    prompt += "1. The typical reliability and longevity of this make, model, and engine type\n"
    prompt += "2. Current age and mileage compared to typical lifespan\n"
    prompt += "3. Common major failures that end a vehicle's useful life\n"

    if failure_rate
      prompt += "4. This specific vehicle has a MOT test failure rate of #{(failure_rate * 100).round}%\n"
    end

    prompt += "\nProvide ONLY a concise estimate of the expected remaining life in both years and miles.\n"

    prompt += "\nKeep your response to a single short sentence focusing ONLY on the expected remaining life."

    prompt
  end

  def default_lifetime(vehicle)
    age = vehicle&.year ? (Time.current.year - vehicle.year) : nil

    if age && age > 15
      "1-3 more years or 10,000-30,000 additional miles with careful maintenance"
    elsif age && age > 10
      "3-5 more years or 30,000-50,000 additional miles with proper maintenance"
    else
      "7-10 more years or 70,000-100,000 additional miles with regular maintenance"
    end
  end

  def needs_mot_repair_estimate?(vehicle)
    # Check if vehicle has a failed MOT (most recent one)
    latest_mot = vehicle.mot_histories.chronological.first
    latest_mot.present? && latest_mot.result.to_s.upcase == "FAIL"
  end

  def generate_mot_repair_estimate(vehicle)
    # Get the latest failed MOT
    latest_mot = vehicle.mot_histories.chronological.first
    return nil unless latest_mot.present? && latest_mot.result.to_s.upcase == "FAIL"

    # Get the failure reasons
    failure_reasons = latest_mot.failure_reasons.flatten.compact
    return nil if failure_reasons.empty?

    # Vehicle info
    make = vehicle.make
    model = vehicle.model
    year = vehicle.year

    # Call OpenAI to get the repair estimate
    prompt = build_repair_estimate_prompt(
      make: make,
      model: model,
      year: year,
      failure_reasons: failure_reasons
    )

    # Call OpenAI API
    service = Enrichment::OpenAiService.new
    response = service.generate_text(prompt, "gpt-4o-mini")

    # Return the generated estimate
    response || default_repair_estimate(vehicle, failure_reasons)
  end

  def build_repair_estimate_prompt(make:, model:, year:, failure_reasons:)
    prompt = "You are a vehicle mechanic estimating MOT repair costs. Based on the following MOT failure reasons for a #{year} #{make} #{model}, provide a BRIEF repair cost estimate with a range (e.g., £200-£300), and a short explanation of what repairs would be needed:\n\n"

    prompt += "MOT Failure Reasons:\n"
    failure_reasons.each { |r| prompt += "- #{r}\n" }

    prompt += "\nConsider current UK parts and labor costs, as well as common problems for this make/model."
    prompt += "\nProvide a SHORT response including: estimated cost range, 1-2 sentence explanation of what repairs are needed, and very brief recommendation if the repair is worth doing based on typical vehicle value."
    prompt += "\nFormat your response as follows:"
    prompt += "\nCost: [estimated range in GBP]"
    prompt += "\nNeeded Repairs: [concise explanation]"
    prompt += "\nRecommendation: [brief advice]"

    prompt
  end

  def default_repair_estimate(vehicle, failure_reasons)
    reason_count = failure_reasons.size
    if reason_count <= 2
      "Cost: £100-£300\nNeeded Repairs: Minor MOT failures that likely require standard parts replacement.\nRecommendation: Worth repairing as issues appear relatively minor."
    else
      "Cost: £300-£800+\nNeeded Repairs: Multiple MOT failures that will require significant parts and labor.\nRecommendation: Get a detailed inspection before committing to repairs."
    end
  end

  def generate_original_purchase_price(vehicle)
    # Collect relevant vehicle data
    make = vehicle.make
    model = vehicle.model
    year = vehicle.year
    fuel_type = vehicle.fuel_type
    transmission = vehicle.transmission
    engine_size = vehicle.engine_size

    # Call OpenAI to get the original purchase price
    prompt = build_original_price_prompt(
      make: make,
      model: model,
      year: year,
      fuel_type: fuel_type,
      transmission: transmission,
      engine_size: engine_size
    )

    # Call OpenAI API
    service = Enrichment::OpenAiService.new
    response = service.generate_text(prompt, "gpt-4o-mini", 50)

    # Parse the response to extract the price as a number
    extracted_price = extract_price_from_response(response)
    extracted_price || default_original_price(vehicle)
  end

  def build_original_price_prompt(make:, model:, year:, fuel_type:, transmission:, engine_size:)
    prompt = "You are a car pricing expert. What was the original purchase price (MSRP) of a new #{year} #{make} #{model} in the UK market?\n\n"

    prompt += "Additional vehicle details:\n"
    prompt += "- Fuel type: #{fuel_type}\n" if fuel_type.present?
    prompt += "- Transmission: #{transmission}\n" if transmission.present?
    prompt += "- Engine size: #{engine_size}\n" if engine_size.present?

    prompt += "\nIMPORTANT: In your response, provide ONLY a single figure representing the original base price in GBP, formatted like this: £25,995 or similar."
    prompt += "\nDo not include any explanations, ranges, or additional information - just the original price figure."

    prompt
  end

  def extract_price_from_response(response)
    return nil unless response.present?
    
    # Remove the pound sign and any commas, then convert to decimal
    price_match = response.match(/£?(\d{1,3}(,\d{3})*(\.\d{1,2})?)/)
    if price_match
      price_match[1].gsub(',', '').to_f
    else
      nil
    end
  end

  def default_original_price(vehicle)
    # Provide a reasonable default based on vehicle make and age
    base_price = case vehicle.make&.downcase
                 when 'bmw', 'mercedes', 'audi', 'lexus'
                   35000
                 when 'ford', 'vauxhall', 'volkswagen', 'toyota', 'honda'
                   20000
                 when 'dacia', 'suzuki', 'kia', 'hyundai'
                   15000
                 else
                   25000
                 end

    # Adjust for age
    age_factor = vehicle.year ? [1.0 - ((Time.current.year - vehicle.year) * 0.02), 0.7].max : 0.9
    
    (base_price * age_factor).round
  end

  def generate_summary(vehicle)
    # Collect relevant vehicle data
    make = vehicle.make
    model = vehicle.model
    year = vehicle.year
    mileage = vehicle.mileage
    mot_history = vehicle.mot_histories.chronological

    # Gather MOT issues
    failures = mot_history.map(&:failure_reasons).flatten.compact
    advisories = mot_history.map(&:advisory_notes).flatten.compact

    # Current MOT and tax status
    mot_status = vehicle.mot_status
    mot_expiry = vehicle.mot_expiry_date
    tax_status = vehicle.tax_status

    # Gather other relevant data
    age = Time.current.year - year.to_i if year

    # Call OpenAI to get the summary
    prompt = build_prompt(
      make: make,
      model: model,
      year: year,
      mileage: mileage,
      age: age,
      failures: failures,
      advisories: advisories,
      mot_status: mot_status,
      mot_expiry: mot_expiry,
      tax_status: tax_status
    )

    # Call to OpenAI API using the service
    service = Enrichment::OpenAiService.new
    openai_response = service.generate_text(prompt, "gpt-4o-mini")

    # Return the generated summary
    openai_response || default_summary(vehicle)
  end

  def build_prompt(make:, model:, year:, mileage:, age:, failures:, advisories:, mot_status:, mot_expiry:, tax_status:)
    prompt = "Based on the following information about a #{year} #{make} #{model}, provide a VERY CONCISE summary (maximum 2-3 sentences) about whether this vehicle would be a good purchase decision:\n\n"

    prompt += "Vehicle: #{year} #{make} #{model}\n"
    prompt += "Age: #{age} years\n" if age
    prompt += "Mileage: #{mileage}\n" if mileage
    prompt += "MOT Status: #{mot_status}\n" if mot_status
    prompt += "MOT Expiry: #{mot_expiry}\n" if mot_expiry
    prompt += "Tax Status: #{tax_status}\n" if tax_status

    if failures.present?
      prompt += "\nRecent MOT Failures:\n"
      failures.each { |f| prompt += "- #{f}\n" }
    end

    if advisories.present?
      prompt += "\nMOT Advisories:\n"
      advisories.each { |a| prompt += "- #{a}\n" }
    end

    prompt += "\nUsing your knowledge about common issues with this make and model:"
    prompt += "\n1. Is this likely to be a good purchase based on the data?"
    prompt += "\n2. What is the most important thing a buyer should be aware of?"

    prompt += "\n\nIMPORTANT: Keep your response to 2-3 short, direct sentences focusing only on the most critical purchase factors."

    prompt
  end

  def default_summary(vehicle)
    "This #{vehicle.year} #{vehicle.make} #{vehicle.model} may be worth considering but requires inspection before purchase. Check MOT history and have it reviewed by a mechanic."
  end
end
