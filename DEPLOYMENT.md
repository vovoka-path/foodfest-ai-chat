# Deployment Instructions

## Prerequisites

- Docker and Docker Compose must be installed.

## Steps

1.  Ensure the `.env` file is configured with the correct database credentials.
2.  Run `docker compose up -d` to start all services defined in the `docker-compose.yml` file.
3.  Run `npm run start:dev` to start the application.

## Notes

- The database is configured to run on port 5433.
- The application connects to the database using the `DATABASE_URL` environment variable.