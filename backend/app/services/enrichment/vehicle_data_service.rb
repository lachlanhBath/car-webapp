module Enrichment
  class VehicleDataService
    def self.extract_from_listing(listing)
      # Try to extract data from listing specs first
      specs_data = extract_from_specs(listing)
      return specs_data if specs_data.values.any?

      # If specs extraction failed, extract from title and description
      title = listing.title.to_s.downcase
      description = listing.description.to_s.downcase
      
      # Combine text for better extraction
      full_text = "#{title} #{description}"
      
      # Some basic extraction logic
      make = extract_make(full_text)
      model = extract_model(full_text, make)
      year = extract_year(full_text)
      fuel_type = extract_fuel_type(full_text)
      transmission = extract_transmission(full_text)
      engine_size = extract_engine_size(full_text)
      body_type = extract_body_type(full_text)
      
      {
        make: make,
        model: model,
        year: year,
        fuel_type: fuel_type,
        transmission: transmission,
        engine_size: engine_size,
        body_type: body_type
      }
    end
    
    private
    
    def self.extract_from_specs(listing)
      result = {
        make: nil,
        model: nil,
        year: nil,
        fuel_type: nil,
        transmission: nil,
        engine_size: nil,
        body_type: nil,
        color: nil,
        doors: nil
      }
      
      # Try to extract from specs in raw_data
      specs = listing.specs
      specs.each do |spec|
        spec = spec.to_s.downcase
        
        # Year
        if spec =~ /\b(19|20)\d{2}\b/ && !result[:year]
          result[:year] = spec.match(/\b(19|20)\d{2}\b/)[0].to_i
        end
        
        # Fuel type
        if (spec.include?('petrol') || spec.include?('diesel') || 
            spec.include?('electric') || spec.include?('hybrid')) && !result[:fuel_type]
          result[:fuel_type] = extract_fuel_type(spec)
        end
        
        # Transmission
        if (spec.include?('manual') || spec.include?('automatic')) && !result[:transmission]
          result[:transmission] = extract_transmission(spec)
        end
        
        # Engine size
        if spec =~ /\b\d+(\.\d+)?\s*l(itre)?\b/ && !result[:engine_size]
          result[:engine_size] = spec.match(/\b\d+(\.\d+)?\s*l(itre)?\b/)[0]
        end
        
        # Body type
        body_types = ['hatchback', 'sedan', 'saloon', 'estate', 'suv', 'coupe', 'convertible', 'mpv', 'van', 'pickup']
        body_types.each do |type|
          if spec.include?(type) && !result[:body_type]
            result[:body_type] = type == 'saloon' ? 'sedan' : type
          end
        end
        
        # Doors
        if spec =~ /\b\d\s*door/ && !result[:doors]
          result[:doors] = spec.match(/\b(\d)\s*door/)[1].to_i
        end
        
        # Color
        colors = ['black', 'white', 'silver', 'grey', 'gray', 'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'brown']
        colors.each do |color|
          if spec.include?(color) && !result[:color]
            result[:color] = color
          end
        end
      end
      
      # Try to extract make and model from title if not found in specs
      if !result[:make] || !result[:model]
        title = listing.title.to_s.downcase
        result[:make] ||= extract_make(title)
        result[:model] ||= extract_model(title, result[:make])
      end
      
      result
    end
    
    def self.extract_make(text)
      # Expanded list of car makes
      common_makes = [
        'ford', 'toyota', 'honda', 'audi', 'bmw', 'mercedes', 'vauxhall', 'volkswagen', 'vw',
        'nissan', 'hyundai', 'kia', 'mazda', 'peugeot', 'renault', 'seat', 'skoda', 'volvo', 
        'fiat', 'citroen', 'mini', 'lexus', 'jaguar', 'land rover', 'mitsubishi', 'suzuki', 
        'tesla', 'dacia', 'jeep', 'porsche', 'subaru'
      ]
      
      # Try to find make in text
      common_makes.each do |make|
        return make.capitalize if text =~ /\b#{make}\b/
      end
      
      # Special case for Mercedes-Benz which might be written in various ways
      if text =~ /\bmercedes[\s\-]?benz\b/ || text =~ /\bmercedes\b/
        return 'Mercedes'
      end
      
      # Special case for Volkswagen which might be abbreviated as VW
      if text =~ /\bvw\b/ || text =~ /\bvolkswagen\b/
        return 'Volkswagen'
      end
      
      nil
    end
    
    def self.extract_model(text, make)
      return nil unless make
      
      # Expanded model data
      common_models = {
        'ford' => ['fiesta', 'focus', 'mondeo', 'kuga', 'mustang', 'ecosport', 'edge', 'ka', 'galaxy', 's-max', 'puma'],
        'toyota' => ['corolla', 'yaris', 'prius', 'rav4', 'aygo', 'camry', 'c-hr', 'land cruiser', 'hilux', 'gt86'],
        'honda' => ['civic', 'accord', 'jazz', 'cr-v', 'hr-v', 'nsx', 'e'],
        'audi' => ['a1', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'q2', 'q3', 'q5', 'q7', 'q8', 'tt', 'r8', 'e-tron'],
        'bmw' => ['1 series', '2 series', '3 series', '4 series', '5 series', '6 series', '7 series', '8 series', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'z4', 'i3', 'i8'],
        'mercedes' => ['a class', 'b class', 'c class', 'e class', 's class', 'cla', 'cls', 'gla', 'glb', 'glc', 'gle', 'gls', 'slk', 'sl', 'amg gt'],
        'vauxhall' => ['corsa', 'astra', 'insignia', 'mokka', 'crossland', 'grandland', 'adam', 'viva'],
        'volkswagen' => ['golf', 'polo', 'passat', 'tiguan', 't-roc', 't-cross', 'touareg', 'id.3', 'id.4', 'arteon', 'scirocco', 'up'],
        'nissan' => ['micra', 'juke', 'qashqai', 'leaf', 'x-trail', 'gt-r', '370z', 'note', 'navara'],
        'hyundai' => ['i10', 'i20', 'i30', 'tucson', 'kona', 'ioniq', 'santa fe'],
        'kia' => ['picanto', 'rio', 'ceed', 'stonic', 'sportage', 'niro', 'sorento'],
        'mazda' => ['2', '3', '6', 'cx-3', 'cx-30', 'cx-5', 'mx-5']
      }
      
      # Use more comprehensive regex patterns for model matching
      models = common_models[make.downcase] || []
      
      models.each do |model|
        # Create a regex pattern that can match the model even if it's part of another word
        # For example, "Golf" should match in "Golf GT" or "Golf GTI"
        if text =~ /\b#{Regexp.escape(model)}\b/i
          return model.split.map(&:capitalize).join(' ')
        end
      end
      
      # Special handling for BMW, Mercedes series which might be written in various ways
      if make.downcase == 'bmw'
        series_match = text.match(/\b(\d)[\s\-]?series\b/i)
        return "#{series_match[1]} Series".capitalize if series_match
        
        # BMW X models
        x_match = text.match(/\bx(\d)\b/i)
        return "X#{x_match[1]}".capitalize if x_match
      end
      
      # Handle Mercedes classes
      if make.downcase == 'mercedes'
        class_match = text.match(/\b([a-z])[\s\-]?class\b/i)
        return "#{class_match[1].upcase}-Class" if class_match
      end
      
      nil
    end
    
    def self.extract_year(text)
      # Extract 4-digit year between 1900 and current year + 1
      current_year = Time.current.year
      years = text.scan(/\b(19\d{2}|20\d{2})\b/).flatten
      
      years.each do |year|
        year_num = year.to_i
        return year_num if year_num.between?(1900, current_year + 1)
      end
      nil
    end
    
    def self.extract_fuel_type(text)
      if text =~ /\bdiesel\b/i
        'diesel'
      elsif text =~ /\belectric\b/i
        'electric'
      elsif text =~ /\bhybrid\b/i
        'hybrid'
      elsif text =~ /\bpetrol\b/i || text =~ /\bgasoline\b/i
        'petrol'
      elsif text =~ /\blpg\b/i
        'lpg'
      else
        nil
      end
    end
    
    def self.extract_transmission(text)
      if text =~ /\bautomatic\b/i
        'automatic'
      elsif text =~ /\bmanual\b/i
        'manual'
      elsif text =~ /\bsemi[\s\-]?automatic\b/i
        'semi-automatic'
      else
        nil
      end
    end
    
    def self.extract_engine_size(text)
      # Look for patterns like "2.0 litre", "1.6L", "1.5 TD", etc.
      engine_match = text.match(/\b(\d+\.\d+)[\s\-]?l(itre)?\b/i)
      return "#{engine_match[1]}L" if engine_match
      
      # Also try to match just the number with L
      engine_match = text.match(/\b(\d+)[\s\-]?l(itre)?\b/i)
      return "#{engine_match[1]}.0L" if engine_match
      
      nil
    end
    
    def self.extract_body_type(text)
      body_types = {
        'hatchback' => ['hatchback', 'hatch'],
        'sedan' => ['sedan', 'saloon'],
        'estate' => ['estate', 'wagon', 'touring', 'station wagon'],
        'suv' => ['suv', 'crossover', '4x4', 'off-road'],
        'coupe' => ['coupe'],
        'convertible' => ['convertible', 'cabriolet', 'roadster'],
        'mpv' => ['mpv', 'minivan', 'people carrier'],
        'van' => ['van', 'commercial'],
        'pickup' => ['pickup', 'pick-up', 'truck']
      }
      
      body_types.each do |type, keywords|
        keywords.each do |keyword|
          return type if text =~ /\b#{keyword}\b/i
        end
      end
      
      nil
    end
  end
end 