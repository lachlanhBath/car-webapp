class ListingResource < Madmin::Resource
  # Attributes
  attribute :id, form: false
  attribute :source_url
  attribute :title
  attribute :price
  attribute :location
  attribute :description
  attribute :image_urls
  attribute :post_date
  attribute :source_id
  attribute :status
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
