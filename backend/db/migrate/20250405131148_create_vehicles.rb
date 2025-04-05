class CreateVehicles < ActiveRecord::Migration[7.2]
  def change
    create_table :vehicles do |t|
      t.references :listing, null: false, foreign_key: true
      t.string :make
      t.string :model
      t.integer :year
      t.string :fuel_type
      t.string :transmission
      t.string :engine_size
      t.string :color
      t.string :body_type
      t.integer :doors
      t.string :registration
      t.string :vin

      t.timestamps
    end

    add_index :vehicles, [:make, :model]
    add_index :vehicles, :registration
    add_index :vehicles, :vin
  end
end
