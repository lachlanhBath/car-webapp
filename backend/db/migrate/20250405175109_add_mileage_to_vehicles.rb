class AddMileageToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :mileage, :integer
  end
end
