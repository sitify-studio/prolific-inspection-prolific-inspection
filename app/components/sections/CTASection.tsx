'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const { pages } = useWebBuilder();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaInnerRef = useRef<HTMLDivElement>(null);
  const overlayFxRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const heading = useMemo(() => tiptapToText(ctaSection?.title), [ctaSection?.title]);
  const description = useMemo(
    () => tiptapToText(ctaSection?.description),
    [ctaSection?.description]
  );

  const ctaButton = useMemo(() => {
    const label = ctaSection?.primaryButton?.label?.trim();
    const href = ctaSection?.primaryButton?.href?.trim();
    if (label && href) return { label, href: normalizeHref(href) };
    if (label) {
      const contactPage = pages?.find((p) => p.pageType === 'contact');
      return {
        label,
        href: contactPage ? getPageHref(contactPage) : '/contact-us',
      };
    }
    return null;
  }, [ctaSection?.primaryButton, pages]);

  const image = useMemo(() => {
    const bg = ctaSection?.backgroundImage;
    if (typeof bg === 'string' && bg.trim()) return getImageSrc(bg);
    const legacyImage = (ctaSection as { image?: { url?: string } } | undefined)?.image?.url;
    if (legacyImage?.trim()) return getImageSrc(legacyImage);
    return '';
  }, [ctaSection]);

  useEffect(() => {
    if (!sectionRef.current || ctaSection?.enabled === false) return;

    ensureGsapScroll();
    const ctx = gsap.context(() => {
      const reveals = sectionRef.current!.querySelectorAll('[data-cta-reveal]');

      if (reducedMotion) {
        gsap.set(reveals, { opacity: 1, y: 0 });
        if (mediaInnerRef.current) gsap.set(mediaInnerRef.current, { yPercent: 0, scale: 1 });
        if (overlayFxRef.current) gsap.set(overlayFxRef.current, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        reveals,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      );

      if (mediaInnerRef.current && image) {
        gsap.fromTo(
          mediaInnerRef.current,
          { yPercent: -12, scale: 1.14 },
          {
            yPercent: 12,
            scale: 1.04,
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

      if (overlayFxRef.current && image) {
        gsap.fromTo(
          overlayFxRef.current,
          { opacity: 0.75 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'center center',
              scrub: 0.6,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [ctaSection?.enabled, reducedMotion, image, heading, description]);

  if (ctaSection?.enabled === false) return null;
  if (!heading && !description && !ctaButton && !image) return null;

  return (
    <section
      id="cta"
      ref={sectionRef}
      className={cn('gb-cta', !image && 'gb-cta--no-media', className)}
    >
      {image ? (
        <div className="gb-cta-bg" aria-hidden>
          <div ref={mediaInnerRef} className="gb-cta-bg-parallax">
            <Image
              src={image}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              className="gb-cta-image"
            />
          </div>
          <div className="gb-cta-overlay" />
          <div ref={overlayFxRef} className="gb-cta-fx" aria-hidden>
            <span className="gb-cta-fx-glow gb-cta-fx-glow--a" />
            <span className="gb-cta-fx-glow gb-cta-fx-glow--b" />
            <span className="gb-cta-fx-sheen" />
            <span className="gb-cta-fx-grid" />
          </div>
        </div>
      ) : null}

      <div className="gb-cta-inner">
        <div className="gb-cta-copy">
          {heading ? (
            <h2 data-cta-reveal className="gb-cta-title">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p data-cta-reveal className="gb-cta-desc">
              {description}
            </p>
          ) : null}
          {ctaButton ? (
            <a
              data-cta-reveal
              href={ctaButton.href}
              className={cn('gb-btn-outline', image && 'gb-btn-outline-on-dark')}
            >
              {ctaButton.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default CTASection;
