import axios from 'axios';
import type { CheckRoomIdType, CreateRoomType, JoinRoomType, LoginDataType, RegisterDataType } from './types.';

//base Axios instance
const api = axios.create({
  baseURL:import.meta.env.VITE_MODE === "PRODUCTION" ? import.meta.env.VITE_BACKEND_URL : 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

//interceptor to include the JWT token in future requests (for authenticated routes)
api.interceptors.request.use(config => {
  const data = localStorage.getItem('scribbleDraw-data');
  if(data){
    const parsedData=JSON.parse(data)
    if (parsedData?.token) {
    config.headers.Authorization = `Bearer ${parsedData.token}`;
  }
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export const attachLoadingInterceptor = (setActiveRequests: React.Dispatch<React.SetStateAction<number>>) => {
  api.interceptors.request.use((config) => {
    setActiveRequests(prev => prev + 1);
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  api.interceptors.response.use(
    (response) => {
      // Small delay so the "Sketching" animation is actually visible 
      // even on fast connections
      setTimeout(() => {
        setActiveRequests(prev => Math.max(0, prev - 1));
      }, 300);
      return response;
    },
    (error) => {
      setActiveRequests(prev => Math.max(0, prev - 1));
      return Promise.reject(error);
    }
  );
};

//API functions
export const authApi = {
  register: (data:RegisterDataType) => api.post('/auth/register', data), 
  
  login: (data:LoginDataType) => api.post('/auth/login', data),

  verify: ()=> api.post('auth/verifyUser'),
};

export const roomApi={
  createRoom: (data:CreateRoomType)=> api.post('/room/createRoom',data),

  joinRoom: (data:JoinRoomType)=> api.post('/room/joinRoom',data),

  checkRoom : (data:CheckRoomIdType)=> api.post('/room/checkIfRoomExists',data),

  fetchRoomScoreBoard : (data:CheckRoomIdType)=> api.post('/room/fetchRoomScoreBoard',data),
}

export default api;