class AddRawDataToListingsAndFixImageUrls < ActiveRecord::Migration[7.2]
  def up
    # Add raw_data column if it doesn't exist
    unless column_exists?(:listings, :raw_data)
      add_column :listings, :raw_data, :jsonb, default: {}, null: false
      add_index :listings, :raw_data, using: :gin
    end
    
    # Remove the array index if it exists
    if index_exists?(:listings, :image_urls)
      remove_index :listings, :image_urls
    end
    
    # Change image_urls column to text array if it's not already
    change_column :listings, :image_urls, :text, array: true, default: [], using: "image_urls::text[]"
    
    # Add gin index for text array
    add_index :listings, :image_urls, using: :gin
  end
  
  def down
    # Remove raw_data column if it exists
    if column_exists?(:listings, :raw_data)
      remove_index :listings, :raw_data
      remove_column :listings, :raw_data
    end
    
    # Remove the array index if it exists
    if index_exists?(:listings, :image_urls)
      remove_index :listings, :image_urls
    end
    
    # Change image_urls back to string
    change_column :listings, :image_urls, :string, array: true, default: []
  end
end
