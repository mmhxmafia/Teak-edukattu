import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from "lucide-react";

export interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
}

export const notificationIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  default: Sparkles,
};

export const notificationStyles = {
  success: {
    variant: "success" as const,
    icon: CheckCircle2,
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    variant: "error" as const,
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    variant: "warning" as const,
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  info: {
    variant: "info" as const,
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  default: {
    variant: "default" as const,
    icon: Sparkles,
    iconColor: "text-primary",
  },
};

// Helper function to get notification style
export const getNotificationStyle = (type: keyof typeof notificationStyles) => {
  return notificationStyles[type];
};

// Common notification messages
export const notificationMessages = {
  // Cart & Products
  addedToCart: (productName: string) => ({
    title: "Added to Cart",
    description: `${productName} has been added to your shopping cart.`,
  }),
  removedFromCart: (productName: string) => ({
    title: "Item Removed",
    description: `${productName} has been removed from your shopping cart.`,
  }),
  cartCleared: {
    title: "Cart Cleared",
    description: "All items have been removed from your shopping cart.",
  },

  // Orders
  orderPlaced: (orderNumber: string) => ({
    title: "Order Confirmed",
    description: `Your order #${orderNumber} has been successfully placed. A confirmation email will be sent shortly.`,
  }),
  orderFailed: {
    title: "Order Processing Issue",
    description: "We encountered an issue processing your order. Please try again or contact customer support.",
  },

  // Auth
  loginSuccess: (name?: string) => ({
    title: "Welcome Back",
    description: name ? `Welcome back, ${name}. You have successfully signed in.` : "You have successfully signed in to your account.",
  }),
  logoutSuccess: {
    title: "Signed Out",
    description: "You have been successfully signed out of your account.",
  },
  loginFailed: {
    title: "Sign In Failed",
    description: "We couldn't verify your credentials. Please check your email and password and try again.",
  },
  registerSuccess: {
    title: "Account Created",
    description: "Welcome to Teakacacia! Your account has been successfully created.",
  },
  registerFailed: {
    title: "Registration Issue",
    description: "We couldn't complete your registration. Please review your information and try again.",
  },

  // Forms
  formSuccess: {
    title: "Information Saved",
    description: "Your information has been successfully saved.",
  },
  formError: {
    title: "Form Error",
    description: "Please review the highlighted fields and try again.",
  },

  // Network
  networkError: {
    title: "Connection Issue",
    description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
  },
  loadingError: {
    title: "Content Loading Issue",
    description: "We couldn't load the requested content. Please refresh the page or try again later.",
  },

  // Generic
  success: (message: string) => ({
    title: "Success",
    description: message,
  }),
  error: (message: string) => ({
    title: "Error",
    description: message,
  }),
  warning: (message: string) => ({
    title: "Important Notice",
    description: message,
  }),
  info: (message: string) => ({
    title: "Information",
    description: message,
  }),
};
