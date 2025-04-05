# Database Schema

## Overview

This document outlines the PostgreSQL database schema for our car listing application. The schema is designed for efficient storage and retrieval of car listings, vehicle details, MOT history, and user interactions.

## Entity Relationship Diagram

```
+---------------+       +----------------+       +----------------+
|    Listing    |       |    Vehicle     |       |   MOTHistory   |
+---------------+       +----------------+       +----------------+
| id            |------>| id             |------>| id             |
| source_url    |       | listing_id     |       | vehicle_id     |
| title         |       | make           |       | test_date      |
| price         |       | model          |       | expiry_date    |
| location      |       | year           |       | odometer       |
| description   |       | fuel_type      |       | result         |
| image_urls    |       | transmission   |       | advisory_notes |
| post_date     |       | engine_size    |       | failure_reasons|
| source_id     |       | color          |       | created_at     |
| created_at    |       | body_type      |       | updated_at     |
| updated_at    |       | doors          |       +----------------+
| status        |       | registration   |
+---------------+       | vin            |
                        | created_at     |
                        | updated_at     |
                        +----------------+
```

## Tables

### Listings

Stores data scraped directly from car listing websites.

| Column       | Type         | Description                                      |
|--------------|--------------|--------------------------------------------------|
| id           | bigint       | Primary key                                      |
| source_url   | string       | Original URL of the listing                      |
| title        | string       | Listing title                                    |
| price        | decimal      | Listed price                                     |
| location     | string       | Geographic location of the vehicle               |
| description  | text         | Full description from the listing                |
| image_urls   | string[]     | Array of image URLs                              |
| post_date    | datetime     | When the listing was posted                      |
| source_id    | string       | Identifier from the source website               |
| created_at   | datetime     | Record creation timestamp                        |
| updated_at   | datetime     | Record update timestamp                          |
| status       | enum         | Status of listing (active, sold, expired)        |

### Vehicles

Contains enriched vehicle data associated with listings.

| Column        | Type         | Description                                     |
|---------------|--------------|------------------------------------------------|
| id            | bigint       | Primary key                                     |
| listing_id    | bigint       | Foreign key to listings table                   |
| make          | string       | Vehicle manufacturer                            |
| model         | string       | Vehicle model                                   |
| year          | integer      | Year of manufacture                             |
| fuel_type     | enum         | Fuel type (petrol, diesel, electric, hybrid)    |
| transmission  | enum         | Transmission type (manual, automatic)           |
| engine_size   | string       | Engine size/capacity                            |
| color         | string       | Vehicle color                                   |
| body_type     | enum         | Body type (sedan, hatchback, SUV, etc.)         |
| doors         | integer      | Number of doors                                 |
| registration  | string       | Vehicle registration number                     |
| vin           | string       | Vehicle identification number                   |
| created_at    | datetime     | Record creation timestamp                       |
| updated_at    | datetime     | Record update timestamp                         |

### MOT History

Stores MOT test history for vehicles.

| Column          | Type         | Description                                    |
|-----------------|--------------|------------------------------------------------|
| id              | bigint       | Primary key                                    |
| vehicle_id      | bigint       | Foreign key to vehicles table                  |
| test_date       | date         | Date of MOT test                               |
| expiry_date     | date         | MOT expiry date                                |
| odometer        | integer      | Odometer reading at test                       |
| result          | enum         | Test result (pass, fail)                       |
| advisory_notes  | text         | Advisory notes from the test                   |
| failure_reasons | text         | Reasons for failure if applicable              |
| created_at      | datetime     | Record creation timestamp                      |
| updated_at      | datetime     | Record update timestamp                        |

### Additional Tables

#### Searches

| Column      | Type      | Description                                |
|-------------|-----------|--------------------------------------------|
| id          | bigint    | Primary key                                |
| query       | jsonb     | Search parameters                          |
| user_id     | bigint    | User who performed search (null if guest)  |
| created_at  | datetime  | Search timestamp                           |
| ip_address  | string    | IP address of searcher                     |

#### Favorites (for future implementation)

| Column      | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | bigint    | Primary key                          |
| user_id     | bigint    | Foreign key to users                 |
| listing_id  | bigint    | Foreign key to listings              |
| created_at  | datetime  | When favorited                       |
| notes       | text      | User notes about the listing         |

## Indexes

- `listings_source_id_idx` on `listings.source_id`
- `listings_price_idx` on `listings.price`
- `listings_post_date_idx` on `listings.post_date`
- `vehicles_make_model_idx` on `vehicles.make, vehicles.model`
- `vehicles_registration_idx` on `vehicles.registration`
- `vehicles_vin_idx` on `vehicles.vin`
- `mot_history_vehicle_id_test_date_idx` on `mot_history.vehicle_id, mot_history.test_date`

## Notes

- All tables include appropriate foreign key constraints with cascading deletes
- JSONB is used for the search query storage to allow for flexible search parameters
- Array types are used for image URLs to avoid a separate join table
- Enums are used where appropriate to constrain values and improve query performance
- Timestamps are automatically managed by Rails 