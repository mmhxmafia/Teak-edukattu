import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotification } from "@/hooks/use-notification";
import { Loader2, X } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  inline?: boolean;
  redirectUrl?: string;
}

const LoginForm = ({ onSuccess, onCancel, inline = false, redirectUrl }: LoginFormProps) => {
  const { login } = useAuth();
  const notify = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      notify.success({
        title: "Welcome Back",
        description: "You've successfully logged in to your account.",
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect if URL provided
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      notify.error({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="your@email.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size={inline ? "default" : "lg"}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );

  if (inline) {
    return (
      <div className="bg-muted/30 p-4 rounded-md border border-border relative mt-4 mb-6">
        {onCancel && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6" 
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <h3 className="text-lg font-medium mb-4">Sign in to your account</h3>
        {formContent}
        
        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          Don't have an account?{' '}
          <a 
            href="/register" 
            className="text-primary hover:underline font-medium"
            onClick={(e) => {
              if (onCancel) {
                e.preventDefault();
                window.location.href = '/register';
                onCancel();
              }
            }}
          >
            Create account
          </a>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="heading-font text-3xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default LoginForm;
