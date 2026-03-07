const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Convenience methods
export const api = {
  get:    (path)         => apiFetch(path, { method: 'GET' }),
  post:   (path, body)   => apiFetch(path, { method: 'POST',     body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',      body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE'}),
};