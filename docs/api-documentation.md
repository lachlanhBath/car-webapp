# API Documentation

## Overview

This document outlines the REST API endpoints provided by the car listing application. The API follows REST principles and returns JSON responses.

## Base URL

```
https://api.car-listing-app.example.com/api/v1
```

## Authentication

Most endpoints don't require authentication for the current phase. Future implementations may include API key or token-based authentication.

## Rate Limiting

Public endpoints are rate-limited to 60 requests per minute per IP address.

## Common Response Formats

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "error_code",
    "message": "Human readable error message",
    "details": {
      // Additional error details if available
    }
  }
}
```

## Endpoints

### Listings

#### List Listings

```
GET /listings
```

Retrieves a paginated list of car listings.

**Query Parameters:**

| Parameter   | Type    | Description                                      | Required |
|-------------|---------|--------------------------------------------------|----------|
| page        | integer | Page number (default: 1)                         | No       |
| per_page    | integer | Items per page (default: 20, max: 50)            | No       |
| make        | string  | Filter by vehicle make                           | No       |
| model       | string  | Filter by vehicle model                          | No       |
| min_price   | integer | Minimum price in GBP                             | No       |
| max_price   | integer | Maximum price in GBP                             | No       |
| year_from   | integer | Minimum year of manufacture                      | No       |
| year_to     | integer | Maximum year of manufacture                      | No       |
| fuel_type   | string  | Fuel type (petrol, diesel, electric, hybrid)     | No       |
| transmission| string  | Transmission type (manual, automatic)            | No       |
| sort_by     | string  | Sort field (price, year, posted_date)            | No       |
| sort_order  | string  | Sort order (asc, desc)                           | No       |

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "abc123",
        "title": "2018 Volkswagen Golf GTI 2.0 TSI",
        "price": 18995,
        "location": "Bath, Somerset",
        "thumbnail_url": "https://example.com/images/vw-golf-1.jpg",
        "post_date": "2023-04-01T10:30:00Z",
        "vehicle": {
          "make": "Volkswagen",
          "model": "Golf",
          "year": 2018,
          "fuel_type": "petrol",
          "transmission": "manual",
          "mileage": 35000
        }
      },
      // Additional listings...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 198,
      "per_page": 20
    }
  }
}
```

#### Get Listing

```
GET /listings/:id
```

Retrieves detailed information about a specific car listing.

**Path Parameters:**

| Parameter | Type   | Description             | Required |
|-----------|--------|-------------------------|----------|
| id        | string | Unique listing ID       | Yes      |

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": "abc123",
      "title": "2018 Volkswagen Golf GTI 2.0 TSI",
      "price": 18995,
      "location": "Bath, Somerset",
      "description": "Beautiful example of a VW Golf GTI in excellent condition...",
      "post_date": "2023-04-01T10:30:00Z",
      "source_url": "https://example-car-site.com/listing/abc123",
      "image_urls": [
        "https://example.com/images/vw-golf-1.jpg",
        "https://example.com/images/vw-golf-2.jpg",
        "https://example.com/images/vw-golf-3.jpg"
      ],
      "vehicle": {
        "id": "veh456",
        "make": "Volkswagen",
        "model": "Golf",
        "variant": "GTI 2.0 TSI",
        "year": 2018,
        "fuel_type": "petrol",
        "transmission": "manual",
        "engine_size": "2.0L",
        "body_type": "hatchback",
        "doors": 5,
        "color": "Tornado Red",
        "mileage": 35000,
        "registration": "AB18 XYZ",
        "has_mot_history": true
      }
    }
  }
}
```

### Vehicles

#### Get Vehicle Details

```
GET /vehicles/:id
```

Retrieves detailed information about a specific vehicle.

**Path Parameters:**

| Parameter | Type   | Description             | Required |
|-----------|--------|-------------------------|----------|
| id        | string | Unique vehicle ID       | Yes      |

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "id": "veh456",
      "make": "Volkswagen",
      "model": "Golf",
      "variant": "GTI 2.0 TSI",
      "year": 2018,
      "fuel_type": "petrol",
      "transmission": "manual",
      "engine_size": "2.0L",
      "body_type": "hatchback",
      "doors": 5,
      "color": "Tornado Red",
      "mileage": 35000,
      "registration": "AB18 XYZ",
      "vin": "WVWZZZ1KZJW123456",
      "listing_id": "abc123"
    }
  }
}
```

#### Get Vehicle MOT History

```
GET /vehicles/:id/mot_histories
```

Retrieves the MOT test history for a specific vehicle.

**Path Parameters:**

| Parameter | Type   | Description             | Required |
|-----------|--------|-------------------------|----------|
| id        | string | Unique vehicle ID       | Yes      |

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "mot_histories": [
      {
        "id": "mot123",
        "test_date": "2023-01-15",
        "expiry_date": "2024-01-14",
        "odometer": 32500,
        "result": "pass",
        "advisory_notes": "Rear brake pads wearing thin"
      },
      {
        "id": "mot456",
        "test_date": "2022-01-10",
        "expiry_date": "2023-01-09",
        "odometer": 20300,
        "result": "pass",
        "advisory_notes": "None"
      },
      {
        "id": "mot789",
        "test_date": "2021-01-05",
        "expiry_date": "2022-01-04",
        "odometer": 10100,
        "result": "pass",
        "advisory_notes": "None"
      }
    ]
  }
}
```

### Searches

#### Create Search

```
POST /searches
```

Saves a search query and returns matching results.

**Request Body:**

```json
{
  "search": {
    "make": "BMW",
    "model": "3 Series",
    "min_price": 15000,
    "max_price": 25000,
    "year_from": 2018,
    "fuel_type": "diesel"
  }
}
```

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "search_id": "search123",
    "results": {
      "listings": [
        // Listing objects as in GET /listings
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_count": 87,
        "per_page": 20
      }
    }
  }
}
```

#### Get Recent Searches

```
GET /searches/recent
```

Retrieves recently executed searches.

**Query Parameters:**

| Parameter | Type    | Description                           | Required |
|-----------|---------|---------------------------------------|----------|
| limit     | integer | Maximum number of searches (default: 5) | No     |

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "searches": [
      {
        "id": "search123",
        "query": {
          "make": "BMW",
          "model": "3 Series",
          "min_price": 15000,
          "max_price": 25000,
          "year_from": 2018,
          "fuel_type": "diesel"
        },
        "created_at": "2023-04-05T14:30:00Z",
        "result_count": 87
      },
      // Additional searches...
    ]
  }
}
```

## Error Codes

| Code              | HTTP Status | Description                                    |
|-------------------|-------------|------------------------------------------------|
| invalid_request   | 400         | Invalid request parameters                     |
| not_found         | 404         | Requested resource not found                   |
| rate_limit        | 429         | Rate limit exceeded                            |
| server_error      | 500         | Internal server error                          |
| service_unavailable | 503       | Service temporarily unavailable                |

## Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (starting from 1)
- `per_page`: Number of items per page (default: 20, max: 50)

Pagination information is included in the response:

```json
"pagination": {
  "current_page": 1,
  "total_pages": 10,
  "total_count": 198,
  "per_page": 20
}
```

## Filtering

Most list endpoints support filtering via query parameters. Multiple filters can be combined.

## Sorting

Sort results using:

- `sort_by`: Field to sort by (e.g., price, year, post_date)
- `sort_order`: Sort direction (asc or desc)

## API Versioning

The API is versioned via the URL path. The current version is v1.

## Data Formats

- Dates: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- Prices: Integers representing GBP (pounds)
- Mileage: Integers representing miles

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for integration with web applications.

## Future Enhancements

The following features are planned for future API versions:

- User authentication
- Favorite listings
- Price alerts
- Vehicle comparison
- Advanced filtering options
- Image search 