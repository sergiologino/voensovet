import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  noindex = false
}: SEOProps) {
  const siteUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://voensovet.ru';
  const resolvedOgImage = ogImage || `${siteUrl}/logo-placeholder.png`;
  const fullTitle = `${title} | Портал Поддержки Военнослужащих`;
  const fullDescription = description || 'Портал поддержки военнослужащих - помощь, права, льготы и консультации';

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', fullDescription);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', fullDescription, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:image', resolvedOgImage, 'property');
    updateMetaTag('og:url', canonical || siteUrl, 'property');
    updateMetaTag('og:site_name', 'Портал Поддержки Военнослужащих', 'property');
    updateMetaTag('og:locale', 'ru_RU', 'property');

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', resolvedOgImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || siteUrl);

    // Additional meta tags
    updateMetaTag('author', 'Портал Поддержки Военнослужащих');
    updateMetaTag('theme-color', '#2c5f8d');

  }, [fullTitle, fullDescription, keywords, resolvedOgImage, ogType, canonical, noindex, siteUrl]);

  return null;
}

