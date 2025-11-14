import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { GET_CUSTOMER_INFO } from '@/lib/orderQueries';
import { Address, getSavedAddresses, getDefaultAddress } from '@/lib/customerMutations';
import { clearCacheAfterOrder } from '@/lib/cacheManager';
import RazorpayPayment from '@/components/RazorpayPayment';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatIndianNumber } from "@/utils/dataHelpers";
import { Loader2, CreditCard, Smartphone, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import FormError from "@/components/ui/form-error";
import CountrySelect from "@/components/ui/CountrySelect";

// Query to get shipping settings from WordPress
const GET_SHIPPING_SETTINGS = gql`
  query GetShippingSettings {
    shippingSettings {
      id
      name
      methods {
        id
        title
        methodId
        type
        cost
        minAmount
        enabled
      }
    }
  }
`;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, register } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay'>('razorpay');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId?: string;
    orderId?: string;
    signature?: string;
  }>({});
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch shipping settings from WordPress
  const { data: shippingData } = useQuery(GET_SHIPPING_SETTINGS);
  
  // Fetch customer information if authenticated
  const { data: customerData, loading: customerLoading } = useQuery(GET_CUSTOMER_INFO, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only'
  });

  // Form state with India as default
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN', // India as default
  });

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    toast({
      title: "Signed In Successfully",
      description: "Your information will be loaded automatically.",
      variant: "default"
    });
  };
  
  // Load saved addresses from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const addresses = getSavedAddresses();
      setSavedAddresses(addresses);
      
      // If there's a default address, select it
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [isAuthenticated]);

  // Update form data when a saved address is selected
  useEffect(() => {
    if (selectedAddressId) {
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        setFormData({
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: user?.email || '',
          phone: selectedAddress.phone || '',
          address: selectedAddress.address1,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.postcode,
          country: selectedAddress.country,
        });
        setIsAutoFilled(true);
      }
    }
  }, [selectedAddressId, savedAddresses, user]);

  // Auto-fill form with customer data when available
  useEffect(() => {
    if (isAuthenticated && customerData?.customer) {
      const customer = customerData.customer;
      const billing = customer.billing || {};
      const shipping = customer.shipping || {};
      
      setFormData({
        firstName: billing.firstName || customer.firstName || '',
        lastName: billing.lastName || customer.lastName || '',
        email: billing.email || customer.email || '',
        phone: billing.phone || '',
        address: billing.address1 || shipping.address1 || '',
        city: billing.city || shipping.city || '',
        state: billing.state || shipping.state || '',
        zipCode: billing.postcode || shipping.postcode || '',
        country: billing.country || shipping.country || 'India',
      });
      
      // Set auto-filled state to true if we have meaningful data
      const hasData = !!(billing.firstName || customer.firstName || billing.address1 || shipping.address1);
      setIsAutoFilled(hasData);
      
      // Show a toast notification if data was auto-filled
      if (hasData) {
        toast({
          title: "Information Auto-filled",
          description: "Your saved information has been loaded. You can edit it if needed.",
          variant: "default"
        });
      }
    }
  }, [isAuthenticated, customerData, toast]);
  
  // Watch for cart changes and redirect if it becomes empty during checkout
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      toast({
        title: "Cart is Empty",
        description: "Your cart is empty. Redirecting to shop...",
        variant: "default"
      });
      // Immediate redirect to prevent rendering errors
      const timer = setTimeout(() => {
        navigate('/shop');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items.length, isProcessing, navigate, toast]);
  
  // Early return if cart is empty to prevent calculation errors
  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="heading-font text-4xl font-medium text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add some items to your cart before checking out.
            </p>
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle payment success from Razorpay
  const handlePaymentSuccess = async (paymentId: string, orderId: string, signature: string) => {
    setPaymentStatus('success');
    setPaymentDetails({
      paymentId,
      orderId,
      signature
    });
    
    // Clear Apollo cache to ensure fresh data
    await clearCacheAfterOrder();
    
    // Clear cart
    clearCart();
    
    // Update the order with payment details
    // This would typically call an API to update the order status
    
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
      variant: "default"
    });
    
    // Navigate to order confirmation with the updated order data
    navigate('/order-confirmation', { state: {
      ...orderData,
      paymentStatus: 'success',
      paymentMethod: 'razorpay',
      paymentDetails: {
        paymentId,
        orderId,
        signature
      }
    }});
  };
  
  // Handle payment error from Razorpay
  const handlePaymentError = (error: any) => {
    setPaymentStatus('failed');
    setIsProcessing(false);
    
    toast({
      title: "Payment Failed",
      description: error.message || "There was an issue processing your payment. Please try again.",
      variant: "destructive"
    });
  };

  // Store order data for use in payment callbacks
  const [orderData, setOrderData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if cart is empty
    if (items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      navigate('/shop');
      return;
    }
    
    // Reset all form errors
    setFormErrors({});
    
    // Validate form fields
    const errors: Record<string, string> = {};
    
    // Required fields validation
    const requiredFields = [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'address', label: 'Address' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State' },
      { name: 'zipCode', label: 'ZIP Code' },
      { name: 'country', label: 'Country' }
    ];
    
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^\+?[0-9\s\-\(\)]{8,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Country validation - only certain countries are supported
    const supportedCountries = ['IN', 'US', 'GB', 'CA', 'AU', 'AE', 'SG', 'MY', 'NZ', 'DE', 'FR', 'JP'];
    if (formData.country && !supportedCountries.includes(formData.country)) {
      errors.country = 'Please select a valid country from the dropdown';
    }
    
    // If there are validation errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
        // Add a temporary highlight effect
        errorElement.classList.add('error-highlight');
        setTimeout(() => {
          errorElement.classList.remove('error-highlight');
        }, 2000);
      }
      
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);

    try {
      // Track if account was successfully created
      let accountCreated = false;
      
      // Create account if checkbox is selected and user is not authenticated
      if (createAccount && !isAuthenticated && password) {
        try {
          await register(formData.email, password, formData.firstName, formData.lastName);
          // Account creation automatically logs the user in via the register function
          toast({
            title: "Account Created",
            description: "Your account has been created and you're now signed in.",
            variant: "default"
          });
          accountCreated = true;
        } catch (error: any) {
          // If account creation fails, show error but continue with checkout as guest
          toast({
            title: "Account Creation Failed",
            description: error.message || "Could not create account, but you can still complete your order as a guest.",
            variant: "destructive",
          });
          // Reset the createAccount flag
          setCreateAccount(false);
        }
      }
      // Prepare line items for WooCommerce
      const lineItems = items.map(item => ({
        productId: parseInt(item.id), // Convert to integer
        quantity: item.quantity,
      }));

      // Prepare order input
      const orderInput: any = {
        billing: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country,
        },
        lineItems: lineItems,
        paymentMethod: 'pending', // Payment pending
        paymentMethodTitle: 'Payment Pending',
        customerNote: 'Order placed via frontend',
      };
      
      // Add customer ID if user is authenticated
      if (isAuthenticated && user?.id) {
        orderInput.customerId = parseInt(user.id);
      }
      
      // Create order in WooCommerce via REST API
      const wpEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT.replace('/graphql', '');
      const orderResponse = await fetch(`${wpEndpoint}/wp-json/wc/v3/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: orderInput.billing,
          shipping: orderInput.shipping,
          line_items: lineItems.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          payment_method: 'razorpay',
          customer_note: orderInput.customerNote,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      if (orderData.success) {
        const order = {
          orderNumber: orderData.order_number,
          databaseId: orderData.order_id,
          total: orderData.total,
        };
        const orderDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Prepare order data for confirmation page
        const newOrderData = {
          orderNumber: order.orderNumber || order.databaseId.toString(),
          orderDate,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          items: items,
          pricing: {
            subtotal: totalPrice,
            shipping: shippingCost,
            tax: tax,
            total: finalTotal,
          },
          accountCreated: accountCreated,
        };
        
        // Store order data for payment callbacks
        setOrderData(newOrderData);
        
        // For Razorpay, we don't navigate yet - the payment component will handle that
        setIsProcessing(false);

        toast({
          title: "Order placed successfully!",
          description: `Order #${newOrderData.orderNumber} has been created. Please complete payment.`,
        });
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      // Import the error handler
      import('@/utils/errorHandler').then(({ formatGraphQLError, getErrorField, scrollToError }) => {
        // Format the error message to be user-friendly
        const errorMessage = formatGraphQLError(error);
        
        // Check if the error is related to a specific field
        const errorField = getErrorField(error.message || '');
        
        // If we found a field, scroll to it
        if (errorField) {
          scrollToError(errorField);
        }
        
        // Show a user-friendly toast message
        toast({
          title: "Unable to Complete Order",
          description: errorMessage,
          variant: "destructive",
        });
      });
      
      setIsProcessing(false);
    }
  };

  // Safe calculation with fallback for empty cart
  const totalPrice = items.length > 0 ? getTotalPrice() : 0;
  
  // Calculate shipping dynamically from WordPress settings
  let shippingCost = 0;
  let freeShippingThreshold: number | null = null;
  let appliedShippingMethod: string = '';
  
  if (shippingData?.shippingSettings) {
    const allMethods: any[] = [];
    shippingData.shippingSettings.forEach((zone: any) => {
      zone.methods?.forEach((method: any) => {
        if (method.enabled) {
          allMethods.push(method);
        }
      });
    });
    
    // Check for free shipping first
    const freeShipping = allMethods.find(m => m.type === 'free' || m.methodId === 'free_shipping');
    if (freeShipping) {
      if (freeShipping.minAmount) {
        freeShippingThreshold = parseFloat(freeShipping.minAmount);
        if (totalPrice >= freeShippingThreshold) {
          shippingCost = 0;
          appliedShippingMethod = freeShipping.title;
        }
      } else {
        // Free shipping with no minimum
        shippingCost = 0;
        appliedShippingMethod = freeShipping.title;
      }
    }
    
    // If not free shipping, check for flat rate
    if (shippingCost !== 0 || !appliedShippingMethod) {
      const flatRate = allMethods.find(m => m.type === 'flat_rate' || m.methodId === 'flat_rate');
      if (flatRate && flatRate.cost) {
        shippingCost = parseFloat(flatRate.cost);
        appliedShippingMethod = flatRate.title;
      }
    }
  } else {
    // Fallback if plugin not installed
    shippingCost = 50;
    appliedShippingMethod = 'Standard Shipping';
  }
  
  // Tax calculation (can be configured in WooCommerce → Settings → Tax)
  const taxRate = 0.08; // 8% - Configure in WooCommerce settings
  const tax = totalPrice * taxRate;
  
  const finalTotal = totalPrice + shippingCost + tax;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-safe pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="heading-font text-3xl sm:text-4xl font-medium text-foreground mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground mb-8 sm:mb-12">
            Complete your order
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {/* Login Option for Returning Customers */}
              {!isAuthenticated && (
                <div className="mb-8 bg-muted/30 p-6 rounded-md border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Returning Customer?</h3>
                      <p className="text-muted-foreground text-sm">Sign in for faster checkout</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLoginForm(!showLoginForm)}
                      className="shrink-0"
                    >
                      {showLoginForm ? 'Hide Login Form' : 'Sign In'}
                    </Button>
                  </div>
                  
                  {showLoginForm && (
                    <LoginForm 
                      inline 
                      onSuccess={handleLoginSuccess} 
                      onCancel={() => setShowLoginForm(false)} 
                    />
                  )}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Saved Addresses */}
                {isAuthenticated && savedAddresses.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="heading-font text-2xl">Your Saved Addresses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Select an address to use for this order:
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {savedAddresses.map((address) => (
                            <div 
                              key={address.id}
                              className={`p-4 border rounded-md cursor-pointer transition-all ${
                                selectedAddressId === address.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedAddressId(address.id)}
                            >
                              <div className="flex items-start gap-2">
                                <input 
                                  type="radio" 
                                  checked={selectedAddressId === address.id}
                                  onChange={() => setSelectedAddressId(address.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <p className="font-medium">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{address.address1}</p>
                                  {address.address2 && (
                                    <p className="text-sm text-muted-foreground">{address.address2}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {address.city}, {address.state} {address.postcode}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{address.country}</p>
                                  {address.isDefault && (
                                    <div className="mt-2 inline-flex items-center border border-primary rounded-full px-2 py-0.5 text-xs font-semibold text-primary">
                                      Default Address
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-font text-2xl">Contact Information</CardTitle>
                      {isAuthenticated && (
                        <div className="flex items-center">
                          {customerLoading ? (
                            <div className="flex items-center text-muted-foreground text-sm">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              <span>Loading your information...</span>
                            </div>
                          ) : isAutoFilled ? (
                            <div className="flex items-center text-green-600 text-sm">
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span>Information auto-filled</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isAuthenticated && isAutoFilled && (
                      <Alert className="bg-green-50 border-green-200 text-green-800">
                        <AlertDescription>
                          We've pre-filled this form with your saved information. Please review and update if needed.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="Rajesh"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Kumar"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="rajesh@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-font text-2xl">Shipping Address</CardTitle>
                      {isAuthenticated && isAutoFilled && (
                        <div className="flex items-center text-green-600 text-sm">
                          <UserCheck className="h-4 w-4 mr-1" />
                          <span>Address auto-filled</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="123, MG Road"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Bangalore"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State / Province *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="Karnataka"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">PIN / Postal Code *</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          placeholder="560001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <CountrySelect
                          id="country"
                          value={formData.country}
                          onChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              country: value
                            }));
                            
                            // Clear error when selecting a valid country
                            if (formErrors.country) {
                              setFormErrors(prev => ({
                                ...prev,
                                country: ''
                              }));
                            }
                          }}
                          error={formErrors.country}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-font text-2xl">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Razorpay Payment Info */}
                      <div className="p-4 border rounded-md bg-primary/5 border-primary">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">Online Payment</h3>
                            <p className="text-sm text-muted-foreground">
                              Secure payment via Razorpay
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-md shadow-sm">
                            <img 
                              src="https://razorpay.com/assets/razorpay-logo.svg" 
                              alt="Razorpay" 
                              className="h-6" 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <CreditCard className="h-5 w-5 text-primary mb-1" />
                            <span className="text-xs font-medium">Cards</span>
                            <span className="text-xs text-muted-foreground">All major networks</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <Smartphone className="h-5 w-5 text-primary mb-1" />
                            <span className="text-xs font-medium">UPI/QR</span>
                            <span className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <svg className="h-5 w-5 text-primary mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs font-medium">Net Banking</span>
                            <span className="text-xs text-muted-foreground">50+ banks</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <svg className="h-5 w-5 text-primary mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs font-medium">EMI</span>
                            <span className="text-xs text-muted-foreground">Multiple banks</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <svg className="h-5 w-5 text-primary mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7 15H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M11 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs font-medium">Wallets</span>
                            <span className="text-xs text-muted-foreground">Paytm, PhonePe</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-white rounded border text-center">
                            <svg className="h-5 w-5 text-primary mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs font-medium">Pay Later</span>
                            <span className="text-xs text-muted-foreground">LazyPay, Simpl</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex gap-2">
                            <img src="/images/visa.svg" alt="Visa" className="h-6" />
                            <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
                            <img src="/images/upi.svg" alt="UPI" className="h-6" />
                          </div>
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>100% Secure</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Razorpay Payment Button (shown only if order is created) */}
                      {orderData && (
                        <div className="mt-4">
                          <RazorpayPayment
                            amount={finalTotal}
                            orderId={orderData.orderNumber}
                            customerInfo={{
                              name: `${formData.firstName} ${formData.lastName}`,
                              email: formData.email,
                              phone: formData.phone
                            }}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Creation Option */}
                {!isAuthenticated && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-2 mb-4">
                        <Checkbox 
                          id="createAccount" 
                          checked={createAccount} 
                          onCheckedChange={(checked) => setCreateAccount(checked === true)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label 
                            htmlFor="createAccount" 
                            className="text-base font-medium cursor-pointer"
                          >
                            Create an account for faster checkout next time
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Save your information for future orders and track your order history
                          </p>
                        </div>
                      </div>

                      {createAccount && (
                        <div className="mt-4">
                          <Label htmlFor="password">Create Password *</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={createAccount}
                            placeholder="••••••••"
                            className="mt-1"
                            minLength={8}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters long
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Place Order Button - Hidden when Razorpay modal is open */}
                {!orderData && (
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isProcessing || (createAccount && password.length < 8)}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="heading-font text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-sm">{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-medium">₹{formatIndianNumber(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shipping {appliedShippingMethod && `(${appliedShippingMethod})`}
                      </span>
                      <span className="text-foreground font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">Free</span>
                        ) : (
                          `₹${formatIndianNumber(shippingCost)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground font-medium">₹{formatIndianNumber(tax)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-foreground">
                      ₹{formatIndianNumber(finalTotal)}
                    </span>
                  </div>

                  {/* Free shipping message */}
                  {shippingCost === 0 && appliedShippingMethod && (
                    <div className="text-sm text-green-600 text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      🎉 You qualify for {appliedShippingMethod}!
                    </div>
                  )}
                  
                  {/* Show how much more needed for free shipping */}
                  {freeShippingThreshold && totalPrice < freeShippingThreshold && (
                    <div className="text-sm text-blue-600 text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                      Add ₹{(freeShippingThreshold - totalPrice).toFixed(2)} more for free shipping!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
