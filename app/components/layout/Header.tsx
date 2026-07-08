'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getBusinessTagline,
  getHeaderNavLinks,
  getPageHref,
} from '@/app/lib/siteContent';
import { getImageSrc } from '@/app/lib/utils';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';

type DisplayArea = {
  city: string;
  region: string;
  href?: string;
};

type ServiceMenuItem = {
  slug: string;
  name: string;
  href: string;
  areas: DisplayArea[];
};

type HeaderCta = {
  id: string;
  label: string;
  href: string;
};

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') || t.startsWith('#') ? t : `/${t}`;
}

function getAreasForService(
  service: Service,
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas?: unknown[]
): DisplayArea[] {
  const slug = resolveServiceSlug(service);
  const result: DisplayArea[] = [];
  const seen = new Set<string>();

  const add = (city: string, region: string) => {
    const key = `${city}|${region}`.toLowerCase();
    if (!city.trim() || seen.has(key)) return;
    seen.add(key);
    result.push({
      city: city.trim(),
      region: region.trim(),
      href: getServiceAreaPageHref(slug, { city, region }, serviceAreaPages) || undefined,
    });
  };

  for (const page of serviceAreaPages) {
    if (page.status !== 'published' || !page.city?.trim()) continue;

    const pageServiceSlug = getServiceSlugFromAreaPage(page);
    let matches = pageServiceSlug && normalizeSlug(pageServiceSlug) === normalizeSlug(slug);

    if (!matches && page.serviceId) {
      const ref = page.serviceId as string | { _id?: string; slug?: string };
      if (typeof ref === 'string') {
        matches = ref === service._id;
      } else if (ref && typeof ref === 'object') {
        matches =
          ref._id === service._id ||
          Boolean(ref.slug && normalizeSlug(ref.slug) === normalizeSlug(slug));
      }
    }

    if (matches) add(page.city, page.region || '');
  }

  if (!result.length) {
    for (const area of service.serviceAreas ?? []) {
      add(getAreaCity(area), getAreaRegion(area));
    }
  }

  if (!result.length && siteServiceAreas?.length) {
    for (const area of siteServiceAreas) {
      add(getAreaCity(area), getAreaRegion(area));
    }
  }

  return result;
}

function buildServiceMenuItems(
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas?: unknown[]
): ServiceMenuItem[] {
  return services
    .filter((s) => s.status === 'published' && s.name?.trim())
    .map((service) => {
      const slug = resolveServiceSlug(service);
      return {
        slug,
        name: service.name.trim(),
        href: `/service/${slug}`,
        areas: getAreasForService(service, serviceAreaPages, siteServiceAreas),
      };
    });
}

function areaLabel(area: DisplayArea): string {
  return area.region ? `${area.city}, ${area.region}` : area.city;
}

function buildHeaderCtas(
  homePage: Page | undefined,
  contactHref: string,
  servicesHref: string,
  publishedServices: Service[]
): HeaderCta[] {
  const candidates: HeaderCta[] = [];
  const seen = new Set<string>();

  const add = (id: string, label?: string, href?: string) => {
    const cleanLabel = label?.trim();
    const cleanHref = href?.trim();
    if (!cleanLabel || !cleanHref) return;
    const key = `${cleanLabel}|${cleanHref}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ id, label: cleanLabel, href: normalizeHref(cleanHref) });
  };

  add('hero-primary', homePage?.hero?.primaryCta?.label, homePage?.hero?.primaryCta?.href);
  add('hero-secondary', homePage?.hero?.secondaryCta?.label, homePage?.hero?.secondaryCta?.href);
  add(
    'cta-primary',
    homePage?.ctaSection?.primaryButton?.label,
    homePage?.ctaSection?.primaryButton?.href
  );
  add(
    'cta2-primary',
    homePage?.cta2Section?.primaryButton?.label,
    homePage?.cta2Section?.primaryButton?.href
  );

  for (const service of publishedServices.slice(0, 2)) {
    add(`service-${service._id}`, service.name, `/service/${resolveServiceSlug(service)}`);
  }

  add('contact', 'Contact Us', contactHref);
  add('services', 'Our Services', servicesHref);

  return candidates.slice(0, 4);
}

function ServicesMegaMenu({
  label,
  sectionHref,
  items,
}: {
  label: string;
  sectionHref: string;
  items: ServiceMenuItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  if (!items.length) {
    return (
      <Link href={sectionHref} className="hg-nav-link">
        {label}
      </Link>
    );
  }

  return (
    <div className="relative group" onMouseLeave={() => setActiveIndex(0)}>
      <Link href={sectionHref} className="hg-nav-link inline-flex items-center gap-1">
        {label}
        <svg className="w-3 h-3 opacity-80" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute top-full left-1/2 -translate-x-1/2 pt-2 pointer-events-none group-hover:pointer-events-auto z-50">
        <div className="flex w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded border border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] bg-[var(--wb-card-bg-light)] shadow-lg text-[var(--wb-text-main)]">
          <div className="w-1/2 min-w-0 border-r border-[var(--color-gray-200)] bg-[var(--wb-section-bg-light)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-2">
              Serving Areas
            </p>
            {active && (
              <>
                <h4 className="text-sm font-bold mb-3">{active.name}</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {active.areas.length > 0 ? (
                    active.areas.map((area, idx) => (
                      <Link
                        key={`${area.city}-${area.region}-${idx}`}
                        href={area.href || '/#service-areas'}
                        className="block text-sm text-[var(--wb-accent-dark)] hover:underline"
                      >
                        {areaLabel(area)}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--wb-text-secondary)]">Serving areas coming soon.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="w-1/2 min-w-0 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-2">
              Services
            </p>
            <Link href={sectionHref} className="block text-sm font-medium hover:text-[var(--wb-accent-dark)] mb-2">
              All Services
            </Link>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {items.map((item, index) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                    index === activeIndex
                      ? 'bg-[var(--wb-section-bg-light)] text-[var(--wb-accent-dark)] font-medium'
                      : 'text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();
  const [isOpen, setIsOpen] = useState(false);

  const businessName = getBrandName(site) || 'ACE Grading LLC';
  const phoneNumber = site?.business?.phone?.trim() || '';
  const tagline = getBusinessTagline(site);

  const homePage = useMemo(() => pages.find((p) => p.pageType === 'home'), [pages]);

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const serviceMenuItems = useMemo(
    () => buildServiceMenuItems(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const { mainNavLinks, mobileNavLinks, contactNav } = useMemo(
    () => getHeaderNavLinks(pages),
    [pages]
  );

  const servicesPage = useMemo(
    () => pages.find((p) => p.pageType === 'service-list'),
    [pages]
  );
  const servicesHref = servicesPage ? getPageHref(servicesPage) : '/services';

  const headerCtas = useMemo(
    () =>
      buildHeaderCtas(
        homePage,
        contactNav.href,
        servicesHref,
        services.filter((s) => s.status === 'published')
      ),
    [homePage, contactNav.href, servicesHref, services]
  );

  const blueNavItems = useMemo(() => {
    return mainNavLinks.map((link) => {
      const isServices =
        link.href === '/services' ||
        link.href === servicesHref ||
        servicesPage?._id === link.id;

      return {
        id: link.id,
        label: link.label.toUpperCase(),
        href: link.href,
        mega: isServices && serviceMenuItems.length > 0,
      };
    });
  }, [mainNavLinks, serviceMenuItems.length, servicesHref, servicesPage?._id]);

  const promoLabel = businessName;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="fixed w-full z-[100] top-0 shadow-sm">
      <div className="hg-header-shell">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="hg-header-main">
            <div className="justify-self-start">
              {phoneNumber ? (
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hg-phone-btn">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
                  </svg>
                  <span className="hidden sm:inline">{phoneNumber}</span>
                  <span className="sm:hidden">Call</span>
                </a>
              ) : (
                <Link href={contactNav.href} className="hg-phone-btn">
                  Contact Us
                </Link>
              )}
            </div>

            <Link href="/" className="justify-self-center flex items-center shrink-0">
              <Image
                src={logoSrc}
                alt={site?.footer?.logo?.altText?.trim() || businessName}
                width={320}
                height={88}
                priority
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
              />
            </Link>

            <div className="hidden lg:grid hg-cta-grid">
              {headerCtas.map((cta) => (
                <Link key={cta.id} href={cta.href} className="hg-cta-btn">
                  {cta.label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden justify-self-end p-2 -mr-2"
            >
              <div className="w-6 flex flex-col items-end gap-1.5">
                <div
                  className={`h-0.5 bg-[var(--wb-text-main)] transition-all ${
                    isOpen ? 'w-6 rotate-45 translate-y-[5px]' : 'w-6'
                  }`}
                />
                <div
                  className={`h-0.5 bg-[var(--wb-text-main)] transition-all ${
                    isOpen ? 'opacity-0' : 'w-4'
                  }`}
                />
                <div
                  className={`h-0.5 bg-[var(--wb-text-main)] transition-all ${
                    isOpen ? 'w-6 -rotate-45 -translate-y-[5px]' : 'w-2'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <nav className="hg-nav-bar hidden lg:block">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="hg-nav-links flex-1">
              {blueNavItems.map((item) =>
                item.mega ? (
                  <ServicesMegaMenu
                    key={item.id}
                    label={item.label}
                    sectionHref={item.href}
                    items={serviceMenuItems}
                  />
                ) : (
                  <Link key={item.id} href={item.href} className="hg-nav-link">
                    {item.label}
                  </Link>
                )
              )}
            </div>
            {promoLabel && (
              <span className="hidden xl:block text-sm font-semibold text-[var(--wb-text-on-dark)] whitespace-nowrap font-[family-name:var(--wb-heading-font)]">
                {promoLabel}
              </span>
            )}
          </div>
        </div>
      </nav>

      {tagline && (
        <div className="hg-announcement-bar">
          <strong>{tagline}</strong>
        </div>
      )}

      <div
        className={`fixed inset-0 z-[99] bg-[var(--wb-page-bg)] transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: 'var(--wb-header-height)' }}
      >
        <div className="flex flex-col h-full px-6 py-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {headerCtas.map((cta) => (
              <Link
                key={cta.id}
                href={cta.href}
                onClick={() => setIsOpen(false)}
                className="hg-cta-btn"
              >
                {cta.label}
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            {mobileNavLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-lg font-semibold text-[var(--wb-text-main)] hover:text-[var(--wb-accent-dark)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {phoneNumber && (
            <div className="mt-auto pt-8 border-t border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)]">
              <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hg-phone-btn w-full">
                {phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
