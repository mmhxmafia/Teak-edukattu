import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
  id?: string;
}

/**
 * FormError component
 * Displays error messages for form fields with proper styling and accessibility
 */
const FormError: React.FC<FormErrorProps> = ({ message, id }) => {
  if (!message) return null;
  
  return (
    <div 
      className="form-error-message" 
      id={id ? `${id}-error` : undefined}
      role="alert"
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
