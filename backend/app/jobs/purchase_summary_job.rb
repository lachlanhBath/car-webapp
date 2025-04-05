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

      # Update the vehicle with the summary
      vehicle.update(purchase_summary: summary)

      Rails.logger.info "Updated vehicle ##{vehicle.id} with AI purchase summary"
    rescue => e
      Rails.logger.error "Error in PurchaseSummaryJob for vehicle ##{vehicle_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  private

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
    openai_response = service.generate_text(prompt)

    # Return the generated summary
    openai_response || default_summary(vehicle)
  end

  def build_prompt(make:, model:, year:, mileage:, age:, failures:, advisories:, mot_status:, mot_expiry:, tax_status:)
    prompt = "Based on the following information about a #{year} #{make} #{model}, provide a concise summary (max 250 words) about whether this vehicle would be a good purchase decision:\n\n"

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

    prompt += "\nBased on your knowledge about this make and model:"
    prompt += "\n1. What are common issues for this vehicle?"
    prompt += "\n2. Is this particular vehicle showing any warning signs based on the MOT history?"
    prompt += "\n3. Given the age and mileage, is this likely to be a good purchase?"
    prompt += "\n4. What specific things should a buyer check before purchasing?"
    prompt += "\n\nProvide a structured assessment that evaluates the vehicle as a purchasing decision."

    prompt
  end

  def default_summary(vehicle)
    "This #{vehicle.year} #{vehicle.make} #{vehicle.model} requires further inspection before making a purchase decision. Always check the full MOT history and consider having the vehicle inspected by a qualified mechanic."
  end
end
