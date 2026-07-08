'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBusinessTagline } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
  href?: string;
};

function normalizeServiceArea(area: unknown): Omit<DisplayArea, 'href'> | null {
  const city = getAreaCity(area);
  if (!city) return null;
  return { city, region: getAreaRegion(area) };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function areaKey(area: Pick<DisplayArea, 'city' | 'region'>): string {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function buildServiceAreas(
  servingAreasSection: Page['servingAreasSection'] | undefined,
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas: string[] | undefined
): DisplayArea[] {
  const result: DisplayArea[] = [];
  const seen = new Set<string>();

  const addArea = (area: unknown, serviceSlug: string) => {
    const normalized = normalizeServiceArea(area);
    if (!normalized) return;
    const key = areaKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    const href = getServiceAreaPageHref(serviceSlug, normalized, serviceAreaPages);
    result.push({ ...normalized, href: href || undefined });
  };

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = services.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return 'service';
  };

  serviceAreaPages.forEach((page) => {
    if (page.status !== 'published' || !page.city?.trim()) return;
    addArea({ city: page.city, region: page.region }, resolveSlugForPage(page));
  });
  if (result.length > 0) return result;

  const visibleServices = services.filter(isVisibleService);
  for (const service of visibleServices) {
    const slug = resolveServiceSlug(service);
    (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
  }
  if (result.length > 0) return result;

  const defaultSlug = visibleServices[0]
    ? resolveServiceSlug(visibleServices[0])
    : 'service';
  (siteServiceAreas ?? []).forEach((area) => addArea(area, defaultSlug));

  return result;
}

export function ServingAreasSection({
  servingAreasSection,
  className,
}: ServingAreasSectionProps) {
  const { site, services, serviceAreaPages } = useWebBuilder();

  const serviceAreas = useMemo(
    () =>
      buildServiceAreas(
        servingAreasSection,
        services,
        serviceAreaPages,
        site?.serviceAreas
      ),
    [servingAreasSection, services, serviceAreaPages, site?.serviceAreas]
  );

  const title = useMemo(
    () => tiptapToText(servingAreasSection?.title) || 'Service Area',
    [servingAreasSection?.title]
  );

  const description = useMemo(
    () =>
      tiptapToText(servingAreasSection?.description) ||
      getBusinessTagline(site) ||
      'Providing expert services across the following key regions.',
    [servingAreasSection?.description, site]
  );

  if (servingAreasSection?.enabled === false) return null;
  if (!serviceAreas.length) return null;

  return (
    <section id="service-areas" className={cn('hg-section hg-section-alt', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="hg-section-title">{title}</h2>
        {description && (
          <p className="hg-section-desc max-w-2xl">
            {description}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {serviceAreas.map((area) => {
            const label = area.region ? `${area.city}, ${area.region}` : area.city;
            return area.href ? (
              <Link key={areaKey(area)} href={area.href} className="hg-area-chip">
                {label}
              </Link>
            ) : (
              <span key={areaKey(area)} className="hg-area-chip">
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServingAreasSection;
