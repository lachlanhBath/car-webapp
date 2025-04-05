class AddExpectedLifetimeToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :expected_lifetime, :string
  end
end
