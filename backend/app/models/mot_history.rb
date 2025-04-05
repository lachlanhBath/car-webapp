class MotHistory < ApplicationRecord
  belongs_to :vehicle

  validates :test_date, presence: true
  validates :result, inclusion: {in: %w[PASS FAIL]}, allow_nil: true
  validates :odometer, numericality: {only_integer: true, greater_than_or_equal_to: 0}, allow_nil: true

  scope :chronological, -> { order(test_date: :desc) }
  scope :passing, -> { where(result: "pass") }
  scope :failing, -> { where(result: "fail") }

  # Ensure advisory_notes and failure_reasons are always arrays
  def advisory_notes
    self[:advisory_notes] || []
  end

  def failure_reasons
    self[:failure_reasons] || []
  end

  def passed?
    result == "PASS"
  end

  def failed?
    result == "FAIL"
  end

  def days_until_expiry
    return nil unless expiry_date
    (expiry_date - Date.current).to_i
  end

  def expired?
    expiry_date && expiry_date < Date.current
  end
end
