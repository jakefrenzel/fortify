import axiosInstance, { getErrorMessage } from "@/lib/axios";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth";

// Authentication API methods
export const authAPI = {

    // Login user
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { data } = await axiosInstance.post<AuthResponse>(
                '/auth/login/',
                credentials
            );

        return data;

        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },


    // Register user
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            const { data } = await axiosInstance.post<AuthResponse>(
                '/auth/register/',
                credentials
            );

            return data;

        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },


    // Logout user
    async logout(): Promise<void> {
        try {

            await axiosInstance.post('/auth/logout/');

        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },


    // Refresh access token
    async refreshToken(): Promise<void> {
        try {

            await axiosInstance.post('/auth/refresh/');

        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    // Get current user
    async getCurrentUser(): Promise<User> {
        try {

            const { data } = await axiosInstance.get<User>('/accounts/current/');
            return data;

        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },
};

export const userAPI = {
    // Fetch user profile, or whatever user-related data you need
}
