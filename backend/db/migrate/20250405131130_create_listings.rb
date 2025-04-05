class CreateListings < ActiveRecord::Migration[7.2]
  def change
    create_table :listings do |t|
      t.string :source_url, null: false
      t.string :title
      t.decimal :price, precision: 10, scale: 2
      t.string :location
      t.text :description
      t.string :image_urls, array: true, default: []
      t.datetime :post_date
      t.string :source_id
      t.string :status, default: 'active'
      t.jsonb :raw_data, default: {}

      t.timestamps
    end

    add_index :listings, :source_id
    add_index :listings, :price
    add_index :listings, :post_date
    add_index :listings, :image_urls, using: :gin
  end
end
