import React from 'react';
import { useLocation } from 'react-router-dom';
import { MetaTags, OrganizationStructuredData } from './index';

interface SEOProviderProps {
  children: React.ReactNode;
}

/**
 * SEOProvider - Automatically adds basic SEO elements to all pages
 * Wrap your entire application with this component in App.tsx
 */
const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Get page title and description based on route
  const seoData = getDefaultSEOData(path);
  
  return (
    <>
      {/* Default Meta Tags for all pages */}
      <MetaTags 
        title={seoData.title}
        description={seoData.description}
        canonicalUrl={`https://teakacacia.com${path}`}
      />
      
      {/* Organization Schema for all pages */}
      <OrganizationStructuredData 
        name="Edakkattu Furniture (Teakacacia LLP)"
        url="https://teakacacia.com"
        logo="https://teakacacia.com/logo.png"
        socialLinks={[
          "https://facebook.com/teakacacia",
          "https://instagram.com/teakacacia",
          "https://twitter.com/teakacacia"
        ]}
      />
      
      {children}
    </>
  );
};

/**
 * Get default SEO data based on route
 * This function provides fallback SEO data for all routes
 */
const getDefaultSEOData = (path: string) => {
  // Default SEO data
  const defaultData = {
    title: "Handcrafted Teak Furniture | Edakkattu Furniture (Teakacacia LLP)",
    description: "Premium handcrafted teak and wooden furniture made with sustainable materials. Discover elegant, durable pieces for your home."
  };
  
  // Route-based SEO data
  const routeData: Record<string, { title: string; description: string }> = {
    '/': {
      title: "Handcrafted Teak Furniture | Edakkattu Furniture (Teakacacia LLP)",
      description: "Premium handcrafted teak and wooden furniture made with sustainable materials. Discover elegant, durable pieces for your home."
    },
    '/products': {
      title: "Shop Handcrafted Wooden Furniture | Edakkattu Furniture",
      description: "Browse our collection of handcrafted teak and wooden furniture. Sustainable, elegant, and built to last for generations."
    },
    '/about': {
      title: "About Us | Edakkattu Furniture (Teakacacia LLP)",
      description: "Learn about our story, craftsmanship, and commitment to sustainable furniture making at Edakkattu Furniture."
    },
    '/contact': {
      title: "Contact Us | Edakkattu Furniture (Teakacacia LLP)",
      description: "Get in touch with our team for inquiries, custom orders, or to visit our showroom."
    },
    '/categories': {
      title: "Furniture Categories | Edakkattu Furniture",
      description: "Explore our furniture categories including dining sets, bedroom furniture, living room pieces, and more."
    }
  };
  
  // Check if we have specific SEO data for this route
  for (const route in routeData) {
    if (path === route) {
      return routeData[route];
    }
  }
  
  // Handle dynamic routes
  if (path.startsWith('/products/')) {
    return {
      title: "Premium Teak Furniture | Edakkattu Furniture",
      description: "Handcrafted wooden furniture made with sustainable materials and traditional craftsmanship."
    };
  }
  
  if (path.startsWith('/category/')) {
    const category = path.split('/').pop()?.replace(/-/g, ' ');
    return {
      title: `${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Furniture'} | Edakkattu Furniture`,
      description: `Explore our collection of handcrafted ${category || 'wooden'} furniture pieces made with sustainable materials.`
    };
  }
  
  // Return default data if no match
  return defaultData;
};

export default SEOProvider;
