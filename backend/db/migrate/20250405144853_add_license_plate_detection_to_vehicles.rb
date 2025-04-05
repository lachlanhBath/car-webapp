class AddLicensePlateDetectionToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :registration_confidence, :float
    add_column :vehicles, :registration_source, :string
    add_column :vehicles, :registration_image_url, :string
  end
end
