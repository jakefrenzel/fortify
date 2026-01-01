import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 10000;

// Get CSRF token from cookies
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null; // SSR check
  
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');

    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  
  return null;
};

export const initializeCsrfToken = async (): Promise<void> => {
  try {

    await axios.get(`${API_BASE_URL}/auth/csrf/`, {
      withCredentials: true,
    });

    console.log('🔐 CSRF token initialized');

  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
  }
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        // Log request details in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`,
                config.data ? `\nData: ` : '',
                config.data || ''
            );
        }
        
        // You can add authorization headers or other custom headers here
        return config;
    },
    (error: AxiosError) => {
        // Handle request errors
        console.error('❌ [API Request Error]:', error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?:  unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    // SUCCESS RESPONSE HANDLER
    (response: AxiosResponse) => {

        // Log response details in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
                `\nStatus: ${response.status}`,
                response.data
            );
        }

        return response;
    },

    // ERROR RESPONSE HANDLER
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error details in development mode
        if (process.env.NODE_ENV === 'development') {
            console.error(
                `❌ [API Response Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
                `\nStatus: ${error.response?.status}`,
                error.response?.data
            );
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

            const skipRefreshUrls = ['/auth/login/', '/auth/register/', '/auth/refresh/'];
            const allowedSkipRefresh = skipRefreshUrls.some(url => originalRequest.url?.includes(url));

            if (allowedSkipRefresh) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => axiosInstance(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            // Mark the request as retried to avoid infinite loop
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                await axiosInstance.post('/auth/refresh/');

                console.log('🔄 Token refreshed successfully');

                // Process the queued requests
                processQueue(null);
                isRefreshing = false;

                // Retry the original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error('❌ Token refresh failed');

                // Refresh token is invalid or expired
                processQueue(refreshError as AxiosError);
                isRefreshing = false;

                // Redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/acccounts/login';
                }

                return Promise.reject(refreshError);
            }
        }
    

        // HANDLE OTHER ERRORS

        // 403 FORBIDDEN - User does not have permission
        if (error.response?.status === 403) {
            console.error('🚫 Access forbidden');
            // Optionally redirect to a forbidden page
        }

        // 404 NOT FOUND - Resource not found
        if (error.response?.status === 404) {
            console.error('🔍 Resource not found');
        }

        // 500 Server Error
        if (error.response?.status === 500) {
            console.error('💥 Server error');
            // You could show a toast notification here
        }

        // Network errors (no internet, CORS issues, etc.)
        if (! error.response) {
            console.error('🌐 Network error - check your connection');
        }

        return Promise.reject(error);
    }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as { error?:  string; detail?: string };
    return (
      errorData?.error ||
      errorData?.detail ||
      error.message ||
      'An unexpected error occurred'
    );
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isErrorStatus = (error: unknown, status: number): boolean => {
  return axios.isAxiosError(error) && error.response?.status === status;
};

export default axiosInstance;

