# Kuku Farm Dashboard

A React TypeScript application for tracking finances and inventory of a chicken farm.

## Environment Variables

The application uses environment variables to configure the backend API URL. This allows for different configurations in development and production environments.

### Available Environment Variables

- `VITE_API_URL`: The base URL for the backend API

### Environment Files

The following environment files are used:

- `.env`: Default environment variables
- `.env.development`: Development-specific variables (used when running `npm run dev`)
- `.env.production`: Production-specific variables (used when running `npm run build`)

### Usage

To modify the backend URL:

1. Edit the appropriate `.env` file
2. Set the `VITE_API_URL` variable to your backend URL
3. Restart the development server if it's running

Example:
```
VITE_API_URL=http://localhost:5055
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
