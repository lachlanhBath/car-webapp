class EnforceVehicleRegistrationRequirement < ActiveRecord::Migration[7.2]
  def up
    # First, fill in missing registrations with generated values
    execute <<-SQL
      UPDATE vehicles
      SET registration = CONCAT('TEMP', id, 'X')
      WHERE registration IS NULL
    SQL
    
    # Add the NOT NULL constraint
    change_column_null :vehicles, :registration, false
    
    # Add an index for faster lookup by registration
    add_index :vehicles, :registration, unique: true, if_not_exists: true
  end
  
  def down
    # Remove the NOT NULL constraint
    change_column_null :vehicles, :registration, true
    
    # Remove the unique index
    remove_index :vehicles, :registration, if_exists: true
  end
end
