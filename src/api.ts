
import axios from 'axios';

// 1. Create a base Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // 👈 Your NestJS Auth Controller base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an interceptor to include the JWT token in future requests (for authenticated routes)
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// 3. Define and export specific API functions
export const authApi = {
  // POST /auth/register
  register: (data) => api.post('/auth/register', data), 
  
  // POST /auth/login
  login: (data) => api.post('/auth/login', data),
};

export default api; // Export the base instance for other modules