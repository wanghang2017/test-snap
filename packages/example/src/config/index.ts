declare const BACKEND_API_DOMAIN: string;
declare const BACKEND_API_AUTH: string;
declare const SNAP_BACKEND_API_DOMAIN: string;
declare const SNAP_BACKEND_API_AUTH: string;
declare const PROJECT_TOKEN: string;
declare const ENV: 'development' | 'staging' | 'production';
declare const SENTRY_SOURCE: string;
declare const FIAT_MRCR_API_WIDGET_ID: string;

export const BACKEND_DOMAIN = BACKEND_API_DOMAIN || '';
export const BACKEND_AUTH = BACKEND_API_AUTH || 'OHIyVTJ6ZGxVNDZWZmRqb3ROUmZMVWp3eVNuU3M3WVk6S2pTZ2FmQmVwMlNtcUNpTk42eTRkdjZEVjd6RGR0QVA=';

export const SNAP_BACKEND_DOMAIN = SNAP_BACKEND_API_DOMAIN;
export const SNAP_BACKEND_AUTH = SNAP_BACKEND_API_AUTH;
export const FIAT_MRCR_WIDGET_ID = FIAT_MRCR_API_WIDGET_ID;

export const ENVIRONMENT = ENV || 'development';
export const TRACK_TOKEN = PROJECT_TOKEN || 'btc_snap';
export const VERSION = '2.1.0';

export const SENTRY_DSN = SENTRY_SOURCE || '';
