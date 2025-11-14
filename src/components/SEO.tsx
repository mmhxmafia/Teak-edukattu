import { Helmet } from 'react-helmet-async';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  canonical?: string;
  product?: {
    name: string;
    price: string;
    currency: string;
    image: string;
    availability: string;
  };
}

const SEO = ({
  title = 'Edakkattu Furniture - Custom Furniture Made Your Way',
  description = 'Premier furniture wholesaler and manufacturer in Kerala & Bangalore, India. We manufacture all types of sofas and furniture, customized according to your choice. Wholesale and retail solutions across India.',
  keywords = 'custom furniture, furniture manufacturer Kerala, furniture wholesaler Bangalore, sofa manufacturer India, customized furniture, wholesale furniture, retail furniture, Edakkattu Furniture, teak furniture, wooden furniture',
  ogImage = '/social-preview.jpg',
  ogType = 'website',
  ogUrl,
  canonical,
  product,
}: SEOProps) => {
  const siteUrl = 'https://admin.teakacacia.com'; // Your actual domain
  const fullTitle = title.includes('Edakkattu') || title.includes('Teakacacia') ? title : `${title} | Edakkattu Furniture`;
  const fullOgUrl = ogUrl || canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Structured Data for Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'FurnitureStore'],
    name: 'Edakkattu Furniture',
    alternateName: 'Teakacacia LLP',
    url: siteUrl,
    logo: `${siteUrl}/edakkattu-logo.png`,
    image: `${siteUrl}/social-preview.jpg`,
    description: description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kerala & Bangalore',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+91-8590774213',
      availableLanguage: ['English', 'Hindi', 'Malayalam'],
    },
    sameAs: [
      'https://www.facebook.com/edwood.furnitures.5/',
      'https://www.instagram.com/edakkattufurniture/',
    ],
    priceRange: '₹₹₹',
    areaServed: 'India',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Custom Furniture',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Custom Sofas',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Teak Furniture',
          },
        },
      ],
    },
  };

  // Structured Data for Product (if product page)
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: description,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability}`,
          url: fullOgUrl,
        },
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical || fullOgUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Edakkattu Furniture - Custom Furniture Made Your Way" />
      <meta property="og:site_name" content="Edakkattu Furniture" />
      <meta property="og:locale" content="en_IN" />
      <meta property="fb:app_id" content="your-facebook-app-id" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullOgUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Edakkattu Furniture" />
      <meta name="geo.region" content="IN-KL" />
      <meta name="geo.placename" content="Kerala, Bangalore" />
      <meta name="geo.position" content="10.8505;76.2711" />
      <meta name="ICBM" content="10.8505, 76.2711" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#8B4513" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Business Information */}
      <meta name="business:contact_data:phone_number" content="+918590774213" />
      <meta name="business:contact_data:country_name" content="India" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

interface SEOProviderProps {
  children: React.ReactNode;
}

/**
 * SEOProvider - Automatically adds basic SEO elements to all pages
 * Wrap your entire application with this component in App.tsx
 */
export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Get page title and description based on route
  const seoData = getDefaultSEOData(path);
  
  return (
    <>
      {/* Default Meta Tags for all pages */}
      <SEO 
        title={seoData.title}
        description={seoData.description}
        canonical={`https://teakacacia.com${path}`}
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
  
  // Return default data if no match
  return defaultData;
};
