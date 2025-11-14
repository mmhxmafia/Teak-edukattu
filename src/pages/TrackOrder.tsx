import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatIndianNumber } from "@/utils/dataHelpers";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, Search, Loader2 } from "lucide-react";

// GraphQL query to get order details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      orderNumber
      date
      status
      total
      subtotal
      totalTax
      shippingTotal
      customerNote
      lineItems {
        nodes {
          product {
            node {
              id
              name
              image {
                sourceUrl
              }
            }
          }
          quantity
          total
        }
      }
      billing {
        firstName
        lastName
        email
      }
      shipping {
        firstName
        lastName
        address1
        address2
        city
        state
        postcode
        country
      }
      statusHistory {
        date
        status
        note
      }
    }
  }
`;

// Timeline component
const Timeline = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

const TimelineItem = ({ children, className = '' }) => {
  return (
    <div className={`flex mb-6 last:mb-0 ${className}`}>
      {children}
    </div>
  );
};

const TimelineSeparator = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {children}
    </div>
  );
};

const TimelineDot = ({ className = '' }) => {
  return (
    <div className={`w-4 h-4 rounded-full ${className}`}></div>
  );
};

const TimelineConnector = ({ className = '' }) => {
  return (
    <div className={`w-0.5 h-full bg-border my-1 ${className}`}></div>
  );
};

const TimelineContent = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
};

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchOrderId, setSearchOrderId] = useState('');
  
  // If orderId is provided in URL, use it for query
  const { loading, error, data, refetch } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: orderId || '' },
    skip: !orderId,
    fetchPolicy: 'network-only'
  });

  // Handle order search
  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId) {
      navigate(`/track-order/${searchOrderId}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
      case 'completed':
        return <Truck className="h-5 w-5 text-amber-500" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'on-hold':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-amber-500';
      case 'delivered':
      case 'completed':
        return 'bg-green-500';
      case 'on-hold':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const order = data?.order;
  const statusHistory = order?.statusHistory || [];
  
  // Define all possible statuses and their order
  const allStatuses = ['pending', 'processing', 'shipped', 'completed'];
  
  // Get current status index
  const currentStatusIndex = order ? allStatuses.indexOf(order.status.toLowerCase()) : -1;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-font text-4xl font-medium text-foreground mb-2">
              Track Your Order
            </h1>
            {!orderId && (
              <p className="text-xl text-muted-foreground">
                Enter your order number to track your order
              </p>
            )}
          </div>
          
          {/* Order Search Form */}
          {!orderId && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderNumber" className="sr-only">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="Enter your order number"
                      value={searchOrderId}
                      onChange={(e) => setSearchOrderId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          
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
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/track-order')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order Tracking
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Order Not Found */}
          {!loading && !error && orderId && !order && (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-medium mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find an order with the number #{orderId}. Please check the order number and try again.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/track-order')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order Tracking
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Order Details */}
          {!loading && !error && order && (
            <>
              {/* Order Header */}
              <div className="text-center mb-8">
                <h2 className="heading-font text-2xl font-medium text-foreground mb-2">
                  Order #{order.orderNumber || order.databaseId}
                </h2>
                <p className="text-muted-foreground">
                  Placed on {formatDate(order.date)}
                </p>
              </div>
              
              {/* Order Status */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="heading-font">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Status Steps */}
                  <div className="relative mb-12">
                    <div className="flex justify-between mb-2">
                      {allStatuses.map((status, index) => (
                        <div key={status} className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index <= currentStatusIndex ? getStatusColor(status) : 'bg-gray-200'
                            } text-white font-bold`}
                          >
                            {index <= currentStatusIndex ? (
                              index === currentStatusIndex ? index + 1 : '✓'
                            ) : (
                              index + 1
                            )}
                          </div>
                          <span className="text-xs mt-2 capitalize">{status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
                    <div 
                      className="absolute top-5 left-0 h-1 bg-primary -z-10"
                      style={{ width: `${(currentStatusIndex / (allStatuses.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Status History */}
                  {statusHistory.length > 0 ? (
                    <Timeline>
                      {statusHistory.map((item: any, index: number) => (
                        <TimelineItem key={index}>
                          <TimelineSeparator>
                            <TimelineDot className={getStatusColor(item.status)} />
                            {index < statusHistory.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <div className="ml-4">
                              <h3 className="font-medium capitalize">{item.status}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(item.date)}
                              </p>
                              {item.note && (
                                <p className="text-sm mt-1">{item.note}</p>
                              )}
                            </div>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No status updates available
                    </div>
                  )}
                  
                  {order.status.toLowerCase() !== 'completed' && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-muted-foreground">
                        Estimated delivery: 
                        <span className="font-medium ml-1">
                          {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Order Items */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="heading-font">Order Details</CardTitle>
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
                            <p className="font-medium">{item.product?.node?.name || 'Product'}</p>
                            <p className="font-medium">
                              ₹{formatIndianNumber(parseFloat(item.total))}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Order Summary */}
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
                </CardContent>
              </Card>
              
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-font">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {order.shipping.firstName} {order.shipping.lastName}
                  </p>
                  <p>{order.shipping.address1}</p>
                  {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                  <p>
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                  </p>
                  <p>{order.shipping.country}</p>
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

export default TrackOrder;
