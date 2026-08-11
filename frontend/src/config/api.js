const trimTrailingSlash = (value) => value?.replace(/\/+$/, '');

const localApiUrl = 'http://localhost:5000/api';
const localSocketUrl = 'http://localhost:5000';
const sameOriginApiUrl = `${window.location.origin}/api`;

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? localApiUrl : sameOriginApiUrl)
);

export const SOCKET_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.DEV ? localSocketUrl : API_URL.replace(/\/api$/, ''))
);
