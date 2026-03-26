import { toast } from 'react-hot-toast';

const errorHandler = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);

    // Handle different types of errors
    const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        defaultMessage;

    // Show error toast
    toast.error(errorMessage);

    // You can add more sophisticated error handling here
    // For example, redirect to login on 401
    if (error?.response?.status === 401) {
        // Handle unauthorized access
        // window.location.href = '/login';
    }

    // Return error for further handling if needed
    return Promise.reject(error);
};

export default errorHandler;
