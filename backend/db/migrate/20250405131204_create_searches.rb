class CreateSearches < ActiveRecord::Migration[7.2]
  def change
    create_table :searches do |t|
      t.jsonb :query, null: false, default: {}
      t.bigint :user_id
      t.string :ip_address

      t.timestamps
    end

    add_index :searches, :query, using: :gin
    add_index :searches, :user_id
    add_index :searches, :created_at
  end
end
