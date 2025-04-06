# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_04_06_015341) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "listings", force: :cascade do |t|
    t.string "source_url", null: false
    t.string "title"
    t.decimal "price", precision: 10, scale: 2
    t.string "location"
    t.text "description"
    t.text "image_urls", default: [], array: true
    t.datetime "post_date"
    t.string "source_id"
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "raw_data", default: {}, null: false
    t.string "transmission"
    t.index ["image_urls"], name: "index_listings_on_image_urls", using: :gin
    t.index ["post_date"], name: "index_listings_on_post_date"
    t.index ["price"], name: "index_listings_on_price"
    t.index ["raw_data"], name: "index_listings_on_raw_data", using: :gin
    t.index ["source_id"], name: "index_listings_on_source_id"
  end

  create_table "mot_histories", force: :cascade do |t|
    t.bigint "vehicle_id", null: false
    t.date "test_date"
    t.date "expiry_date"
    t.integer "odometer"
    t.string "result"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "advisory_notes", default: [], array: true
    t.string "failure_reasons", default: [], array: true
    t.index ["vehicle_id", "test_date"], name: "index_mot_histories_on_vehicle_id_and_test_date"
    t.index ["vehicle_id"], name: "index_mot_histories_on_vehicle_id"
  end

  create_table "searches", force: :cascade do |t|
    t.jsonb "query", default: {}, null: false
    t.bigint "user_id"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_searches_on_created_at"
    t.index ["query"], name: "index_searches_on_query", using: :gin
    t.index ["user_id"], name: "index_searches_on_user_id"
  end

  create_table "vehicles", force: :cascade do |t|
    t.bigint "listing_id", null: false
    t.string "make"
    t.string "model"
    t.integer "year"
    t.string "fuel_type"
    t.string "transmission"
    t.string "engine_size"
    t.string "color"
    t.string "body_type"
    t.integer "doors"
    t.string "registration", null: false
    t.string "vin"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.float "registration_confidence"
    t.string "registration_source"
    t.string "registration_image_url"
    t.text "dvla_data"
    t.integer "co2_emissions"
    t.string "tax_status"
    t.date "tax_due_date"
    t.string "mot_status"
    t.date "mot_expiry_date"
    t.integer "price"
    t.integer "mileage"
    t.text "purchase_summary"
    t.text "mot_repair_estimate"
    t.string "expected_lifetime"
    t.index ["listing_id"], name: "index_vehicles_on_listing_id"
    t.index ["make", "model"], name: "index_vehicles_on_make_and_model"
    t.index ["registration"], name: "index_vehicles_on_registration"
    t.index ["vin"], name: "index_vehicles_on_vin"
  end

  add_foreign_key "mot_histories", "vehicles"
  add_foreign_key "vehicles", "listings"
end
