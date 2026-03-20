import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});


api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  }
);

export default api;
