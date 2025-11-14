# SEO Implementation Examples

This guide shows how to implement the automated SEO system in different page types.

## 1. Product Page Example

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProductPageSEO } from '@/components/SEO';
import ProductDetails from '@/components/ProductDetails';
import RelatedProducts from '@/components/RelatedProducts';
import ProductReviews from '@/components/ProductReviews';

const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      price
      regularPrice
      salePrice
      images {
        nodes {
          sourceUrl
        }
      }
      ... other product fields
    }
  }
`;

const ProductPage = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { slug }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const product = data.product;
  
  // Product FAQs
  const productFaqs = [
    {
      question: "How do I care for this product?",
      answer: "Clean with a soft, damp cloth. Apply teak oil every 3-6 months to maintain its natural luster."
    },
    {
      question: "What are the dimensions?",
      answer: `Width: ${product.width}cm, Height: ${product.height}cm, Depth: ${product.depth}cm`
    },
    {
      question: "Is assembly required?",
      answer: "Minimal assembly required. Instructions and hardware included."
    }
  ];

  // Format product data for SEO component
  const seoProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    images: product.images.nodes.map(img => img.sourceUrl),
    sku: product.sku,
    categories: product.categories?.nodes.map(cat => ({
      name: cat.name,
      slug: cat.slug
    })),
    inStock: product.stockStatus === 'IN_STOCK',
    reviewCount: product.reviewCount || 0,
    reviewRating: product.averageRating || 0
  };

  return (
    <div>
      {/* Automated SEO - just add this component */}
      <ProductPageSEO 
        product={seoProduct}
        faqs={productFaqs}
      />
      
      {/* Rest of your product page */}
      <ProductDetails product={product} />
      <ProductReviews productId={product.id} />
      <RelatedProducts productId={product.id} />
    </div>
  );
};

export default ProductPage;
```

## 2. Category Page Example

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { CategoryPageSEO } from '@/components/SEO';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilters from '@/components/CategoryFilters';

const GET_CATEGORY = gql`
  query GetCategory($slug: String!) {
    productCategory(slug: $slug) {
      id
      name
      slug
      description
      image {
        sourceUrl
      }
      parentDatabaseId
      parentCategory {
        name
        slug
      }
      products {
        nodes {
          id
          name
          slug
          price
          images {
            nodes {
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

const CategoryPage = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_CATEGORY, {
    variables: { slug }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const category = data.productCategory;
  
  // Format category data for SEO component
  const seoCategory = {
    name: category.name,
    description: category.description,
    slug: category.slug,
    image: category.image?.sourceUrl,
    parentCategory: category.parentCategory ? {
      name: category.parentCategory.name,
      slug: category.parentCategory.slug
    } : undefined
  };

  return (
    <div>
      {/* Automated SEO - just add this component */}
      <CategoryPageSEO category={seoCategory} />
      
      {/* Rest of your category page */}
      <h1>{category.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: category.description }} />
      <CategoryFilters />
      <ProductGrid products={category.products.nodes} />
    </div>
  );
};

export default CategoryPage;
```

## 3. Blog Post Example

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { BlogPostSEO } from '@/components/SEO';
import BlogContent from '@/components/BlogContent';
import AuthorBio from '@/components/AuthorBio';
import RelatedPosts from '@/components/RelatedPosts';

const GET_POST = gql`
  query GetPost($slug: String!) {
    post(slug: $slug) {
      id
      title
      slug
      content
      excerpt
      date
      modified
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          name
          slug
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

const BlogPostPage = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { slug }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const post = data.post;
  
  // Format post data for SEO component
  const seoPost = {
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    featuredImage: post.featuredImage?.node?.sourceUrl,
    publishDate: post.date,
    modifiedDate: post.modified,
    author: {
      name: post.author?.node?.name,
      url: `https://teakacacia.com/author/${post.author?.node?.slug}`
    },
    category: post.categories?.nodes[0] ? {
      name: post.categories.nodes[0].name,
      slug: post.categories.nodes[0].slug
    } : undefined
  };

  return (
    <div>
      {/* Automated SEO - just add this component */}
      <BlogPostSEO post={seoPost} />
      
      {/* Rest of your blog post page */}
      <h1>{post.title}</h1>
      <BlogContent content={post.content} />
      <AuthorBio author={post.author.node} />
      <RelatedPosts categoryId={post.categories.nodes[0]?.id} excludeId={post.id} />
    </div>
  );
};

export default BlogPostPage;
```

## 4. Homepage Example

The homepage already has SEO applied automatically through the `SEOProvider` component. However, you can enhance it with additional structured data:

```tsx
import React from 'react';
import { MetaTags, OrganizationStructuredData, FAQStructuredData } from '@/components/SEO';
import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryShowcase from '@/components/CategoryShowcase';
import TestimonialSlider from '@/components/TestimonialSlider';

const HomePage = () => {
  // Homepage FAQs
  const homepageFaqs = [
    {
      question: "What types of furniture do you offer?",
      answer: "We specialize in handcrafted teak and wooden furniture including dining tables, chairs, beds, sofas, coffee tables, and more."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to select international destinations. Please contact us for shipping quotes outside of India."
    },
    {
      question: "What is your warranty policy?",
      answer: "All our furniture comes with a 2-year warranty against manufacturing defects."
    }
  ];

  return (
    <div>
      {/* Enhanced SEO for homepage */}
      <MetaTags 
        title="Handcrafted Teak Furniture | Edakkattu Furniture (Teakacacia LLP)"
        description="Premium handcrafted teak and wooden furniture made with sustainable materials. Discover elegant, durable pieces for your home."
        keywords="teak furniture, wooden furniture, handcrafted furniture, sustainable furniture, Indian furniture"
      />
      
      {/* FAQ Structured Data */}
      <FAQStructuredData faqs={homepageFaqs} />
      
      {/* Rest of your homepage */}
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
      <TestimonialSlider />
    </div>
  );
};

export default HomePage;
```

## 5. Contact Page Example

```tsx
import React from 'react';
import { MetaTags } from '@/components/SEO';
import ContactForm from '@/components/ContactForm';
import StoreLocations from '@/components/StoreLocations';

const ContactPage = () => {
  return (
    <div>
      {/* Enhanced SEO for contact page */}
      <MetaTags 
        title="Contact Us | Edakkattu Furniture (Teakacacia LLP)"
        description="Get in touch with our team for inquiries, custom orders, or to visit our showroom. We're here to help you find the perfect furniture for your home."
      />
      
      {/* Local Business Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          "name": "Edakkattu Furniture (Teakacacia LLP)",
          "image": "https://teakacacia.com/store-front.jpg",
          "@id": "https://teakacacia.com",
          "url": "https://teakacacia.com",
          "telephone": "+91-XXXXXXXXXX",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": "Kochi",
            "addressRegion": "Kerala",
            "postalCode": "682001",
            "addressCountry": "IN"
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "10:00",
              "closes": "19:00"
            }
          ]
        })}
      </script>
      
      {/* Rest of your contact page */}
      <h1>Contact Us</h1>
      <ContactForm />
      <StoreLocations />
    </div>
  );
};

export default ContactPage;
```

## Conclusion

With these implementations, your SEO is now automated across your entire website. The `SEOProvider` handles basic SEO for all pages, while specific components enhance product, category, and blog pages with rich structured data.

When creating new pages in the future, simply:

1. For product pages: Add `<ProductPageSEO product={product} />`
2. For category pages: Add `<CategoryPageSEO category={category} />`
3. For blog posts: Add `<BlogPostSEO post={post} />`

The sitemap will be automatically generated during each build, ensuring search engines always have the latest information about your site structure.
