import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormError from './form-error';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * CountrySelect component
 * A dropdown select for countries with proper validation
 */
const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  error,
  id = 'country',
  required = false,
  disabled = false
}) => {
  // List of supported countries (India first as default)
  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' }
  ];

  return (
    <div className="space-y-1">
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id={id}
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && <FormError message={error} id={id} />}
    </div>
  );
};

export default CountrySelect;
