/* ----- my-login-app/src/api.js ----- */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CDN = import.meta.env.VITE_CDN_BASE_URL;

/**
 * Core fetch wrapper. Attaches auth token, sets JSON headers,
 * handles 401 redirects, and throws on non-OK responses.
 */
const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {

      if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 409) {
          alert('Cannot delete.');
          return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const apiLogin = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Login failed');
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }

  return response.json();
};

const cdnURL = (path) => {
  const url = CDN + path 
  return url
}; 

// Convenience methods
export const api = {
  get:    (path)         => apiFetch(path, { method: 'GET' }),
  post:   (path, body)   => apiFetch(path, { method: 'POST',     body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',      body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE'}),
  login:  (path, body)   => apiLogin(path, { method: 'POST',     body: body}),
  cdn:    (path)         => cdnURL(path),
};