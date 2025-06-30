import toast from 'react-hot-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export const handleError = (error: unknown, context: string = 'Operation'): AppError => {
  let appError: AppError;

  if (error instanceof Error) {
    appError = {
      message: error.message,
      code: (error as Error & { code?: string }).code,
      details: error
    };
  } else if (typeof error === 'string') {
    appError = {
      message: error,
      code: 'UNKNOWN_ERROR'
    };
  } else if (error && typeof error === 'object' && 'message' in error) {
    appError = {
      message: String(error.message),
      code: (error as { code?: string }).code,
      details: error
    };
  } else {
    appError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }

  // Log error for debugging
  console.error(`${context} error:`, appError);

  // Show user-friendly toast
  toast.error(`${context} failed: ${appError.message}`);

  return appError;
};

export const handleSuccess = (message: string) => {
  toast.success(message);
};

export const validateRequired = (value: unknown, fieldName: string): boolean => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    toast.error(`${fieldName} is required`);
    return false;
  }
  return true;
};

export const validateNumber = (value: unknown, fieldName: string, min: number = 0): boolean => {
  const num = Number(value);
  if (isNaN(num) || num < min) {
    toast.error(`${fieldName} must be a number greater than or equal to ${min}`);
    return false;
  }
  return true;
}; 