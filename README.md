# Welcome to the LaunchDarkly 2025 ToggleBank Template Demo App

This demo focuses on covering the 4 core use cases across in the financial industry in a fictional company Togglebank... 

- Monitor & Remediate Releases
- Accelerate AI
- Optimize Experiences
- Increase Release Velocity

## Setup Options

### Option 1: Docker Compose (Recommended)

This setup includes the ToggleBank app with a PostgreSQL database and all necessary services for a production-like environment.

#### Prerequisites

- Docker and Docker Compose installed on your system (e.g. [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/))
- LaunchDarkly account with API keys
- AWS account with Bedrock access (optional, for AI features)

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LaunchDarklyToggleBank
   ```

2. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

3. **Start the services**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in detached mode
   docker-compose up -d --build
   ```

4. **Access the application**
   - ToggleBank App: http://localhost:3000
   - PostgreSQL Database: localhost:5432

#### Environment Variables

Copy `env.example` to `.env` and configure the following variables:

**Required LaunchDarkly Configuration:**
- `NEXT_PUBLIC_LD_CLIENT_KEY`: Your LaunchDarkly client-side ID (go to Project Settings > Environments, then click the ellipses next to your environment)
- `LD_SDK_KEY`: Your LaunchDarkly SDK key (go to Project Settings > Environments, then click the ellipses next to your environment)
- `LD_API_KEY`: Your LaunchDarkly API key (create an access token [here](https://app.launchdarkly.com/settings/authorization))
- `PROJECT_KEY`: Your LaunchDarkly project key (find this [here](https://app.launchdarkly.com/settings/projects))

**Database Configuration:**
- `DB_URL`: PostgreSQL connection string (defaults to local container)
- `POSTGRES_DB`: Database name (default: togglebank)
- `POSTGRES_USER`: Database user (default: postgres)
- `POSTGRES_PASSWORD`: Database password (default: password)

**Optional AWS Configuration (for AI features):**
- `AWS_ACCESS_KEY_ID`: AWS access key for Bedrock integration
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for Bedrock integration
- `AWS_DEFAULT_REGION`: AWS region (default: us-west-2)

#### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Rebuild containers
docker-compose up --build

# View running services
docker-compose ps
```

#### Database Setup

The PostgreSQL database will be automatically initialized. If you need to run database migrations:

```bash
# Run migrations (if needed)
docker-compose exec app npm run db:migrate

# Or access the database directly
docker-compose exec postgres psql -U postgres -d togglebank
```

#### Troubleshooting

1. **Port conflicts**: If ports 3000 or 5432 are already in use, modify the ports in `docker-compose.yml`

2. **Environment variables**: Ensure all required environment variables are set in your `.env` file

3. **Database connection**: The app will wait for the database to be ready before starting

4. **Build issues**: Try rebuilding the containers with `docker-compose up --build`

5. **View logs**: Use `docker-compose logs -f` to see real-time logs from all services

6. **AWS Bedrock issues**: If you see "I'm sorry. Please try again." for AI requests:
   - Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in your `.env` file
   - **For temporary credentials**: Also set `AWS_SESSION_TOKEN` (required for ASIA-prefixed keys)
   - Verify your AWS credentials have Bedrock permissions
   - Check that `AWS_DEFAULT_REGION` is set to a region that supports Bedrock (e.g., us-east-1, us-west-2)
   - Ensure your AWS account has access to the Bedrock service
   - Check the application logs: `docker-compose logs app`
   - **Common issue**: If you see "security token included in the request is invalid", your AWS credentials have expired

7. **LaunchDarkly configuration**: If AI features aren't working:
   - Verify all LaunchDarkly environment variables are set correctly
   - Check that your LaunchDarkly project has the AI configuration flags set up
   - Ensure your LaunchDarkly API keys have the necessary permissions

#### Testing AWS Bedrock Configuration

To test if your AWS Bedrock setup is working correctly:

```bash
# Validate AWS credentials first
node validate-aws-credentials.js

# Test Bedrock connection
node test-bedrock.js
```

**validate-aws-credentials.js** will:
- Check if all required AWS environment variables are set
- Detect if you're using temporary credentials (which expire)
- Test AWS credentials with STS
- Verify Bedrock permissions
- Provide specific guidance for common issues

**test-bedrock.js** will:
- Test the connection to AWS Bedrock
- Verify that your credentials have the necessary permissions
- Test a simple Bedrock API call

### Option 2: Local Development (For Development Only)

For development with hot reloading and faster iteration:

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

The app will be available at `http://localhost:3000`

**Note**: For local development, you'll need to set up your own PostgreSQL database or use the Docker database:

```bash
# Start just the database from Docker Compose
docker-compose up postgres -d

# Then run the app locally
npm run dev
```

This approach gives you hot reloading while still using the containerized database.

## Architecture

The ToggleBank demo showcases:
- **Feature Flags**: LaunchDarkly integration for feature management
- **AI Integration**: AWS Bedrock for AI-powered features
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Next.js API routes

## Support

For issues and questions, please refer to the LaunchDarkly documentation or contact the development team.
