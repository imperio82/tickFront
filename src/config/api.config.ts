export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const AUTH_CONFIG = {
  TOKEN_KEY: 'tickmark_access_token',
  REFRESH_TOKEN_KEY: 'tickmark_refresh_token',
  USER_KEY: 'tickmark_user',
};
