import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import errorHandler from '@/lib/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://www.easebrain.live/api';

// Create axios instance with base URL and default headers
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for sending cookies with requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return errorHandler(error);
    }
);

// Custom hook for GET requests
export const useFetch = (key, url, options = {}) => {
    return useQuery({
        queryKey: [key],
        queryFn: async () => {
            const { data } = await api.get(url);
            return data;
        },
        ...options,
    });
};

// Custom hook for POST, PUT, DELETE requests
export const useApiMutation = (method, url, queryKey, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await api({
                method,
                url,
                data: payload,
            });
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch
            if (queryKey) {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
            }
        },
        onError: (error) => {
            console.error('Mutation error:', error);
        },
        ...options,
    });
};

export default api;
