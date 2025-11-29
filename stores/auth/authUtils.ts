import { AxiosError } from 'axios';
import type { ApiErrorResponse } from './authTypes';

export const handleApiError = (error: unknown, customErrorMsg?: string): ApiErrorResponse => {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  // Handle specific error responses (401, 400, etc.)
  if (axiosError.response?.status === 401 || axiosError.response?.status === 400) {
    const responseData = axiosError.response.data;

    if (responseData?.message) {
      return { success: false, errors: [responseData.message] };
    }

    if (responseData?.error) {
      return { success: false, errors: [responseData.error] };
    }
  }

  // Handle network errors
  if (axiosError.message?.toLowerCase().includes('network') ||
      axiosError.message?.toLowerCase().includes('connect') ||
      axiosError.message?.toLowerCase().includes('timeout')) {
    return {
      success: false,
      errors: ['Unable to connect to server. Please check your connection.']
    };
  }

  const message = customErrorMsg || axiosError.message || 'An unexpected error occurred';
  return { success: false, errors: [message] };
};

export const getErrorMessage = (error: ApiErrorResponse): string => {
  return error.errors[0] || 'An unexpected error occurred';
};

