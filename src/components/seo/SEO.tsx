import { useEffect } from 'react';
import { SITE_ORIGIN } from '../../constants/site';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

function buildJsonLd(params: {
  canonicalUrl: string;
  pageName: string;
  description: string;
}) {
  const orgId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'Военсовет.ру',
        alternateName: 'Портал поддержки военнослужащих',
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/logo-placeholder.png`,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'Военсовет.ру — портал поддержки военнослужащих',
        url: SITE_ORIGIN,
        inLanguage: 'ru-RU',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'WebPage',
        '@id': `${params.canonicalUrl}#webpage`,
        url: params.canonicalUrl,
        name: params.pageName,
        description: params.description,
        inLanguage: 'ru-RU',
        isPartOf: { '@id': websiteId },
      },
    ],
  };
}

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOProps) {
  const canonicalUrl =
    canonical?.trim() ||
    (typeof window !== 'undefined'
      ? `${SITE_ORIGIN}${window.location.pathname === '/' ? '/' : window.location.pathname}${window.location.hash || ''}`
      : `${SITE_ORIGIN}/`);

  const resolvedOgImage = ogImage || `${SITE_ORIGIN}/logo-placeholder.png`;
  const fullTitle = `${title} | Портал Поддержки Военнослужащих`;
  const fullDescription =
    description ||
    'Портал поддержки военнослужащих — помощь, права, льготы и консультации для военных и семей.';

  useEffect(() => {
    document.title = fullTitle;

    const updateMetaTag = (
      name: string,
      content: string,
      attribute: string = 'name'
    ) => {
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const removeMetaByName = (name: string) => {
      document.querySelector(`meta[name="${name}"]`)?.remove();
    };

    updateMetaTag('description', fullDescription);
    if (keywords && keywords.trim()) {
      updateMetaTag('keywords', keywords.trim());
    } else {
      removeMetaByName('keywords');
    }

    updateMetaTag('content-language', 'ru', 'http-equiv');

    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', fullDescription, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:image', resolvedOgImage, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:site_name', 'Портал Поддержки Военнослужащих', 'property');
    updateMetaTag('og:locale', 'ru_RU', 'property');

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', resolvedOgImage);

    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    let hreflang = document.querySelector(
      'link[hreflang="ru"]'
    ) as HTMLLinkElement;
    if (!hreflang) {
      hreflang = document.createElement('link');
      hreflang.setAttribute('rel', 'alternate');
      hreflang.setAttribute('hreflang', 'ru');
      document.head.appendChild(hreflang);
    }
    hreflang.setAttribute('href', canonicalUrl);

    updateMetaTag('author', 'Портал Поддержки Военнослужащих');
    updateMetaTag('theme-color', '#2c5f8d');

    const jsonLd = buildJsonLd({
      canonicalUrl,
      pageName: fullTitle,
      description: fullDescription,
    });
    const scriptId = 'vs-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  }, [
    fullTitle,
    fullDescription,
    keywords,
    resolvedOgImage,
    ogType,
    canonicalUrl,
    noindex,
  ]);

  return null;
}
