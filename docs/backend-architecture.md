# Backend Architecture

## Overview

This document details the backend architecture for our car listing application. The backend is built with Ruby on Rails, utilizing PostgreSQL for data storage, Redis for caching and job queuing, and Sidekiq for background processing.

## Technology Stack

- **Ruby on Rails**: API-only mode for efficient JSON responses
- **PostgreSQL**: Primary data store
- **Redis**: Caching and Sidekiq queue management
- **Sidekiq**: Background job processing
- **Minitest**: Testing framework

## Application Structure

```
backend/
├── app/
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── listings_controller.rb
│   │   │   │   ├── vehicles_controller.rb
│   │   │   │   └── mot_histories_controller.rb
│   │   │   └── base_controller.rb
│   │   └── application_controller.rb
│   ├── models/
│   │   ├── listing.rb
│   │   ├── vehicle.rb
│   │   ├── mot_history.rb
│   │   ├── search.rb
│   │   └── favorite.rb
│   ├── jobs/
│   │   ├── scraper_job.rb
│   │   ├── vehicle_enrichment_job.rb
│   │   └── mot_history_job.rb
│   ├── services/
│   │   ├── scrapers/
│   │   │   ├── base_scraper.rb
│   │   │   ├── autotrader_scraper.rb
│   │   │   └── gumtree_scraper.rb
│   │   ├── enrichment/
│   │   │   ├── vehicle_data_service.rb
│   │   │   └── mot_history_service.rb
│   │   └── search/
│   │       └── listing_search_service.rb
│   └── serializers/
│       ├── listing_serializer.rb
│       ├── vehicle_serializer.rb
│       └── mot_history_serializer.rb
├── config/
│   ├── routes.rb
│   ├── database.yml
│   ├── sidekiq.yml
│   └── initializers/
│       ├── redis.rb
│       └── sidekiq.rb
├── db/
│   ├── migrate/
│   └── schema.rb
└── test/
    ├── models/
    ├── controllers/
    ├── services/
    └── jobs/
```

## API Design

The backend exposes a RESTful JSON API with versioning:

### Endpoints

```
GET    /api/v1/listings
GET    /api/v1/listings/:id
GET    /api/v1/vehicles/:id
GET    /api/v1/vehicles/:id/mot_histories
POST   /api/v1/searches
GET    /api/v1/searches/recent
```

### Authentication (Future Implementation)

- Token-based authentication for potential user accounts
- Rate limiting for public API endpoints

## Component Responsibilities

### Controllers

- Handle API requests and responses
- Validate incoming parameters
- Authorize requests (future implementation)
- Delegate business logic to services
- Return appropriate HTTP status codes and JSON responses

### Models

- Define database schema and relationships
- Implement validations and callbacks
- Provide scopes for common queries
- Handle simple business logic

### Jobs

- Execute long-running tasks asynchronously
- Retry failed jobs with exponential backoff
- Log job execution and errors
- Prioritize jobs based on importance

### Services

- Encapsulate complex business logic
- Handle external API integration
- Process data scraping and enrichment
- Execute search queries

### Serializers

- Convert models to JSON responses
- Customize response structure based on context
- Include/exclude fields based on permissions
- Handle nested relationships

## Background Processing

Sidekiq is used for three main types of background jobs:

1. **Scraper Jobs**: Periodically scrape car listing websites
   - Schedule: Every 1-2 hours
   - Concurrency: 5 workers

2. **Vehicle Enrichment Jobs**: Enrich vehicle data from external APIs
   - Triggered: After new listing creation
   - Concurrency: 3 workers

3. **MOT History Jobs**: Fetch MOT history for vehicles
   - Triggered: After vehicle enrichment
   - Concurrency: 3 workers

## Caching Strategy

Redis is used for caching to improve performance:

- **API Response Caching**: Cache common API responses for 5 minutes
- **External API Results**: Cache external API responses for 24 hours
- **Search Results**: Cache search results for 10 minutes
- **Fragment Caching**: Cache commonly accessed data fragments

## Error Handling

- Consistent error response format
- Detailed logging for debugging
- Graceful handling of external service failures
- Retry mechanisms for transient errors

## Monitoring and Logging

- Application logs with structured logging
- Sidekiq dashboard for job monitoring
- Error tracking with appropriate service
- Performance metrics collection

## Database Considerations

- Connection pooling for efficient database usage
- Prepared statements for repeated queries
- Database migrations with zero downtime
- Strategic use of indexes for query optimization

## Security Measures

- Parameter sanitization to prevent SQL injection
- Rate limiting to prevent abuse
- CORS configuration for frontend access
- Environment-based secrets management
- Security headers for API responses

## Testing Strategy

- Unit tests for models and services with Minitest
- Integration tests for API endpoints
- Job testing with Sidekiq test helpers
- Mocked external services
- CI/CD pipeline integration

## Deployment Considerations

- Docker containerization
- Environment-specific configuration
- Database migrations automation
- Sidekiq process management
- Redis configuration
- Health check endpoints 