
import axios from 'axios';
import type { CheckRoomIdType, CreateRoomType, LoginDataType, RegisterDataType } from './types.';

// 1. Create a base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', // 👈 Your NestJS Auth Controller base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an interceptor to include the JWT token in future requests (for authenticated routes)
api.interceptors.request.use(config => {
  const data = localStorage.getItem('data');
  if(data){
    const parsedData=JSON.parse(data)
    // console.log('DATA',parsedData)
    if (parsedData?.token) {
    config.headers.Authorization = `Bearer ${parsedData.token}`;
  }
  }

  // console.log("CONFIG",config)
  
  return config;
}, error => {
  return Promise.reject(error);
});

// 3. Define and export specific API functions
export const authApi = {
  // POST /auth/register
  register: (data:RegisterDataType) => api.post('/auth/register', data), 
  
  // POST /auth/login
  login: (data:LoginDataType) => api.post('/auth/login', data),
};

export const roomApi={
  createRoom: (data:CreateRoomType)=> api.post('/room/createRoom',data),

  joinRoom: (data:CreateRoomType)=> api.post('/room/joinRoom',data),

  checkRoom : (data:CheckRoomIdType)=> api.post('/room/checkIfRoomExists',data),

  fetchRoomScoreBoard : (data:CheckRoomIdType)=> api.post('/room/fetchRoomScoreBoard',data),
}

export default api; // Export the base instance for other modules