import React from 'react';
import { MetaTags, ProductStructuredData, BreadcrumbStructuredData, FAQStructuredData } from './index';

interface ProductPageSEOProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    sku?: string;
    categories?: { name: string; slug: string }[];
    inStock?: boolean;
    reviewCount?: number;
    reviewRating?: number;
  };
  faqs?: { question: string; answer: string }[];
}

/**
 * ProductPageSEO - Automatically adds all necessary SEO elements to product pages
 * Use this component at the top of each product page
 */
const ProductPageSEO: React.FC<ProductPageSEOProps> = ({ product, faqs = [] }) => {
  // Generate product title and description
  const title = `${product.name} | Handcrafted Teak Furniture | Edakkattu Furniture`;
  
  // Ensure description is not too long (max 160 characters)
  let description = product.description;
  if (description.length > 157) {
    description = description.substring(0, 157) + '...';
  }
  
  // Generate canonical URL
  const canonicalUrl = `https://teakacacia.com/products/${product.id}`;
  
  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://teakacacia.com' }
  ];
  
  // Add category to breadcrumbs if available
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0];
    breadcrumbItems.push({
      name: category.name,
      url: `https://teakacacia.com/category/${category.slug}`
    });
  }
  
  // Add product to breadcrumbs
  breadcrumbItems.push({
    name: product.name,
    url: canonicalUrl
  });
  
  // Get main product image
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://teakacacia.com/placeholder.jpg';
  
  return (
    <>
      {/* Meta Tags */}
      <MetaTags 
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={mainImage}
        ogType="product"
      />
      
      {/* Product Structured Data */}
      <ProductStructuredData 
        name={product.name}
        description={description}
        image={mainImage}
        price={product.price}
        sku={product.sku || product.id}
        availability={product.inStock !== false ? 'InStock' : 'OutOfStock'}
        reviewCount={product.reviewCount || 0}
        ratingValue={product.reviewRating || 0}
      />
      
      {/* Breadcrumb Structured Data */}
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      {/* FAQ Structured Data (if FAQs are provided) */}
      {faqs.length > 0 && (
        <FAQStructuredData faqs={faqs} />
      )}
    </>
  );
};

export default ProductPageSEO;
