class AddDvlaDataToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :dvla_data, :text
    add_column :vehicles, :co2_emissions, :integer
    add_column :vehicles, :tax_status, :string
    add_column :vehicles, :tax_due_date, :date
    add_column :vehicles, :mot_status, :string
    add_column :vehicles, :mot_expiry_date, :date
  end
end
