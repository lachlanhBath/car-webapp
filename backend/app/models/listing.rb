class Listing < ApplicationRecord
  has_one :vehicle, dependent: :destroy

  validates :source_id, presence: true, uniqueness: true
  validates :source_url, presence: true
  validates :price, numericality: {greater_than_or_equal_to: 0}, allow_nil: true
  validates :status, inclusion: {in: %w[active sold expired]}

  scope :active, -> { where(status: "active") }
  scope :recent, -> { order(post_date: :desc) }
  scope :price_range, ->(min, max) { where(price: min..max) if min.present? && max.present? }

  # Process this listing after saving (extract license plate, create/update vehicle)
  after_save :queue_processing, if: -> { saved_change_to_id? || saved_change_to_image_urls? || saved_change_to_status? }

  # Handle array of specs from raw data
  def specs
    raw_data.try(:[], "specs") || raw_data.try(:[], :specs) || []
  end

  # Get source name from URL
  def source_name
    if source_url.include?("autotrader.co.uk")
      "Autotrader"
    elsif source_url.include?("gumtree.com")
      "Gumtree"
    elsif source_url.include?("motors.co.uk")
      "Motors"
    else
      "Unknown"
    end
  end

  def self.search(params)
    listings = Listing.active

    listings = listings.where("title ILIKE ?", "%#{params[:keyword]}%") if params[:keyword].present?
    listings = listings.where("location ILIKE ?", "%#{params[:location]}%") if params[:location].present?
    listings = listings.price_range(params[:min_price], params[:max_price])

    # Search in raw_data for additional fields
    if params[:make].present? || params[:model].present?
      listings = listings.joins(:vehicle).where(
        "vehicles.make ILIKE ? OR vehicles.model ILIKE ?",
        "%#{params[:make]}%",
        "%#{params[:model]}%"
      )
    end

    if params[:fuel_type].present?
      listings = listings.joins(:vehicle).where("vehicles.fuel_type ILIKE ?", "%#{params[:fuel_type]}%")
    end

    if params[:transmission].present?
      listings = listings.joins(:vehicle).where("vehicles.transmission ILIKE ?", "%#{params[:transmission]}%")
    end

    listings
  end

  # Queue the listing for license plate extraction and vehicle creation/update
  def process_for_vehicle_creation
    ProcessListingImagesJob.perform_later(id) if image_urls.present? && status == "active"
  end

  private

  def queue_processing
    # Only enqueue if there are image URLs to process and the listing is active
    if image_urls.present? && status == "active"
      ProcessListingImagesJob.perform_later(id)
    end
  end
end
