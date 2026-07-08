'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
  subHeading?: string;
  heading?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export function CTASection({
  ctaSection,
  className,
  heading: headingOverride,
  description: descriptionOverride,
  ctaButton: ctaOverride,
}: CTASectionProps) {
  const { site, pages } = useWebBuilder();
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

  if (ctaSection?.enabled === false) return null;

  return (
    <section id="cta" className={cn('hg-section hg-section-alt', className)}>
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
        <div className="hg-company-block">
          <h2>{heading}</h2>
          <p className="text-[var(--wb-text-secondary)] leading-relaxed mb-8">{description}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {phoneNumber && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--wb-text-main)] mb-1">
                  Schedule an Appointment
                </h4>
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
