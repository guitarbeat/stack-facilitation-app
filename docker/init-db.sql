-- Database initialization script for Stack Facilitation App
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases for testing
CREATE DATABASE stack_facilitation_test;
CREATE DATABASE stack_facilitation_dev;

-- Create extensions if needed
\c stack_facilitation;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c stack_facilitation_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c stack_facilitation_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE stack_facilitation TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stack_facilitation_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stack_facilitation_dev TO postgres;

