import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const MetaTags = ({
  title,
  description,
  keywords = 'teak furniture, wooden furniture, Edakkattu Furniture, Teakacacia LLP, sustainable furniture',
  canonicalUrl = 'https://teakacacia.com',
  ogImage = 'https://teakacacia.com/images/og-image.jpg',
  ogType = 'website',
  structuredData
}: MetaTagsProps) => {
  // Format title to include brand name if not already included
  const formattedTitle = title.includes('Edakkattu Furniture') 
    ? title 
    : `${title} | Edakkattu Furniture (Teakacacia LLP)`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaTags;
