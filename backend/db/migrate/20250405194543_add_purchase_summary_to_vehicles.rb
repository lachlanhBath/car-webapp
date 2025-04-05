class AddPurchaseSummaryToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :purchase_summary, :text
  end
end
