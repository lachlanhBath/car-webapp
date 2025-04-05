class CreateMotHistories < ActiveRecord::Migration[7.2]
  def change
    create_table :mot_histories do |t|
      t.references :vehicle, null: false, foreign_key: true
      t.date :test_date
      t.date :expiry_date
      t.integer :odometer
      t.string :result
      t.text :advisory_notes
      t.text :failure_reasons

      t.timestamps
    end

    add_index :mot_histories, [:vehicle_id, :test_date]
  end
end
