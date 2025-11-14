import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/context/AuthContext';
import { GET_ORDER_DETAILS } from '@/lib/orderQueries';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, DollarSign, Mail, Phone, MapPin, ArrowLeft, Printer, Loader2 } from "lucide-react";
import { formatIndianNumber } from "@/utils/dataHelpers";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { loading, error, data } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: orderId },
    skip: !orderId || !isAuthenticated,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/order/${orderId}` } } });
    }
  }, [isAuthenticated, navigate, orderId]);

  if (!isAuthenticated) {
    return null;
  }

  const order = data?.order;

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Add print styles
  const printStyles = `
    @media print {
      nav, footer, .no-print {
        display: none !important;
      }
      body {
        background: white;
      }
      main {
        padding: 0 !important;
      }
      .print-break-after {
        break-after: page;
      }
    }
  `;

  return (
    <div className="min-h-screen">
      {/* Add print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      <Navigation />
      
      <main className="pt-safe pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <Button 
              variant="ghost" 
              className="w-fit"
              onClick={() => navigate('/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="no-print"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Order
              </Button>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">
                  Error loading order: {error.message}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Order Details */}
          {!loading && !error && order && (
            <>
              {/* Order Header */}
              <div className="text-center mb-12">
                <h1 className="heading-font text-3xl sm:text-4xl font-medium text-foreground mb-2">
                  Order #{order.orderNumber || order.databaseId}
                </h1>
                <div className="flex items-center justify-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.date)}
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Thank you for your order!
                </p>
              </div>
              
              {/* Customer and Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{order.billing.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{order.billing.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {order.shipping.firstName} {order.shipping.lastName}
                        </p>
                        <p className="text-muted-foreground">{order.shipping.address1}</p>
                        <p className="text-muted-foreground">
                          {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                        </p>
                        <p className="text-muted-foreground">{order.shipping.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Items */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {order.lineItems.nodes.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        {item.product?.node?.image?.sourceUrl && (
                          <img
                            src={item.product.node.image.sourceUrl}
                            alt={item.product.node.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <p className="font-medium text-foreground">
                              {item.product?.node?.name || 'Product'}
                            </p>
                            <p className="font-medium text-foreground">
                              ₹{formatIndianNumber(parseFloat(item.total))}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ₹{formatIndianNumber(parseFloat(item.total) / item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{formatIndianNumber(parseFloat(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₹{formatIndianNumber(parseFloat(order.shippingTotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>₹{formatIndianNumber(parseFloat(order.totalTax))}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{formatIndianNumber(parseFloat(order.total))}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Payment Method: {order.paymentMethodTitle || 'Standard Payment'}
                    </p>
                    {order.customerNote && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Order Notes:</p>
                        <p className="text-sm text-muted-foreground">{order.customerNote}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderDetail;
