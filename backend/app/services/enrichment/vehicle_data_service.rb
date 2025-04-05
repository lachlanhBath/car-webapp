module Enrichment
  class VehicleDataService
    def self.extract_from_listing(listing)
      return {} unless listing

      data = {}

      # Extract year, make, model from title
      if listing.title.present?
        title_data = parse_title(listing.title)
        data.merge!(title_data)
      end

      # Extract specifications from specs array
      if listing.specs.present?
        specs_data = parse_specs(listing.specs)
        # Merge but don't overwrite existing data from title
        specs_data.each do |key, value|
          data[key] = value unless data[key].present?
        end
      end

      # Extract from description
      if listing.description.present?
        desc_data = parse_description(listing.description)
        # Merge but don't overwrite existing data
        desc_data.each do |key, value|
          data[key] = value unless data[key].present?
        end
      end

      # Price from listing
      data[:price] = listing.price if listing.price.present?

      # Fallbacks and defaults
      data[:year] ||= extract_year_from_date(listing.post_date)
      data[:status] = 'active'
      
      data
    end

    private

    def self.parse_title(title)
      data = {}
      
      # Try to extract year (4 digit number between 1900-2030)
      if title =~ /\b(19\d{2}|20[0-2]\d)\b/
        data[:year] = $1.to_i
      end
      
      # Common car manufacturers
      manufacturers = [
        'Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 
        'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes', 
        'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Peugeot', 'Porsche', 
        'Renault', 'Seat', 'Skoda', 'Suzuki', 'Tesla', 'Toyota', 'Vauxhall', 
        'Volkswagen', 'Volvo'
      ]
      
      # Extract make (manufacturer)
      manufacturers.each do |make|
        if title =~ /\b#{make}\b/i
          data[:make] = make
          
          # Remove the make from the title to help with model extraction
          remaining_text = title.sub(/\b#{make}\b/i, '')
          
          # Check for common models for this make
          model = extract_model_for_make(make, remaining_text)
          data[:model] = model if model
          
          break
        end
      end
      
      # Extract additional attributes
      fuel_types = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'PHEV']
      fuel_types.each do |fuel|
        if title =~ /\b#{fuel}\b/i
          data[:fuel_type] = fuel
          break
        end
      end
      
      transmissions = ['Manual', 'Automatic', 'Semi-Auto', 'CVT', 'DSG']
      transmissions.each do |transmission|
        if title =~ /\b#{transmission}\b/i
          data[:transmission] = transmission
          break
        end
      end
      
      # Extract mileage (number followed by 'miles')
      if title =~ /\b(\d{1,3}(?:,\d{3})*|\d+)\s*miles\b/i
        mileage_str = $1.gsub(',', '')
        data[:mileage] = mileage_str.to_i
      end
      
      data
    end
    
    def self.extract_model_for_make(make, text)
      # Dictionary of common models for each manufacturer
      models_by_make = {
        'Audi' => ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron'],
        'BMW' => ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'i8', 'M2', 'M3', 'M4', 'M5'],
        'Ford' => ['Fiesta', 'Focus', 'Mondeo', 'Puma', 'Kuga', 'EcoSport', 'Edge', 'Mustang', 'S-Max', 'Galaxy', 'Ka'],
        'Volkswagen' => ['Polo', 'Golf', 'ID.3', 'ID.4', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross', 'Touareg', 'Arteon', 'Caddy', 'Transporter', 'Up'],
        'Vauxhall' => ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Vivaro'],
        'Mercedes' => ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQA', 'EQC', 'CLA', 'CLS', 'AMG'],
        'Mercedes-Benz' => ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQA', 'EQC', 'CLA', 'CLS', 'AMG']
      }
      
      # Use a default empty array if the make isn't in our dictionary
      models = models_by_make[make] || []
      
      # Check for each model in the text
      models.each do |model|
        return model if text =~ /\b#{Regexp.escape(model)}\b/i
      end
      
      # For makes not in our dictionary or if no model matched, try to extract model from the remaining text
      # This is a simplistic approach - in a real app, this would be more sophisticated
      if models.empty?
        # Take the first word after the make as the model, if it looks like a model name
        potential_model = text.strip.split(/\s+/).first
        return potential_model if potential_model && potential_model.match?(/^[A-Za-z0-9\-\.]+$/)
      end
      
      nil
    end

    def self.parse_specs(specs)
      data = {}
      
      specs.each do |spec|
        case spec
        when /(\d{4})/
          # Year
          potential_year = $1.to_i
          data[:year] = potential_year if potential_year.between?(1900, 2030)
        when /(\d+(?:\.\d+)?)\s*L/i, /(\d+(?:\.\d+)?)\s*Litre/i
          # Engine size
          data[:engine_size] = $1.to_f * 1000 # Convert to cc
        when /(\d{1,3}(?:,\d{3})*|\d+)\s*miles/i
          # Mileage
          mileage_str = $1.gsub(',', '')
          data[:mileage] = mileage_str.to_i
        when /(\d+)\s*doors/i
          # Doors
          data[:doors] = $1.to_i
        when /Manual|Automatic|Semi-Auto|CVT|DSG/i
          # Transmission
          data[:transmission] = spec.match(/(Manual|Automatic|Semi-Auto|CVT|DSG)/i)[1]
        when /Petrol|Diesel|Hybrid|Electric|PHEV/i
          # Fuel type
          data[:fuel_type] = spec.match(/(Petrol|Diesel|Hybrid|Electric|PHEV)/i)[1]
        when /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+car/i, /body[: ]+([A-Z][a-z]+)/i
          # Body type
          data[:body_type] = $1
        when /(White|Black|Silver|Grey|Blue|Red|Green|Yellow|Orange|Purple|Brown|Gold)/i
          # Color
          data[:color] = $1
        end
      end
      
      data
    end

    def self.parse_description(description)
      data = {}
      
      # Year pattern
      if description =~ /\b(19\d{2}|20[0-2]\d)\b/
        data[:year] = $1.to_i
      end
      
      # Mileage pattern
      if description =~ /\b(\d{1,3}(?:,\d{3})*|\d+)\s*miles\b/i
        mileage_str = $1.gsub(',', '')
        data[:mileage] = mileage_str.to_i
      end
      
      # Engine size pattern
      if description =~ /(\d+(?:\.\d+)?)\s*L\b/i || description =~ /(\d+(?:\.\d+)?)\s*Litre/i
        data[:engine_size] = $1.to_f * 1000 # Convert to cc
      end
      
      # Transmission
      if description =~ /\b(Manual|Automatic|Semi-Auto|CVT|DSG)\b/i
        data[:transmission] = $1
      end
      
      # Fuel type
      if description =~ /\b(Petrol|Diesel|Hybrid|Electric|PHEV)\b/i
        data[:fuel_type] = $1
      end
      
      # Body type
      if description =~ /\b(Hatchback|Sedan|Saloon|Estate|SUV|Convertible|Coupe|MPV|Van)\b/i
        data[:body_type] = $1
      end
      
      # Number of doors
      if description =~ /\b(\d+)[- ]?door\b/i
        data[:doors] = $1.to_i
      end
      
      # Number of previous owners
      if description =~ /\b(\d+)\s+(?:previous )?owners?\b/i
        data[:previous_owners] = $1.to_i
      end
      
      # Check for service history mentions
      if description =~ /\bfull\s+service\s+history\b/i || description =~ /\bFSH\b/
        data[:service_history] = 'Full'
      elsif description =~ /\bservice\s+history\b/i
        data[:service_history] = 'Partial'
      end
      
      data
    end

    def self.extract_year_from_date(date)
      return nil unless date.is_a?(Date)
      date.year
    end
  end
end 