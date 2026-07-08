'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import {
  getHeroEyebrowText,
  getHeroTitleText,
  getPrimaryHeroImageFromHero,
} from '@/app/lib/siteContent';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc } from '@/app/lib/utils';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
}

type HeroSlide = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600';

function collectHeroImages(
  hero: Page['hero'] | undefined,
  backgroundOverride?: string
): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string) => {
    if (!url?.trim() || seen.has(url)) return;
    seen.add(url);
    images.push(url);
  };

  if (backgroundOverride?.trim()) add(backgroundOverride);

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

  return images.length ? images : [FALLBACK_IMAGE];
}

export function HeroSection({
  hero,
  page,
  className,
  title: titleOverride,
  subtitle: subtitleOverride,
  description: descriptionOverride,
  backgroundImage: backgroundOverride,
}: HeroSectionProps) {
  const { site, pages } = useWebBuilder();
  const [activeIndex, setActiveIndex] = useState(0);

  const phoneNumber = site?.business?.phone?.trim() || '';

  const slides = useMemo((): HeroSlide[] => {
    const images = collectHeroImages(hero, backgroundOverride);
    const result: HeroSlide[] = [];

    const mainTitle = titleOverride || getHeroTitleText(hero, site);
    const mainSubtitle =
      subtitleOverride ||
      descriptionOverride ||
      tiptapToText(hero?.description) ||
      getHeroEyebrowText(hero, site) ||
      'Professional inspections when you need them.';

    result.push({
      title: mainTitle,
      subtitle: mainSubtitle,
      imageUrl: images[0],
    });

    const companyDetails = page?.companyDetailSection?.details ?? [];
    for (const detail of companyDetails) {
      const title = tiptapToText(detail.title) || detail.label?.trim() || '';
      const subtitle =
        tiptapToText(detail.description) || tiptapToText(detail.value) || '';
      const imageUrl = detail.image?.url ? getImageSrc(detail.image.url) : images[0];
      if (title) {
        result.push({ title, subtitle, imageUrl });
      }
    }

    const whyItems = page?.whyChooseUsSection?.items ?? [];
    for (const item of whyItems) {
      const title = tiptapToText(item.title);
      const subtitle = tiptapToText(item.description);
      if (title) {
        result.push({
          title,
          subtitle,
          imageUrl: images[result.length % images.length] ?? images[0],
        });
      }
    }

    if (result.length === 1 && images.length > 1) {
      return images.map((imageUrl, index) => ({
        title: mainTitle,
        subtitle: mainSubtitle,
        imageUrl,
      }));
    }

    return result.map((slide, index) => ({
      ...slide,
      imageUrl: slide.imageUrl || images[index % images.length] || images[0],
    }));
  }, [
    hero,
    site,
    page,
    titleOverride,
    subtitleOverride,
    descriptionOverride,
    backgroundOverride,
  ]);

  const ctaButton = useMemo(() => {
    const fromPage = resolvePrimaryCta(page, site, pages);
    if (fromPage) return fromPage;
    if (hero?.primaryCta?.label?.trim() && hero?.primaryCta?.href?.trim()) {
      return { label: hero.primaryCta.label.trim(), href: hero.primaryCta.href.trim() };
    }
    return { href: '#contact', label: 'Order Inspection' };
  }, [page, site, pages, hero?.primaryCta]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [slides.length, goNext]);

  if (hero?.enabled === false) return null;

  return (
    <section id="home" className={cn('wb-surface-page', className)}>
      <div className="hg-hero-carousel">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'hg-hero-slide transition-opacity duration-700',
              index === activeIndex
                ? 'opacity-100 relative z-[1]'
                : 'opacity-0 absolute inset-0 z-0 pointer-events-none'
            )}
            aria-hidden={index !== activeIndex}
          >
            <div className="hg-hero-bg">
              <Image
                src={slide.imageUrl || FALLBACK_IMAGE}
                alt={slide.title}
                fill
                className="object-cover object-center"
                priority={index === 0}
                sizes="100vw"
              />
            </div>

            <div className="hg-hero-slide-inner">
              <div className="hg-hero-overlay-panel">
                <h2>{slide.title}</h2>
                {slide.subtitle && <p className="hg-hero-subtitle">{slide.subtitle}</p>}
                <div className="hg-hero-actions">
                  {phoneNumber && (
                    <a
                      href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                      className="hg-phone-link text-lg"
                    >
                      {phoneNumber}
                    </a>
                  )}
                  <a href={ctaButton.href} className="hg-btn">
                    {ctaButton.label}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="hg-hero-arrow hg-hero-arrow-prev"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="hg-hero-arrow hg-hero-arrow-next"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
