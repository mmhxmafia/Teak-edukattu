import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { 
  loadRazorpayScript, 
  createRazorpayOrder, 
  initializeRazorpayPayment,
  verifyRazorpayPayment,
  RazorpayResponse
} from '@/lib/razorpay';

interface RazorpayPaymentProps {
  amount: number; // Amount in INR
  orderId: string; // Your internal order ID
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onPaymentError: (error: any) => void;
}

const RazorpayPayment = ({
  amount,
  orderId,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amount * 100);
  
  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Create Razorpay order
      const orderResponse = await createRazorpayOrder(
        amountInPaise,
        orderId,
        { customer_id: orderId }
      );
      
      // 2. Initialize Razorpay payment
      await initializeRazorpayPayment({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Edakkattu Furniture (Teakacacia LLP)',
        description: `Order #${orderId}`,
        image: `${import.meta.env.VITE_APP_URL}/logo.png`,
        order_id: orderResponse.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          order_id: orderId
        },
        theme: {
          color: '#4a6741' // Teakacacia green color
        },
        handler: async function(response: RazorpayResponse) {
          try {
            // 3. Verify payment
            const isVerified = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            
            if (isVerified) {
              // 4. Call success callback
              onPaymentSuccess(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onPaymentError(error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment. Please try again.');
      onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Payment Methods Display */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-3">Secure Payment Options</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-primary/5">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Credit/Debit Cards</span>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-md bg-primary/5">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">UPI</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-2">
            <img src="/images/visa.svg" alt="Visa" className="h-8" />
            <img src="/images/mastercard.svg" alt="Mastercard" className="h-8" />
            <img src="/images/upi.svg" alt="UPI" className="h-8" />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-[#4a6741] hover:bg-[#3a5331] text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>Pay ₹{amount.toFixed(2)} Securely</>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        By clicking "Pay", you agree to Razorpay's terms and policies.
      </p>
    </div>
  );
};

export default RazorpayPayment;
