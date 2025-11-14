import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Address } from '@/lib/customerMutations';

interface AddressFormProps {
  address?: Address;
  onSave: (address: Address) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const AddressForm = ({ address, onSave, onCancel, isNew = false }: AddressFormProps) => {
  const [formData, setFormData] = useState<Address>({
    id: address?.id || '',
    isDefault: address?.isDefault || false,
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    company: address?.company || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postcode: address?.postcode || '',
    country: address?.country || 'India',
    phone: address?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.address1.trim()) {
      newErrors.address1 = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postal code is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="address1">Street Address *</Label>
        <Input
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          className={errors.address1 ? 'border-red-500' : ''}
        />
        {errors.address1 && (
          <p className="text-red-500 text-xs mt-1">{errors.address1}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="address2">Apartment, Suite, etc. (Optional)</Label>
        <Input
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postcode">Postal Code *</Label>
          <Input
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            className={errors.postcode ? 'border-red-500' : ''}
          />
          {errors.postcode && (
            <p className="text-red-500 text-xs mt-1">{errors.postcode}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={errors.country ? 'border-red-500' : ''}
          />
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex items-start space-x-2 pt-2">
        <Checkbox 
          id="isDefault" 
          checked={formData.isDefault}
          onCheckedChange={(checked) => {
            setFormData(prev => ({
              ...prev,
              isDefault: checked === true
            }));
          }}
        />
        <div className="grid gap-1.5 leading-none">
          <Label 
            htmlFor="isDefault" 
            className="text-sm font-medium cursor-pointer"
          >
            Set as default address
          </Label>
          <p className="text-sm text-muted-foreground">
            This address will be automatically selected during checkout
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isNew ? 'Add Address' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
