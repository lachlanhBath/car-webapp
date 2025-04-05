class AddPriceToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :price, :integer
  end
end
