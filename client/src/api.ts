import axios from 'axios';

// Create an Axios instance with base configurations
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_LOCAL || import.meta.env.VITE_API_URL_PRODUCTION, 
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default api