class MotHistoryResource < Madmin::Resource
  # Attributes
  attribute :id, form: false
  attribute :test_date
  attribute :expiry_date
  attribute :odometer
  attribute :result
  attribute :advisory_notes
  attribute :failure_reasons
  attribute :created_at, form: false
  attribute :updated_at, form: false

  # Associations
  attribute :vehicle

  # Uncomment this to customize the display name of records in the admin area.
  # def self.display_name(record)
  #   record.name
  # end

  # Uncomment this to customize the default sort column and direction.
  # def self.default_sort_column
  #   "created_at"
  # end
  #
  # def self.default_sort_direction
  #   "desc"
  # end
end
