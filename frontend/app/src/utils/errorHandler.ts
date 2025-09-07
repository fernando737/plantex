import { showError, showWarning, showSuccess } from './notificationUtils';

export interface ErrorResponse {
  message?: string;
  detail?: string;
  errors?: Record<string, any> | string[];
  success?: boolean;
}

export interface ErrorResponseData {
  message?: string;
  detail?: string;
  errors?: Record<string, any> | string[];
}

export interface ErrorResult {
  userMessage: string;
  errorDetails: any;
  severity: 'error' | 'warning' | 'success' | 'info';
}

export interface ApiOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

/**
 * Standardized error handling for API operations
 *
 * This utility provides consistent error handling across the frontend application.
 * It automatically handles different types of errors and provides appropriate user feedback.
 *
 * Usage Examples:
 *
 * 1. Basic error handling:
 *    const { userMessage, errorDetails, severity } = handleApiError(error, "fetching data");
 *
 * 2. With automatic notifications:
 *    handleApiErrorWithNotification(error, "saving document");
 *
 * 3. For operations with success messages:
 *    const result = await handleApiOperation(
 *      () => api.post('/data', data),
 *      "Data saved successfully",
 *      "saving data"
 *    );
 */

export const handleApiError = (
  error: any,
  context = 'operation'
): ErrorResult => {
  console.error(`Error in ${context}:`, error);

  let userMessage = 'Ha ocurrido un error inesperado';
  let errorDetails: any = null;
  let severity: 'error' | 'warning' | 'success' | 'info' = 'error';

  if (error.response?.data) {
    const { message, detail, errors }: ErrorResponseData = error.response.data;

    // Use the standardized message from backend
    if (message) {
      userMessage = message;
    } else if (detail) {
      // Handle DRF's default 'detail' field
      userMessage = detail;
    }

    // Handle validation errors
    if (errors) {
      errorDetails = errors;
      // If it's validation errors, show them in a more user-friendly way
      if (typeof errors === 'object') {
        const errorMessages = Object.values(errors).flat();
        userMessage = errorMessages.join(', ');
      }
    }

    // Determine severity based on status code
    if (error.response.status === 404) {
      severity = 'warning';
    } else if (error.response.status >= 500) {
      severity = 'error';
    }
  } else if (error.message) {
    userMessage = error.message;
  }

  return { userMessage, errorDetails, severity };
};

// Convenience functions for common error scenarios
export const handleApiErrorWithNotification = (
  error: any,
  context = 'operation'
): ErrorResult => {
  const { userMessage, errorDetails, severity } = handleApiError(
    error,
    context
  );

  switch (severity) {
    case 'warning':
      showWarning(userMessage);
      break;
    case 'error':
    default:
      showError(userMessage);
      break;
  }

  return { userMessage, errorDetails, severity };
};

// For operations that might fail but shouldn't show error notifications
export const handleApiErrorSilent = (
  error: any,
  context = 'operation'
): ErrorResult => {
  return handleApiError(error, context);
};

// For operations that should show success on completion
export const handleApiOperation = async <T = any>(
  apiCall: () => Promise<T>,
  successMessage?: string,
  context = 'operation'
): Promise<ApiOperationResult<T>> => {
  try {
    const result = await apiCall();
    if (successMessage) {
      showSuccess(successMessage);
    }
    return { success: true, data: result };
  } catch (error: any) {
    // Don't show generic notifications for validation errors (400 status)
    // Let the form handle validation errors specifically
    if (error.response?.status !== 400) {
      handleApiErrorWithNotification(error, context);
    }
    return { success: false, error };
  }
};

/**
 * Handle backend validation errors and set them in react-hook-form
 *
 * This function processes backend validation errors from ErrorResponseBuilder format
 * and converts them to react-hook-form's setError format for consistent error handling across forms.
 *
 * @param error - The error object from the API call
 * @param setError - The setError function from react-hook-form
 * @param formFields - The form field names to map backend errors to
 * @returns true if validation errors were handled, false otherwise
 */
export const handleBackendValidationErrors = <T extends Record<string, any>>(
  error: any,
  setError: (name: keyof T, error: { type: string; message: string }) => void,
  formFields: Record<string, keyof T> = {}
): boolean => {
  // Only handle errors in the standardized ErrorResponseBuilder format
  if (error.response?.data?.errors && error.response?.status === 400) {
    const validationErrors = error.response.data.errors;

    Object.keys(validationErrors).forEach(field => {
      const fieldErrors = validationErrors[field];
      const errorMessage = Array.isArray(fieldErrors)
        ? fieldErrors.join(', ')
        : fieldErrors;

      // Map backend field name to form field name if mapping provided
      const formFieldName = formFields[field] || (field as keyof T);

      setError(formFieldName, {
        type: 'server',
        message: errorMessage,
      });
    });

    return true;
  }

  return false;
};

/**
 * Handle association-specific errors and return appropriate error information
 *
 * This function processes association errors (like "Este participante ya está vinculado al proceso con este rol")
 * and returns structured error information for display in dialogs or forms.
 *
 * @param error - The error object from the API call
 * @param setError - The setError function from react-hook-form (optional)
 * @returns true if association errors were handled, false otherwise
 */
export const handleEntityAssociationErrors = <T extends Record<string, any>>(
  error: any,
  setError?: (name: keyof T, error: { type: string; message: string }) => void
): { handled: boolean; specificMessage?: string; genericMessage?: string } => {
  // Only handle errors in the standardized ErrorResponseBuilder format
  if (error.response?.data?.errors && error.response?.status === 400) {
    const validationErrors = error.response.data.errors;

    // Check for association errors across different entity types
    const associationFields = ['participant', 'property', 'professional'];
    let associationError = null;
    let associationField = null;

    // Find the first association error
    for (const field of associationFields) {
      if (validationErrors[field]) {
        associationError = validationErrors[field];
        associationField = field;
        break;
      }
    }

    if (associationError) {
      const specificMessage = Array.isArray(associationError)
        ? associationError.join(', ')
        : associationError;

      // Set error in form if setError is provided (for participant, map to role field)
      if (setError && associationField === 'participant') {
        setError('role' as keyof T, {
          type: 'server',
          message: specificMessage,
        });
      }

      return {
        handled: true,
        specificMessage,
        genericMessage: 'Error de validación en la asociación.',
      };
    }

    // Handle other validation errors if setError is provided
    if (setError) {
      Object.keys(validationErrors).forEach(field => {
        const fieldErrors = validationErrors[field];
        const errorMessage = Array.isArray(fieldErrors)
          ? fieldErrors.join(', ')
          : fieldErrors;

        setError(field as keyof T, {
          type: 'server',
          message: errorMessage,
        });
      });
    }

    return { handled: true };
  }

  return { handled: false };
};

/**
 * Handle template validation errors for views that use custom setFormErrors approach.
 * This function processes backend validation errors from ErrorResponseBuilder format
 * and converts them to the custom setFormErrors format used in template views.
 *
 * @param error - The error object from the API call
 * @param setFormErrors - The setFormErrors function from template views
 * @returns true if validation errors were handled, false otherwise
 */
export const handleTemplateValidationErrors = (
  error: any,
  setFormErrors: (errors: Record<string, string>) => void
): boolean => {
  // Only handle errors in the standardized ErrorResponseBuilder format
  if (error.response?.data?.errors && error.response?.status === 400) {
    const validationErrors = error.response.data.errors;
    const formErrors: Record<string, string> = {};

    Object.keys(validationErrors).forEach(field => {
      const fieldErrors = validationErrors[field];
      const errorMessage = Array.isArray(fieldErrors)
        ? fieldErrors.join(', ')
        : fieldErrors;

      formErrors[field] = errorMessage;
    });

    // Set all errors at once
    setFormErrors(formErrors);
    return true;
  }

  return false;
};

/**
 * REFACTORING GUIDE FOR FRONTEND COMPONENTS
 *
 * Before (Inconsistent Error Handling):
 *
 * try {
 *   const response = await api.get('/data');
 *   setData(response.data);
 *   showSuccess("Data loaded successfully");
 * } catch (error) {
 *   console.error("Error fetching data:", error);
 *   showError("Error al cargar los datos");
 * }
 *
 * After (Standardized Error Handling):
 *
 * const result = await handleApiOperation(
 *   async () => {
 *     const response = await api.get('/data');
 *     setData(response.data);
 *     return response.data;
 *   },
 *   "Data loaded successfully",
 *   "fetching data"
 * );
 *
 * if (!result.success) {
 *   // Handle failure if needed
 *   setError("Failed to load data");
 * }
 *
 *
 * For operations that need to throw errors (like in forms):
 *
 * const handleSubmit = async () => {
 *   const result = await handleApiOperation(
 *     () => api.post('/submit', data),
 *     "Form submitted successfully",
 *     "submitting form"
 *   );
 *
 *   if (!result.success) {
 *     throw result.error; // Re-throw for form validation
 *   }
 * };
 *
 *
 * For forms with react-hook-form validation:
 *
 * const handleSubmit = async (data: FormData) => {
 *   try {
 *     const result = await handleApiOperation(
 *       () => api.post('/submit', data),
 *       "Form submitted successfully",
 *       "submitting form"
 *     );
 *
 *     if (!result.success) {
 *       throw result.error;
 *     }
 *   } catch (error: any) {
 *     if (!handleBackendValidationErrors(error, setError)) {
 *       // Handle other errors with generic message
 *       showError("Error al enviar el formulario. Por favor, intente nuevamente.");
 *     }
 *   }
 * };
 */
