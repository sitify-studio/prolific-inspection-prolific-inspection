'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { getPageHref } from '@/app/lib/siteContent';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
  servicesLimit?: number;
  showViewAllLink?: boolean;
  showAllServices?: boolean;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
};

function mapServiceToDisplay(service: Service): DisplayService {
  const imageUrl = service.thumbnailImage?.url
    ? getImageSrc(service.thumbnailImage.url)
    : service.galleryImages?.[0]?.url
      ? getImageSrc(service.galleryImages[0].url)
      : '';

  return {
    id: service._id,
    name: service.name,
    description:
      tiptapToText(service.shortDescription) || tiptapToText(service.description) || '',
    slug: resolveServiceSlug(service),
    imageUrl,
  };
}

function ServiceIconFallback({ name }: { name: string }) {
  const label = name.toLowerCase();

  if (label.includes('termite')) {
    return (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <path
          d="M10 72 L60 42 L110 72 L95 72 L60 52 L25 72 Z"
          fill="var(--wb-primary)"
        />
        <circle cx="60" cy="58" r="22" fill="none" stroke="var(--wb-accent-dark)" strokeWidth="5" />
        <ellipse cx="60" cy="60" rx="10" ry="6" fill="var(--wb-accent-dark)" />
        <path
          d="M48 58 L72 58 M60 52 L60 66"
          stroke="var(--wb-accent-dark)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (label.includes('roof')) {
    return (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <path
          d="M10 72 L60 38 L110 72 L95 72 L60 50 L25 72 Z"
          fill="var(--wb-primary)"
        />
        <circle cx="78" cy="52" r="16" fill="none" stroke="var(--wb-accent-dark)" strokeWidth="4" />
        <path d="M70 52 L86 52 M78 44 L78 60" stroke="var(--wb-accent-dark)" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
      <path d="M10 72 L60 38 L110 72 L95 72 L60 50 L25 72 Z" fill="var(--wb-primary)" />
      <circle cx="72" cy="48" r="18" fill="none" stroke="var(--wb-accent-dark)" strokeWidth="4" />
      <path
        d="M64 52 L76 44"
        stroke="var(--wb-accent-dark)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M66 56 L74 56"
        stroke="var(--wb-primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ServicesSection({
  servicesSection,
  className,
  servicesLimit,
  showViewAllLink = false,
  showAllServices = false,
}: ServicesSectionProps) {
  const { services: allServices, pages } = useWebBuilder();

  const { services, hasMoreServices } = useMemo(() => {
    const published = allServices.filter((s) => s.status === 'published');
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      showAllServices || ids.length === 0
        ? published
        : ids
            .map((id) => allServices.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s));

    const mapped = selected.map(mapServiceToDisplay);
    const limited =
      typeof servicesLimit === 'number' && servicesLimit > 0
        ? mapped.slice(0, servicesLimit)
        : mapped;

    const moreAvailable = showAllServices
      ? false
      : published.length > limited.length || mapped.length > limited.length;

    return { services: limited, hasMoreServices: moreAvailable };
  }, [servicesSection?.serviceIds, allServices, servicesLimit, showAllServices]);

  const servicesHref = useMemo(() => {
    const servicesPage = pages.find((p) => p.pageType === 'service-list');
    return servicesPage ? getPageHref(servicesPage) : '/services';
  }, [pages]);

  const title = useMemo(
    () => tiptapToText(servicesSection?.title) || 'Our Inspection Services',
    [servicesSection?.title]
  );

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!services.length) return null;

  return (
    <section id="services" className={cn('hg-section hg-services-section', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="hg-services-title">{title}</h2>

        <div className="hg-services-grid">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/service/${service.slug}`}
              className="hg-service-card group"
            >
              <div className="hg-service-card-icon">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt=""
                    width={140}
                    height={110}
                    className="h-[6.875rem] w-auto max-w-full object-contain"
                  />
                ) : (
                  <ServiceIconFallback name={service.name} />
                )}
              </div>

              <h3 className="hg-service-card-title">{service.name}</h3>

              {service.description && (
                <p className="hg-service-card-desc">{service.description}</p>
              )}

              <span className="hg-service-card-arrow" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M9.29 6.71a1 1 0 011.42 0l4.59 4.59a1 1 0 010 1.42l-4.59 4.59a1 1 0 01-1.42-1.42L13.17 12 9.29 8.12a1 1 0 010-1.41z"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {showViewAllLink && services.length > 0 && hasMoreServices && (
          <div className="mt-8 flex justify-center">
            <Link href={servicesHref} className="hg-btn">
              See More Services
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
