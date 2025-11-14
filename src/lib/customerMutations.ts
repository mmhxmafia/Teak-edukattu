import { gql } from '@apollo/client';

// Update customer shipping address
export const UPDATE_CUSTOMER_SHIPPING = gql`
  mutation UpdateCustomerShipping($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        shipping {
          firstName
          lastName
          company
          address1
          address2
          city
          state
          postcode
          country
        }
      }
    }
  }
`;

// Update customer billing address
export const UPDATE_CUSTOMER_BILLING = gql`
  mutation UpdateCustomerBilling($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        billing {
          firstName
          lastName
          company
          address1
          address2
          city
          state
          postcode
          country
          email
          phone
        }
      }
    }
  }
`;

// Update customer profile information
export const UPDATE_CUSTOMER_PROFILE = gql`
  mutation UpdateCustomerProfile($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

// Address type for saved addresses
export interface Address {
  id: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

// Local storage key for saved addresses
export const SAVED_ADDRESSES_KEY = 'teakacacia-saved-addresses';

// Helper functions for saved addresses
export const getSavedAddresses = (): Address[] => {
  const savedAddresses = localStorage.getItem(SAVED_ADDRESSES_KEY);
  return savedAddresses ? JSON.parse(savedAddresses) : [];
};

export const saveAddress = (address: Address): void => {
  const addresses = getSavedAddresses();
  
  // If this is the first address or marked as default, set it as default
  if (addresses.length === 0 || address.isDefault) {
    // Set all other addresses to non-default
    addresses.forEach(addr => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }
  
  // Add new address with unique ID
  if (!address.id) {
    address.id = Date.now().toString();
    addresses.push(address);
  } else {
    // Update existing address
    const index = addresses.findIndex(addr => addr.id === address.id);
    if (index >= 0) {
      addresses[index] = address;
    } else {
      addresses.push(address);
    }
  }
  
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
};

export const deleteAddress = (addressId: string): void => {
  let addresses = getSavedAddresses();
  const wasDefault = addresses.find(addr => addr.id === addressId)?.isDefault;
  
  // Filter out the address to delete
  addresses = addresses.filter(addr => addr.id !== addressId);
  
  // If the deleted address was default and we have other addresses, set a new default
  if (wasDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }
  
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
};

export const setDefaultAddress = (addressId: string): void => {
  const addresses = getSavedAddresses();
  
  // Set all addresses to non-default
  addresses.forEach(addr => {
    addr.isDefault = addr.id === addressId;
  });
  
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
};

export const getDefaultAddress = (): Address | null => {
  const addresses = getSavedAddresses();
  return addresses.find(addr => addr.isDefault) || (addresses.length > 0 ? addresses[0] : null);
};
