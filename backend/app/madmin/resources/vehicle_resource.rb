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
  attribute :registration_confidence
  attribute :registration_source
  attribute :registration_image_url
  attribute :co2_emissions
  attribute :tax_status
  attribute :tax_due_date
  attribute :mot_status
  attribute :mot_expiry_date
  attribute :price
  attribute :created_at, form: false
  attribute :updated_at, form: false

  # t.bigint "listing_id", null: false
  #   t.string "make"
  #   t.string "model"
  #   t.integer "year"
  #   t.string "fuel_type"
  #   t.string "transmission"
  #   t.string "engine_size"
  #   t.string "color"
  #   t.string "body_type"
  #   t.integer "doors"
  #   t.string "registration", null: false
  #   t.string "vin"
  #   t.datetime "created_at", null: false
  #   t.datetime "updated_at", null: false
  #   t.float "registration_confidence"
  #   t.string "registration_source"
  #   t.string "registration_image_url"
  #   t.text "dvla_data"
  #   t.integer "co2_emissions"
  #   t.string "tax_status"
  #   t.date "tax_due_date"
  #   t.string "mot_status"
  #   t.date "mot_expiry_date"
  #   t.integer "price"#
  
  

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
