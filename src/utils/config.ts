/**
 * Configuration utility for environment variables
 */

// API URL from environment variable with fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5055';

// Helper function to build API endpoints
export const buildApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};
