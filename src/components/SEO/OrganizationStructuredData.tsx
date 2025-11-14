import { Helmet } from 'react-helmet-async';

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  telephone?: string;
  socialLinks?: string[];
}

const OrganizationStructuredData = ({
  name = 'Edakkattu Furniture (Teakacacia LLP)',
  url = 'https://teakacacia.com',
  logo = 'https://teakacacia.com/logo.png',
  telephone = '',
  socialLinks = []
}: OrganizationStructuredDataProps) => {
  // Create the structured data for organization
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': name,
    'url': url,
    'logo': logo
  };

  // Add contact point if telephone is provided
  if (telephone) {
    structuredData.contactPoint = {
      '@type': 'ContactPoint',
      'telephone': telephone,
      'contactType': 'customer service'
    };
  }

  // Add social links if provided
  if (socialLinks.length > 0) {
    structuredData.sameAs = socialLinks;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default OrganizationStructuredData;
