const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, data: errorData };
    }
    return response.json();
  },
  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
    }
  },
  login: async (email, password) => {
    // Django obtain_auth_token expects 'username' field by default. 
    // We'll pass the email as the username for this API call.
    const response = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.non_field_errors?.[0] || 'Login failed');
    if (result.token) localStorage.setItem('auth_token', result.token);
    return result;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

export default api;
