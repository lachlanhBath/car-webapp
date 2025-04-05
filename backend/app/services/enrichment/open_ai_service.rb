module Enrichment
  class OpenAiService
    include HTTParty
    base_uri 'https://api.openai.com/v1'
    
    def initialize
      @auth_header = { 
        "Content-Type" => "application/json", 
        "Authorization" => "Bearer #{ENV['OPENAI_ACCESS_TOKEN']}" 
      }
    end
    
    def generate_text(prompt, model = 'gpt-4', max_tokens = 500)
      Rails.logger.info "Generating text with OpenAI for prompt length: #{prompt.to_s.length} chars"
      
      begin
        response = self.class.post(
          '/chat/completions',
          headers: @auth_header,
          body: {
            model: model,
            messages: [
              { role: "system", content: "You are a vehicle expert providing purchase advice based on vehicle history and common issues." },
              { role: "user", content: prompt }
            ],
            max_tokens: max_tokens,
            temperature: 0.7
          }.to_json,
          timeout: 30
        )
        
        if response.success?
          content = response.parsed_response.dig('choices', 0, 'message', 'content')
          Rails.logger.info "OpenAI response received: #{content.to_s.length} chars"
          return content
        else
          Rails.logger.error "OpenAI API error: #{response.code} - #{response.body}"
          return nil
        end
      rescue => e
        Rails.logger.error "Error calling OpenAI API: #{e.message}"
        return nil
      end
    end
  end
end 