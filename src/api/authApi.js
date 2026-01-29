import axiosInstance from './axiosConfig';


export const authService = {
// Register new user
register  : async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
},

// Login user
login  : async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
},
// Get current user
getMe : async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
},

// Logout user
logout : async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
},

}

export default authService;