import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Chaitra Wrap & Wear',
  description = 'Premium personalized photo frames, acrylic frames, MDF frames, magnetic photo frames & custom keychains. Preserve your precious memories in style.',
  keywords = 'personalized photo frames, custom keychains, acrylic frames, MDF frames, magnetic photo frames, custom gifts',
  canonical = 'https://chaitrika.in',
  ogTitle,
  ogDescription,
  ogImage = 'https://chaitrika.in/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots = 'index, follow',
  structuredData = null,
  children = null
}) => {
  const fullTitle = title === 'Chaitra Wrap & Wear' ? title : `${title} | Chaitra Wrap & Wear`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0F172A" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Chaitra Wrap & Wear" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      <meta name="twitter:creator" content="@chaitraWraps" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional Head Elements */}
      {children}
    </Helmet>
  );
};

export default SEO;
