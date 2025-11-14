/**
 * Error Handler Utility
 * 
 * This utility provides functions to format and handle errors in a user-friendly way.
 * It transforms technical error messages into clear, actionable messages for users.
 */

/**
 * Format GraphQL errors into user-friendly messages
 */
export function formatGraphQLError(error: any): string {
  if (!error) return "An unknown error occurred. Please try again.";
  
  // Check if it's a GraphQL error with message
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    return formatErrorMessage(graphQLError.message);
  }
  
  // Handle network errors
  if (error.networkError) {
    return "Network connection issue. Please check your internet connection and try again.";
  }
  
  // Handle regular error objects
  if (error.message) {
    return formatErrorMessage(error.message);
  }
  
  // Fallback for string errors
  if (typeof error === 'string') {
    return formatErrorMessage(error);
  }
  
  return "An unexpected error occurred. Please try again.";
}

/**
 * Format error messages to be user-friendly
 */
export function formatErrorMessage(message: string): string {
  // Remove technical details and format the message
  
  // Handle country validation errors
  if (message.includes("input.billing.country") || 
      message.includes("input.shipping.country") ||
      message.includes("CountriesEnum")) {
    return "Please select a valid country from the dropdown list.";
  }
  
  // Handle state validation errors
  if (message.includes("input.billing.state") || 
      message.includes("input.shipping.state") ||
      message.includes("StatesEnum")) {
    return "Please select a valid state from the dropdown list.";
  }
  
  // Handle payment errors
  if (message.includes("payment") || message.includes("Payment")) {
    return "There was an issue processing your payment. Please check your payment details and try again.";
  }
  
  // Handle order creation errors
  if (message.includes("create order") || message.includes("createOrder")) {
    return "We couldn't create your order at this time. Please try again later.";
  }
  
  // Handle validation errors
  if (message.includes("invalid") || message.includes("Invalid")) {
    return "Some information you entered is invalid. Please check your details and try again.";
  }
  
  // Handle authentication errors
  if (message.includes("auth") || message.includes("login") || message.includes("password")) {
    return "Authentication failed. Please check your credentials and try again.";
  }
  
  // Handle general errors
  return "Something went wrong. Please try again or contact customer support if the issue persists.";
}

/**
 * Get the field name from an error message
 */
export function getErrorField(message: string): string | null {
  // Extract field name from common error patterns
  const fieldMatches = message.match(/input\.([\w\.]+)/i) || 
                      message.match(/"(\w+)"\s+got\s+invalid/i) ||
                      message.match(/at\s+"input\.([\w\.]+)"/i);
  
  if (fieldMatches && fieldMatches[1]) {
    const field = fieldMatches[1].split('.').pop();
    return field || null;
  }
  
  return null;
}

/**
 * Check if an error is related to a specific field
 */
export function isFieldError(error: string, fieldName: string): boolean {
  return error.toLowerCase().includes(fieldName.toLowerCase());
}

/**
 * Create a scroll to error function
 */
export function scrollToError(fieldId: string) {
  const element = document.getElementById(fieldId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus();
    // Add a temporary highlight effect
    element.classList.add('error-highlight');
    setTimeout(() => {
      element.classList.remove('error-highlight');
    }, 2000);
  }
}
