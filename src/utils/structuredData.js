// Structured Data generators for SEO

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Chaitra Wrap & Wear',
  description: 'Premium personalized photo frames, acrylic frames, and custom keychains',
  url: 'https://chaitrika.in',
  logo: 'https://chaitrika.in/logo.png',
  image: 'https://chaitrika.in/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Madhapur',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500081',
    addressCountry: 'IN'
  },
  telephone: '+918499999498',
  email: 'contact@chaitrika.in',
  sameAs: [
    'https://www.facebook.com/chaitraWraps',
    'https://www.instagram.com/chaitraWraps',
    'https://www.twitter.com/chaitraWraps'
  ],
  priceRange: '₹149-₹1799',
  areaServed: 'IN'
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chaitra Wrap & Wear',
  url: 'https://chaitrika.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://chaitrika.in/products?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What products does Chaitra Wrap & Wear offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer personalized photo frames (magnetic, acrylic, MDF), custom keychains, and other custom gift items with high-quality printing and materials.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I customize my photo frame?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browse our products, select your preferred size and shape, upload your photo, and place your order through WhatsApp with all customization details.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the delivery time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Delivery times vary based on customization complexity. Contact us via WhatsApp at +918499999498 for specific delivery estimates.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you offer international shipping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Currently, we deliver within India. Contact us for inquiries about international orders.'
      }
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all major payment methods through WhatsApp orders including bank transfers, UPI, and card payments.'
      }
    }
  ]
};

export const productSchema = (product, baseUrl = 'https://chaitrika.in') => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`,
  brand: {
    '@type': 'Brand',
    name: 'Chaitra Wrap & Wear'
  },
  category: product.category,
  offers: {
    '@type': 'AggregateOffer',
    availability: 'https://schema.org/InStock',
    priceCurrency: 'INR',
    lowPrice: Math.min(...product.sizes.map(s => s.price)),
    highPrice: Math.max(...product.sizes.map(s => s.price))
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150'
  }
});

export const breadcrumbSchema = (items, baseUrl = 'https://chaitrika.in') => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${baseUrl}${item.url}`
  }))
});
