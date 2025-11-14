import React from 'react';
import { MetaTags, BreadcrumbStructuredData } from './index';

interface CategoryPageSEOProps {
  category: {
    name: string;
    description?: string;
    slug: string;
    image?: string;
    parentCategory?: {
      name: string;
      slug: string;
    };
  };
}

/**
 * CategoryPageSEO - Automatically adds all necessary SEO elements to category pages
 * Use this component at the top of each category page
 */
const CategoryPageSEO: React.FC<CategoryPageSEOProps> = ({ category }) => {
  // Generate category title
  const title = `${category.name} - Handcrafted Teak Furniture | Edakkattu Furniture`;
  
  // Generate category description
  let description = category.description || 
    `Explore our collection of handcrafted ${category.name.toLowerCase()} made with sustainable teak wood. Premium quality, elegant design, and built to last.`;
  
  // Ensure description is not too long (max 160 characters)
  if (description.length > 157) {
    description = description.substring(0, 157) + '...';
  }
  
  // Generate canonical URL
  const canonicalUrl = `https://teakacacia.com/category/${category.slug}`;
  
  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://teakacacia.com' },
    { name: 'Categories', url: 'https://teakacacia.com/categories' }
  ];
  
  // Add parent category to breadcrumbs if available
  if (category.parentCategory) {
    breadcrumbItems.push({
      name: category.parentCategory.name,
      url: `https://teakacacia.com/category/${category.parentCategory.slug}`
    });
  }
  
  // Add current category to breadcrumbs
  breadcrumbItems.push({
    name: category.name,
    url: canonicalUrl
  });
  
  return (
    <>
      {/* Meta Tags */}
      <MetaTags 
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={category.image || 'https://teakacacia.com/category-placeholder.jpg'}
      />
      
      {/* Breadcrumb Structured Data */}
      <BreadcrumbStructuredData items={breadcrumbItems} />
    </>
  );
};

export default CategoryPageSEO;
