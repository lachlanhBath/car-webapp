class AddOriginalPurchasePriceToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :original_purchase_price, :decimal
  end
end
