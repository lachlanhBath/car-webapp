class VehicleResource < Madmin::Resource
  # Attributes
  attribute :id, form: false
  attribute :make
  attribute :model
  attribute :year
  attribute :fuel_type
  attribute :transmission
  attribute :engine_size
  attribute :color
  attribute :body_type
  attribute :doors
  attribute :registration
  attribute :vin
  attribute :created_at, form: false
  attribute :updated_at, form: false

  # Associations
  attribute :listing
  attribute :mot_histories

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
