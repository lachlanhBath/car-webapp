class Vehicle < ApplicationRecord
  belongs_to :listing
  has_many :mot_histories, dependent: :destroy
  
  validates :year, numericality: { only_integer: true, greater_than: 1900, less_than_or_equal_to: -> { Time.current.year + 1 } }, allow_nil: true
  validates :doors, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :fuel_type, inclusion: { in: %w[petrol diesel electric hybrid lpg other] }, allow_nil: true
  validates :transmission, inclusion: { in: %w[manual automatic semi-automatic] }, allow_nil: true
  validates :body_type, inclusion: { in: %w[sedan hatchback suv estate coupe convertible mpv van pickup other] }, allow_nil: true
  
  scope :by_make, ->(make) { where('make ILIKE ?', make) if make.present? }
  scope :by_model, ->(model) { where('model ILIKE ?', model) if model.present? }
  scope :year_range, ->(min, max) { where(year: min..max) if min.present? && max.present? }
  
  # Methods
  def full_name
    [year, make, model].compact.join(' ')
  end
end
