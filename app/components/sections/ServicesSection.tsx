'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Bug, Home, ScanSearch, ShieldCheck } from 'lucide-react';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { getPageHref } from '@/app/lib/siteContent';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useThemeFonts } from '@/app/hooks/useTheme';

function cssFontFamily(font?: string): string | undefined {
  const value = font?.trim();
  if (!value) return undefined;
  if (value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) {
    return `"${value}"`;
  }
  return value;
}

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
  servicesLimit?: number;
  showViewAllLink?: boolean;
  showAllServices?: boolean;
  compact?: boolean;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  Icon: LucideIcon;
};

const PRIORITY_ORDER = ['home', 'roof', 'termite'] as const;

function servicePriority(name: string): number {
  const label = name.toLowerCase();
  const index = PRIORITY_ORDER.findIndex((key) => label.includes(key));
  return index === -1 ? PRIORITY_ORDER.length : index;
}

function iconForService(name: string): LucideIcon {
  const label = name.toLowerCase();
  if (label.includes('termite') || label.includes('pest')) return Bug;
  if (label.includes('roof')) return ShieldCheck;
  if (label.includes('home') || label.includes('house')) return Home;
  return ScanSearch;
}

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
    Icon: iconForService(service.name),
  };
}

export function ServicesSection({
  servicesSection,
  className,
  servicesLimit,
  showViewAllLink = false,
  showAllServices = false,
}: ServicesSectionProps) {
  const { services: allServices, pages } = useWebBuilder();
  const reducedMotion = usePrefersReducedMotion();
  const themeFonts = useThemeFonts();
  const sectionRef = useRef<HTMLElement>(null);

  const headingFont = cssFontFamily(themeFonts.heading);
  const bodyFont = cssFontFamily(themeFonts.body);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;

  const { services, hasMoreServices } = useMemo(() => {
    const published = allServices.filter((s) => s.status === 'published');
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      showAllServices || ids.length === 0
        ? published
        : ids
            .map((id) => allServices.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s));

    const mapped = selected
      .map(mapServiceToDisplay)
      .sort((a, b) => servicePriority(a.name) - servicePriority(b.name));

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
    () => tiptapToText(servicesSection?.title) || 'Our Services',
    [servicesSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(servicesSection?.description),
    [servicesSection?.description]
  );

  useEffect(() => {
    if (!sectionRef.current || !services.length) return;

    ensureGsapScroll();
    const ctx = gsap.context(() => {
      const head = sectionRef.current!.querySelectorAll('[data-svc-head]');
      const rows = sectionRef.current!.querySelectorAll<HTMLElement>('.gb-svc-row');
      const moreLink = sectionRef.current!.querySelectorAll('[data-svc-actions]');

      if (reducedMotion) {
        gsap.set([head, moreLink], { opacity: 1, y: 0 });
        rows.forEach((row) => {
          gsap.set(row.querySelectorAll('[data-svc-media], [data-svc-panel] > *'), {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
          });
        });
        return;
      }

      gsap.fromTo(
        head,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      rows.forEach((row) => {
        const flipped = row.classList.contains('gb-svc-row--flip');
        const media = row.querySelector('[data-svc-media]');
        const panelItems = row.querySelectorAll('[data-svc-panel] > *');
        const mediaFromX = flipped ? 48 : -48;
        const textFromX = flipped ? -28 : 28;

        if (media) {
          gsap.fromTo(
            media,
            {
              opacity: 0,
              x: mediaFromX,
              scale: 1.06,
              clipPath: flipped ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              clipPath: 'inset(0 0% 0 0%)',
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 82%',
              },
            }
          );
        }

        if (panelItems.length) {
          gsap.fromTo(
            panelItems,
            { opacity: 0, x: textFromX, y: 12 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 78%',
              },
            }
          );
        }
      });

      if (moreLink.length) {
        gsap.fromTo(
          moreLink,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: moreLink[0],
              start: 'top 92%',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [services, reducedMotion, title, description]);

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!services.length) return null;

  return (
    <section
      ref={sectionRef}
      id="services"
      className={cn('gb-svc', className)}
      style={bodyStyle}
    >
      <div className="gb-container">
        <header className="gb-svc-head">
          <h2 data-svc-head className="gb-svc-title" style={headingStyle}>
            {title}
          </h2>
          {description ? (
            <p data-svc-head className="gb-svc-desc" style={bodyStyle}>
              {description}
            </p>
          ) : null}
        </header>
      </div>

      <div className="gb-container gb-svc-board-wrap">
        <div className="gb-svc-board">
          {services.map((service, index) => {
            const Icon = service.Icon;
            return (
              <article
                key={service.id}
                className={cn('gb-svc-row', index % 2 === 1 && 'gb-svc-row--flip')}
              >
                <div data-svc-media className="gb-svc-media">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="gb-svc-media-fallback" aria-hidden>
                      <Icon strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div data-svc-panel className="gb-svc-panel" style={bodyStyle}>
                  <span className="gb-svc-icon" aria-hidden>
                    <Icon strokeWidth={1.6} />
                  </span>
                  <h3 className="gb-svc-name" style={headingStyle}>
                    {service.name}
                  </h3>
                  {service.description ? (
                    <p className="gb-svc-copy" style={bodyStyle}>
                      {service.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/service/${service.slug}`}
                    className="gb-svc-link"
                    style={bodyStyle}
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {showViewAllLink && hasMoreServices ? (
        <div data-svc-actions className="gb-svc-actions">
          <Link href={servicesHref} className="gb-svc-more" style={bodyStyle}>
            See more
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export default ServicesSection;
