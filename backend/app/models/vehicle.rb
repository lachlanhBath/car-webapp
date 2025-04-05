class Vehicle < ApplicationRecord
  belongs_to :listing
  has_many :mot_histories, dependent: :destroy

  validates :year, numericality: {only_integer: true, greater_than: 1900, less_than_or_equal_to: -> { Time.current.year + 1 }}, allow_nil: true
  validates :doors, numericality: {only_integer: true, greater_than: 0}, allow_nil: true

  scope :by_make, ->(make) { where("make ILIKE ?", make) if make.present? }
  scope :by_model, ->(model) { where("model ILIKE ?", model) if model.present? }
  scope :year_range, ->(min, max) { where(year: min..max) if min.present? && max.present? }

  after_create :enqueue_dvla_enquiry
  after_create :generate_purchase_summary

  # Methods
  def full_name
    [year, make, model].compact.join(" ")
  end

  def enqueue_dvla_enquiry
    DvlaVehicleEnquiryJob.perform_later(id)
  end
  
  def generate_purchase_summary
    PurchaseSummaryJob.perform_later(id)
  end
end
