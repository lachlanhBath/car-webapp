class MotHistory < ApplicationRecord
  belongs_to :vehicle
  
  validates :test_date, presence: true
  validates :result, inclusion: { in: %w[pass fail] }, allow_nil: true
  validates :odometer, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  
  scope :chronological, -> { order(test_date: :desc) }
  scope :passing, -> { where(result: 'pass') }
  scope :failing, -> { where(result: 'fail') }
  
  def passed?
    result == 'pass'
  end
  
  def failed?
    result == 'fail'
  end
  
  def days_until_expiry
    return nil unless expiry_date
    (expiry_date - Date.current).to_i
  end
  
  def expired?
    expiry_date && expiry_date < Date.current
  end
end
