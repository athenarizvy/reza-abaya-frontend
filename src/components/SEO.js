import { Helmet } from 'react-helmet-async';

// Reusable SEO tag manager. Pass different props on each page so Google and
// social media previews (WhatsApp, Instagram, Facebook) show the right info.
const SEO = ({ title, description, image, url }) => {
  const siteName = 'Reza Abaya';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Modest Luxury Abayas & Hijabs`;
  const defaultDescription =
    'Shop premium abayas, hijabs, and modest wear online in India. Elegant designs, quality fabrics, and timeless style — crafted for the modern modest wardrobe.';
  const defaultImage = 'https://via.placeholder.com/1200x630?text=Reza+Abaya';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph tags — control how the page looks when shared on WhatsApp, Instagram, Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}

      {/* Twitter card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;