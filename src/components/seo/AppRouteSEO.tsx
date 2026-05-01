import { SEO } from './SEO';
import { SEO_BY_PAGE } from '../../constants/routeSeo';
import { SITE_ORIGIN } from '../../constants/site';

type Props = {
  activePage: string;
};

export function AppRouteSEO({ activePage }: Props) {
  const meta = SEO_BY_PAGE[activePage] ?? SEO_BY_PAGE.home;
  const canonical = `${SITE_ORIGIN}/#${meta.hash}`;

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      keywords={meta.keywords}
      canonical={canonical}
      noindex={meta.noindex === true}
    />
  );
}
