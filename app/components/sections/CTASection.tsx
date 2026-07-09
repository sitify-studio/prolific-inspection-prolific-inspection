'use client';

import { useEffect, useMemo, useRef } from 'react';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
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
  subHeading?: string;
  heading?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
}

const DEFAULT_CTA_IMAGE =
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600';

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function isCmsUploadUrl(src: string): boolean {
  return /\/uploads\//i.test(src);
}

export function CTASection({
  ctaSection,
  className,
  heading: headingOverride,
  description: descriptionOverride,
  ctaButton: ctaOverride,
  backgroundImage: backgroundImageOverride,
}: CTASectionProps) {
  const { site, pages } = useWebBuilder();
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const phoneNumber = site?.business?.phone?.trim() || '';

  const heading = useMemo(
    () =>
      headingOverride ||
      tiptapToText(ctaSection?.title) ||
      'Professional Inspections You Can Trust',
    [headingOverride, ctaSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(ctaSection?.description) ||
      'With extensive knowledge and years of professional experience, we guarantee a better understanding of your inspection needs. The best proof of our customer satisfaction is the fact that so many of them stay with us and refer us to their families, friends, and associates.',
    [descriptionOverride, ctaSection?.description]
  );

  const ctaButton = useMemo(() => {
    if (ctaOverride) return ctaOverride;
    const label = ctaSection?.primaryButton?.label?.trim();
    const href = ctaSection?.primaryButton?.href?.trim();
    if (label && href) return { label, href: normalizeHref(href) };
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return {
      label: label || 'Contact Us',
      href: contactPage ? getPageHref(contactPage) : '/contact-us',
    };
  }, [ctaOverride, ctaSection?.primaryButton, pages]);

  const ctaImage = useMemo(() => {
    if (backgroundImageOverride) return backgroundImageOverride;
    const bg = ctaSection?.backgroundImage;
    if (typeof bg === 'string' && bg.trim()) return getImageSrc(bg);
    const legacyImage = (ctaSection as { image?: { url?: string } } | undefined)?.image?.url;
    if (legacyImage?.trim()) return getImageSrc(legacyImage);
    return DEFAULT_CTA_IMAGE;
  }, [backgroundImageOverride, ctaSection]);

  const customBg = ctaSection?.backgroundColor?.trim();

  useEffect(() => {
    if (!sectionRef.current || ctaSection?.enabled === false) return;
    ensureGsapScroll();

    if (reducedMotion) {
      sectionRef.current.querySelectorAll('[data-cta-reveal]').forEach((el) => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
      if (bgRef.current) gsap.set(bgRef.current, { yPercent: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current!.querySelectorAll('[data-cta-reveal]'),
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -18, scale: 1.18 },
          {
            yPercent: 18,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [ctaSection?.enabled, reducedMotion, ctaImage]);

  if (ctaSection?.enabled === false) return null;

  return (
    <section
      ref={sectionRef}
      id="cta"
      className={cn('hg-cta-section', className)}
      style={customBg ? { backgroundColor: customBg } : undefined}
    >
      <div className="hg-cta-bg" aria-hidden>
        <div ref={bgRef} className="hg-cta-bg-inner">
          <OptimizedImage
            src={ctaImage}
            alt=""
            fill
            className="object-cover"
            quality={IMAGE_QUALITY_HIGH}
            sizes={IMAGE_SIZES.fullWidth}
            unoptimized={isCmsUploadUrl(ctaImage)}
          />
        </div>
        <div className="hg-cta-overlay" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="hg-cta-content mx-auto max-w-3xl text-center">
          <h2 data-cta-reveal>{heading}</h2>
          <p data-cta-reveal className="hg-cta-desc">
            {description}
          </p>

          <div
            data-cta-reveal
            className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
          >
            {phoneNumber && (
              <div>
                <p className="hg-cta-phone-label">Schedule an Appointment</p>
                <a
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className="hg-phone-link text-xl"
                >
                  {phoneNumber}
                </a>
              </div>
            )}
            {ctaButton && (
              <a href={ctaButton.href} className="hg-btn">
                {ctaButton.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
