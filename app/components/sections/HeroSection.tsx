'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc } from '@/app/lib/utils';
import { getBrandName, getPrimaryHeroImageFromHero } from '@/app/lib/siteContent';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
}

const HERO_SERVICE_POINTS = [
  { key: 'home', match: 'home', label: 'Home Inspections' },
  { key: 'roof', match: 'roof', label: 'Roof Inspections' },
  { key: 'termite', match: 'termite', label: 'Termite (WDO) Inspections' },
] as const;

function collectHeroImages(hero: Page['hero'] | undefined): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string) => {
    if (!url?.trim() || seen.has(url)) return;
    seen.add(url);
    images.push(url);
  };

  const h = hero as Page['hero'] & { images?: unknown[] };
  for (const item of h?.mediaItems ?? h?.images ?? []) {
    if (typeof item === 'string') add(getImageSrc(item));
    else if (item && typeof item === 'object') {
      const raw = item as { url?: string; image?: { url?: string } };
      add(raw.url ? getImageSrc(raw.url) : raw.image?.url ? getImageSrc(raw.image.url) : undefined);
    }
  }

  if (hero?.media) {
    const media = hero.media;
    if (typeof media === 'string') add(getImageSrc(media));
    else if (media.url) add(getImageSrc(media.url));
  }

  const primary = getPrimaryHeroImageFromHero(hero);
  if (primary) add(primary);

  return images;
}

function findService(services: Service[], match: string): Service | undefined {
  return services.find((s) => s.status === 'published' && s.name?.toLowerCase().includes(match));
}

export function HeroSection({ hero, page, className }: HeroSectionProps) {
  const { site, pages, services } = useWebBuilder();
  const brandName = getBrandName(site);
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaInnerRef = useRef<HTMLDivElement>(null);
  const overlayFxRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => tiptapToText(hero?.title), [hero?.title]);
  const description = useMemo(() => {
    const fromDesc = tiptapToText(hero?.description);
    if (fromDesc) return fromDesc;
    return tiptapToText(hero?.subtitle);
  }, [hero?.description, hero?.subtitle]);

  const ctaButton = useMemo(() => {
    const fromPage = resolvePrimaryCta(page, site, pages);
    if (fromPage?.label?.trim() && fromPage?.href?.trim()) return fromPage;
    if (hero?.primaryCta?.label?.trim() && hero?.primaryCta?.href?.trim()) {
      return {
        label: hero.primaryCta.label.trim(),
        href: hero.primaryCta.href.trim(),
      };
    }
    return null;
  }, [page, site, pages, hero?.primaryCta]);

  const heroImage = useMemo(() => collectHeroImages(hero)[0] || '', [hero]);

  const servicePoints = useMemo(() => {
    const ids = page?.servicesSection?.serviceIds ?? [];
    const pool =
      ids.length > 0
        ? ids
            .map((id) => services.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s))
        : services;

    return HERO_SERVICE_POINTS.map((item) => {
      const match = findService(pool, item.match) || findService(services, item.match);
      return {
        key: item.key,
        label: match?.name?.trim() || item.label,
        href: match ? `/service/${resolveServiceSlug(match)}` : '/services',
      };
    });
  }, [services, page?.servicesSection?.serviceIds]);

  useEffect(() => {
    if (!sectionRef.current || hero?.enabled === false) return;
    ensureGsapScroll();

    const ctx = gsap.context(() => {
      const reveals = sectionRef.current!.querySelectorAll('[data-hero-reveal]');

      if (reducedMotion) {
        gsap.set(reveals, { opacity: 1, y: 0 });
        if (mediaInnerRef.current) gsap.set(mediaInnerRef.current, { yPercent: 0, scale: 1 });
        if (overlayFxRef.current) gsap.set(overlayFxRef.current, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        reveals,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.08,
        }
      );

      if (mediaInnerRef.current) {
        gsap.fromTo(
          mediaInnerRef.current,
          { yPercent: -10, scale: 1.1 },
          {
            yPercent: 10,
            scale: 1.03,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          }
        );
      }

      if (overlayFxRef.current && heroImage) {
        gsap.fromTo(
          overlayFxRef.current,
          { opacity: 0.7 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.9,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [hero?.enabled, reducedMotion, heroImage, title, description]);

  if (hero?.enabled === false) return null;
  if (!title && !description && !heroImage) return null;

  return (
    <section
      ref={sectionRef}
      id="home"
      className={cn('gb-hero', !heroImage && 'gb-hero--no-media', className)}
    >
      {heroImage ? (
        <div className="gb-hero-bg" aria-hidden={!title && !description}>
          <div ref={mediaInnerRef} className="gb-hero-media-parallax">
            <Image
              src={heroImage}
              alt={title || brandName || ''}
              fill
              priority
              sizes="100vw"
              className="gb-hero-image"
            />
          </div>
          <div className="gb-hero-overlay" />
          <div ref={overlayFxRef} className="gb-hero-fx" aria-hidden>
            <span className="gb-hero-fx-wash" />
            <span className="gb-hero-fx-beam gb-hero-fx-beam--1" />
            <span className="gb-hero-fx-beam gb-hero-fx-beam--2" />
            <span className="gb-hero-fx-beam gb-hero-fx-beam--3" />
            <span className="gb-hero-fx-horizon" />
            <span className="gb-hero-fx-dust gb-hero-fx-dust--a" />
            <span className="gb-hero-fx-dust gb-hero-fx-dust--b" />
            <span className="gb-hero-fx-vignette" />
          </div>
        </div>
      ) : null}

      <div className="gb-hero-panel">
        <div className="gb-hero-copy-inner">
          {title ? (
            <h1 data-hero-reveal className="gb-hero-title">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p data-hero-reveal className="gb-hero-desc">
              {description}
            </p>
          ) : null}

          <div data-hero-reveal className="gb-hero-services" role="list">
            {servicePoints.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="gb-hero-service-card"
                role="listitem"
              >
                <span className="gb-hero-service-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {ctaButton ? (
            <a data-hero-reveal href={ctaButton.href} className="gb-btn-outline gb-hero-cta">
              {ctaButton.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
