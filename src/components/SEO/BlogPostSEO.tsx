import React from 'react';
import { MetaTags, BreadcrumbStructuredData } from './index';

interface BlogPostSEOProps {
  post: {
    title: string;
    excerpt: string;
    slug: string;
    featuredImage?: string;
    publishDate: string;
    modifiedDate?: string;
    author?: {
      name: string;
      url?: string;
    };
    category?: {
      name: string;
      slug: string;
    };
  };
}

/**
 * BlogPostSEO - Automatically adds all necessary SEO elements to blog posts
 * Use this component at the top of each blog post
 */
const BlogPostSEO: React.FC<BlogPostSEOProps> = ({ post }) => {
  // Generate post title
  const title = `${post.title} | Edakkattu Furniture Blog`;
  
  // Ensure excerpt is not too long (max 160 characters)
  let description = post.excerpt;
  if (description.length > 157) {
    description = description.substring(0, 157) + '...';
  }
  
  // Generate canonical URL
  const canonicalUrl = `https://teakacacia.com/blog/${post.slug}`;
  
  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://teakacacia.com' },
    { name: 'Blog', url: 'https://teakacacia.com/blog' }
  ];
  
  // Add category to breadcrumbs if available
  if (post.category) {
    breadcrumbItems.push({
      name: post.category.name,
      url: `https://teakacacia.com/blog/category/${post.category.slug}`
    });
  }
  
  // Add post to breadcrumbs
  breadcrumbItems.push({
    name: post.title,
    url: canonicalUrl
  });
  
  // Create article structured data
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': description,
    'image': post.featuredImage || 'https://teakacacia.com/blog-placeholder.jpg',
    'datePublished': post.publishDate,
    'dateModified': post.modifiedDate || post.publishDate,
    'author': {
      '@type': 'Person',
      'name': post.author?.name || 'Edakkattu Furniture',
      'url': post.author?.url || 'https://teakacacia.com/about'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Edakkattu Furniture (Teakacacia LLP)',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://teakacacia.com/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  };
  
  return (
    <>
      {/* Meta Tags */}
      <MetaTags 
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={post.featuredImage || 'https://teakacacia.com/blog-placeholder.jpg'}
        ogType="article"
      />
      
      {/* Breadcrumb Structured Data */}
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      {/* Article Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(articleStructuredData)}
      </script>
    </>
  );
};

export default BlogPostSEO;
