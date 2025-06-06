# AutoBiography Documentation

## Introduction

Welcome to the documentation for our car listing application, built during Bath Hack 2025. This application scrapes car listing websites, enriches the data with vehicle details and MOT history, and presents it in a modern, sleek web interface.

## Documentation Index

### Architecture and Design

- [Architecture Overview](architecture-overview.md) - High-level system architecture
- [Database Schema](database-schema.md) - Database design and relationships
- [Backend Architecture](backend-architecture.md) - Rails API and background processing
- [Frontend Architecture](frontend-architecture.md) - React application structure
- [API Documentation](api-documentation.md) - REST API endpoints and usage

### Implementation Details

- [Scraping Strategy](scraping-strategy.md) - Approach to collecting car listing data
- [Hackathon Roadmap](hackathon-roadmap.md) - 24-hour development plan

## Application Features

Our car listing application provides the following key features:

1. **Comprehensive Car Listings**
   - Data aggregated from multiple sources
   - Detailed vehicle specifications
   - High-quality images
   - Pricing information

2. **Advanced Search and Filtering**
   - Search by make, model, year, price
   - Filter by vehicle attributes (fuel type, transmission, etc.)
   - Sort by relevance, price, age

3. **MOT History Integration**
   - Complete MOT test history
   - Failure points and advisories
   - Mileage progression

4. **Modern User Interface**
   - Responsive design for all devices
   - Fast, intuitive navigation
   - Clean, information-dense layouts

## Technology Stack

- **Backend**: Ruby on Rails, PostgreSQL, Redis, Sidekiq
- **Frontend**: React, TypeScript, TailwindCSS
- **Infrastructure**: Docker (optional for development)

## Development Setup

For information on setting up the development environment, see:

- Backend setup instructions in the `backend/README.md` file
- Frontend setup instructions in the `frontend/README.md` file (when implemented)

## Project Structure

```
project/
├── backend/              # Rails API application
├── frontend/             # React frontend application (to be implemented)
└── docs/                 # Project documentation
    ├── architecture-overview.md
    ├── database-schema.md
    ├── backend-architecture.md
    ├── frontend-architecture.md
    ├── api-documentation.md
    ├── scraping-strategy.md
    ├── hackathon-roadmap.md
    └── README.md         # This file
```

## Contributing

As this is a hackathon project, we're focused on rapid development within the 24-hour timeframe. The documentation provides a blueprint for implementation, but certain aspects may evolve during development.

## Future Enhancements

Beyond the hackathon, we've identified several potential enhancements:

1. User accounts and saved searches
2. Price drop alerts
3. Vehicle comparison tools
4. Mobile applications
5. Dealer contact integration

## License

This project is created for Bath Hack 2025 and is not currently licensed for production use.

## Development Best Practices

### Directory Structure

Always check your current directory before running commands to avoid confusion between frontend and backend:

```bash
# Check your current directory
pwd

# For backend commands, ensure you're in the backend directory
cd backend
bundle exec rails ...

# For frontend commands, ensure you're in the frontend directory
cd frontend
npm run ...
```

This project is separated into frontend and backend directories, and commands intended for one will not work in the other. Taking a moment to verify your location can save troubleshooting time. 
