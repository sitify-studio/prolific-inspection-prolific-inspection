'use client';

import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { IMAGE_SIZES } from '@/app/lib/imageDefaults';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc } from '@/app/lib/utils';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page | null;
  className?: string;
  title?: string;
  description?: string;
  features?: string[];
  ctaButton?: { href: string; label: string };
  image?: string;
}

function isCmsUploadUrl(src: string): boolean {
  return /\/uploads\//i.test(src);
}

function resolveAboutCta(
  page: Page | null | undefined,
  site: ReturnType<typeof useWebBuilder>['site'],
  pages: Page[] | undefined
): { href: string; label: string } | null {
  const primary = resolvePrimaryCta(page, site, pages);
  if (primary) return primary;

  const aboutPage = pages?.find((p) => p.pageType === 'about');
  if (aboutPage?.name?.trim()) {
    return { label: 'Learn More', href: getPageHref(aboutPage) };
  }

  const contactPage = pages?.find((p) => p.pageType === 'contact');
  if (contactPage) {
    return { label: 'Contact Us', href: getPageHref(contactPage) };
  }

  return { href: '#contact', label: 'Contact Us' };
}

export function AboutSection({
  aboutSection,
  page,
  className,
  title: titleOverride,
  description: descriptionOverride,
  features: featuresOverride,
  ctaButton: ctaOverride,
  image: imageOverride,
}: AboutSectionProps) {
  const { site, pages } = useWebBuilder();
  const phoneNumber = site?.business?.phone?.trim() || '';

  const title = useMemo(
    () =>
      titleOverride ||
      tiptapToText(aboutSection?.title) ||
      'Through Our Work, Beyond Your Expectations',
    [titleOverride, aboutSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(aboutSection?.description) ||
      'Specializing in professional inspections that deliver thorough results and lasting peace of mind for every property we serve.',
    [descriptionOverride, aboutSection?.description]
  );

  const features = useMemo(() => {
    if (featuresOverride?.length) return featuresOverride;
    return (aboutSection?.features ?? [])
      .map((feature) => feature.label?.trim() || tiptapToText(feature.description))
      .filter(Boolean);
  }, [featuresOverride, aboutSection?.features]);

  const ctaButton = useMemo(
    () => ctaOverride || resolveAboutCta(page, site, pages),
    [ctaOverride, page, site, pages]
  );

  const aboutImage = useMemo(() => {
    if (imageOverride) return imageOverride;
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : undefined;
  }, [imageOverride, aboutSection?.image?.url]);

  if (aboutSection?.enabled === false) return null;

  return (
    <section id="about" className={cn('hg-section wb-surface-page', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {aboutImage && (
            <div className="relative aspect-[4/3] rounded overflow-hidden border border-[var(--color-gray-200)]">
              <OptimizedImage
                src={aboutImage}
                alt={aboutSection?.image?.altText || title || 'About Us'}
                fill
                className="object-cover"
                priority
                quality={90}
                sizes={IMAGE_SIZES.aboutSplit}
                unoptimized={isCmsUploadUrl(aboutImage)}
              />
            </div>
          )}

          <div className="hg-company-block">
            <h2>{title}</h2>
            <p className="text-[var(--wb-text-secondary)] leading-relaxed mb-6">{description}</p>

            {features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--wb-text-main)]">
                    <span className="text-[var(--wb-primary)] font-bold mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {phoneNumber && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--wb-text-secondary)] mb-1">
                    Schedule an Appointment
                  </p>
                  <a
                    href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                    className="hg-phone-link text-lg"
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
      </div>
    </section>
  );
}

export default AboutSection;
