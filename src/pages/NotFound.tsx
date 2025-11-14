import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Log the 404 error
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Auto-redirect after countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Page Not Found - Teakacacia"
        description="The page you're looking for doesn't exist. You'll be redirected to our homepage."
      />
      <Navigation />
      
      <main className="py-32 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center">
          {/* Visual element */}
          <div className="relative mb-8 mx-auto">
            <div className="w-48 h-48 bg-muted rounded-full flex items-center justify-center mx-auto">
              <span className="text-[120px] font-bold text-primary/20 heading-font">404</span>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex items-center justify-center">
              <span className="text-6xl heading-font text-foreground">Oops!</span>
            </div>
          </div>
          
          <h1 className="heading-font text-4xl font-medium text-foreground mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            We couldn't find the page you're looking for. It might have been moved, 
            deleted, or never existed. You'll be redirected to our homepage in <span className="font-bold text-primary">{countdown}</span> seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} className="gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
            
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Button variant="secondary" onClick={() => navigate('/products')} className="gap-2">
              <Search className="h-4 w-4" />
              Browse Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
