# Automated SEO System for Edakkattu Furniture (Teakacacia LLP)

This folder contains a comprehensive, automated SEO system for the Edakkattu Furniture website. The system is designed to automatically apply SEO best practices to all pages, including future ones, with minimal manual work.

## System Components

### 1. Core SEO Components

- **SEOProvider**: Automatically adds basic SEO elements to all pages
- **ProductPageSEO**: Specialized SEO for product pages with structured data
- **CategoryPageSEO**: Specialized SEO for category pages
- **BlogPostSEO**: Specialized SEO for blog posts with article structured data

### 2. Structured Data Components

- **MetaTags**: Basic meta tags for all pages
- **ProductStructuredData**: Rich product information for Google
- **BreadcrumbStructuredData**: Navigation path for search results
- **FAQStructuredData**: FAQ sections with rich snippets
- **OrganizationStructuredData**: Business information for Knowledge Graph

### 3. Automated Tools

- **Sitemap Generator**: Automatically generates sitemap.xml during build
- **Robots.txt Generator**: Creates robots.txt file if not present

## How It Works

1. **Global SEO**: The `SEOProvider` wraps the entire application in `App.tsx`, providing basic SEO for all pages
2. **Page-Specific SEO**: Specialized components add rich structured data to specific page types
3. **Build-Time Tools**: The sitemap generator runs during each build to create an up-to-date sitemap.xml

## Implementation

### 1. App.tsx Setup

The `SEOProvider` is already integrated in `App.tsx`:

```tsx
<BrowserRouter>
  <SEOProvider>
    <Routes>
      {/* All routes */}
    </Routes>
  </SEOProvider>
</BrowserRouter>
```

### 2. Page Implementation

For specific page types, add the appropriate SEO component at the top of your page component:

```tsx
// Product page example
<ProductPageSEO product={productData} />

// Category page example
<CategoryPageSEO category={categoryData} />

// Blog post example
<BlogPostSEO post={postData} />
```

See `IMPLEMENTATION-EXAMPLES.md` for detailed examples.

### 3. Sitemap Generation

The sitemap is automatically generated during each build. The script:

1. Fetches all products, categories, and blog posts from the GraphQL API
2. Generates a sitemap.xml file with all URLs
3. Places it in the public directory for search engines

To manually generate the sitemap:

```bash
npm run generate-sitemap
```

## Documentation

- **SEO-GUIDE.md**: Comprehensive SEO strategy guide
- **IMPLEMENTATION-EXAMPLES.md**: Examples of implementing SEO components
- **schema-examples.json**: Reference examples of structured data

## Google Search Console Setup

After deploying the site:

1. Create/access your [Google Search Console](https://search.google.com/search-console) account
2. Add your property (domain or URL prefix)
3. Verify ownership (via DNS record, HTML file, or other methods)
4. Submit your sitemap: `https://teakacacia.com/sitemap.xml`
5. Monitor performance, issues, and indexing status

## Google Business Profile Setup

For local SEO:

1. Create/claim your [Google Business Profile](https://business.google.com/)
2. Complete all business information
3. Add photos of your store and products
4. Respond to reviews
5. Post updates regularly

## Maintenance

The system is designed to work automatically with minimal maintenance. However:

1. Review Search Console reports monthly
2. Update structured data if product/category structure changes
3. Ensure new page types get appropriate SEO components

## Benefits

This automated SEO system provides:

1. **Consistency**: All pages follow SEO best practices
2. **Rich Results**: Structured data enables rich snippets in search results
3. **Better Visibility**: Improved chances of ranking higher in search results
4. **Time Savings**: Minimal manual work required for new pages
5. **Scalability**: System grows with your website

For questions or updates to the SEO system, contact the development team.
