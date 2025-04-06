class AddTransmissionToListings < ActiveRecord::Migration[7.2]
  def change
    add_column :listings, :transmission, :string
  end
end
