import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/context/AuthContext';
import { GET_CUSTOMER_INFO, GET_CUSTOMER_ORDERS } from '@/lib/orderQueries';
import { 
  UPDATE_CUSTOMER_SHIPPING, 
  UPDATE_CUSTOMER_BILLING,
  Address,
  getSavedAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress
} from '@/lib/customerMutations';
import { useToast } from '@/hooks/use-toast';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AddressForm from "@/components/AddressForm";
import AddressCard from "@/components/AddressCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Package, MapPin, Settings, Loader2, PlusCircle } from "lucide-react";

const MyAccount = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

  // GraphQL queries
  const { loading: loadingCustomer, data: customerData } = useQuery(GET_CUSTOMER_INFO, {
    skip: !isAuthenticated,
  });

  const { loading: loadingOrders, data: ordersData } = useQuery(GET_CUSTOMER_ORDERS, {
    skip: !isAuthenticated,
  });
  
  // GraphQL mutations
  const [updateShipping] = useMutation(UPDATE_CUSTOMER_SHIPPING);
  const [updateBilling] = useMutation(UPDATE_CUSTOMER_BILLING);

  // Load saved addresses from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      setAddresses(getSavedAddresses());
    }
  }, [isAuthenticated]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/account' } } });
    }
  }, [isAuthenticated, navigate]);
  
  // Address management functions
  const handleAddAddress = () => {
    setCurrentAddress(undefined);
    setIsEditMode(false);
    setIsAddressFormOpen(true);
  };
  
  const handleEditAddress = (address: Address) => {
    setCurrentAddress(address);
    setIsEditMode(true);
    setIsAddressFormOpen(true);
  };
  
  const handleDeleteAddress = (addressId: string) => {
    deleteAddress(addressId);
    setAddresses(getSavedAddresses());
    toast({
      title: "Address Deleted",
      description: "The address has been removed from your saved addresses.",
    });
  };
  
  const handleSetDefaultAddress = (addressId: string) => {
    setDefaultAddress(addressId);
    setAddresses(getSavedAddresses());
    toast({
      title: "Default Address Updated",
      description: "Your default address has been updated.",
    });
  };
  
  const handleSaveAddress = (address: Address) => {
    saveAddress(address);
    setAddresses(getSavedAddresses());
    setIsAddressFormOpen(false);
    
    // If this is the default address, also update the WooCommerce shipping address
    if (address.isDefault && user?.id) {
      updateShipping({
        variables: {
          input: {
            id: user.id,
            shipping: {
              firstName: address.firstName,
              lastName: address.lastName,
              company: address.company || "",
              address1: address.address1,
              address2: address.address2 || "",
              city: address.city,
              state: address.state,
              postcode: address.postcode,
              country: address.country,
            }
          }
        }
      }).catch(error => {
        console.error("Error updating shipping address:", error);
      });
      
      // Also update billing address if it's the default
      updateBilling({
        variables: {
          input: {
            id: user.id,
            billing: {
              firstName: address.firstName,
              lastName: address.lastName,
              company: address.company || "",
              address1: address.address1,
              address2: address.address2 || "",
              city: address.city,
              state: address.state,
              postcode: address.postcode,
              country: address.country,
              phone: address.phone || "",
              email: user.email,
            }
          }
        }
      }).catch(error => {
        console.error("Error updating billing address:", error);
      });
    }
    
    toast({
      title: isEditMode ? "Address Updated" : "Address Added",
      description: isEditMode 
        ? "Your address has been updated successfully." 
        : "Your new address has been added to your saved addresses.",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const customer = customerData?.customer;
  const orders = ordersData?.customer?.orders?.nodes || [];
  const recentOrders = orders.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-font text-4xl font-medium text-foreground mb-2">
              My Account
            </h1>
            <p className="text-muted-foreground">
              Manage your account and view your orders
            </p>
          </div>

          {loadingCustomer ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <User className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="addresses">
                  <MapPin className="h-4 w-4 mr-2" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-font">Account Information</CardTitle>
                      <CardDescription>Your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {customer?.firstName} {customer?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{customer?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{customer?.username}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-font">Order Statistics</CardTitle>
                      <CardDescription>Your shopping summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Orders</span>
                        <span className="text-2xl font-semibold">{orders.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pending</span>
                        <span className="font-medium">
                          {orders.filter((o: any) => o.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-medium">
                          {orders.filter((o: any) => o.status === 'completed').length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="heading-font">Recent Orders</CardTitle>
                        <CardDescription>Your latest purchases</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/orders')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order: any) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-accent cursor-pointer"
                            onClick={() => navigate(`/order/${order.databaseId}`)}
                          >
                            <div>
                              <p className="font-medium">
                                Order #{order.orderNumber || order.databaseId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.date)} • {order.lineItems.nodes.length} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{order.total}</p>
                              <div className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-font">All Orders</CardTitle>
                    <CardDescription>
                      View complete order history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        View your complete order history
                      </p>
                      <Button onClick={() => navigate('/orders')}>
                        Go to Order History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="space-y-6">
                {/* WooCommerce Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-font">Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customer?.billing?.address1 ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">
                            {customer.billing.firstName} {customer.billing.lastName}
                          </p>
                          <p>{customer.billing.address1}</p>
                          {customer.billing.address2 && <p>{customer.billing.address2}</p>}
                          <p>
                            {customer.billing.city}, {customer.billing.state} {customer.billing.postcode}
                          </p>
                          <p>{customer.billing.country}</p>
                          <p className="pt-2">{customer.billing.phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No billing address saved
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="heading-font">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customer?.shipping?.address1 ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">
                            {customer.shipping.firstName} {customer.shipping.lastName}
                          </p>
                          <p>{customer.shipping.address1}</p>
                          {customer.shipping.address2 && <p>{customer.shipping.address2}</p>}
                          <p>
                            {customer.shipping.city}, {customer.shipping.state} {customer.shipping.postcode}
                          </p>
                          <p>{customer.shipping.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No shipping address saved
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Saved Addresses Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium">Saved Addresses</h3>
                    <Button onClick={handleAddAddress}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                  
                  {addresses.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MapPin className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-foreground mb-2">
                          No Saved Addresses
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Add addresses to speed up your checkout process
                        </p>
                        <Button onClick={handleAddAddress}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          onEdit={handleEditAddress}
                          onDelete={handleDeleteAddress}
                          onSetDefault={handleSetDefaultAddress}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-font">Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Logout</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign out of your account on this device
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Address Form Dialog */}
      <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm
            address={currentAddress}
            onSave={handleSaveAddress}
            onCancel={() => setIsAddressFormOpen(false)}
            isNew={!isEditMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAccount;
