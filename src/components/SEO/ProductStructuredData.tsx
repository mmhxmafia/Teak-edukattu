import { Helmet } from 'react-helmet-async';

interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  reviewCount?: number;
  ratingValue?: number;
}

const ProductStructuredData = ({
  name,
  description,
  image,
  price,
  currency = 'INR',
  sku = '',
  brand = 'Edakkattu Furniture (Teakacacia LLP)',
  availability = 'InStock',
  reviewCount = 0,
  ratingValue = 0
}: ProductStructuredDataProps) => {
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: currency,
      price: price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: `https://schema.org/${availability}`
    }
  };

  // Add reviews if available
  if (reviewCount > 0 && ratingValue > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default ProductStructuredData;
