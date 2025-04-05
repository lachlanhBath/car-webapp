class AddMotRepairEstimateToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :mot_repair_estimate, :text
  end
end
