'use client';

import { useEffect } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { ensureGsapScroll, gsap, refreshScrollLayout } from '@/app/lib/gsap-scroll';

const SECTION_SELECTOR =
  'main section:not(#cta):not(#contact), main .hg-section:not(#cta):not(#contact), main .hg-testimonials-section, main .hg-download-app-section';

const TEXT_REVEAL_SELECTOR = [
  '.hg-section-title',
  '.hg-services-title',
  '.hg-company-detail-title',
  '.hg-certifications-title',
  '.hg-download-app-title',
  '.hg-company-block h2',
  '.hg-company-block > p',
  '.hg-company-block h4',
  '.hg-section-desc',
  '.hg-company-detail-desc',
  '.hg-company-detail-cta',
  '.hg-download-app-desc',
  '.hg-testimonials-quote',
  '.hg-testimonials-author',
  '.hg-hero-subtitle',
  '#about li',
  '.hg-contact-info-title',
  '.hg-contact-info-label',
  '.hg-contact-hours-day',
  '.hg-contact-hours-time',
].join(', ');

const BLOCK_REVEAL_SELECTOR = [
  '.hg-service-card',
  '.hg-faq-item',
  '.hg-company-detail-grid > *',
  '.hg-download-app-media',
  '.hg-download-app-store',
  '.hg-testimonials-main',
  '.hg-satisfaction-badge',
  '.hg-company-detail-certs',
  '#about [class*="aspect-"]',
  '.hg-contact-map-side',
  '#gallery button',
  '#projects article',
].join(', ');

export function SectionScrollAnimations() {
  const { loading, pages, services, blogPosts, projects } = useWebBuilder();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || loading) return;

    ensureGsapScroll();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
        const sectionContent =
          section.querySelector<HTMLElement>('.container, .hg-download-app-grid') ?? section;

        gsap.fromTo(
          sectionContent,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );

        const textElements = section.querySelectorAll<HTMLElement>(TEXT_REVEAL_SELECTOR);
        if (textElements.length) {
          gsap.fromTo(
            textElements,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        const blockElements = section.querySelectorAll<HTMLElement>(BLOCK_REVEAL_SELECTOR);
        if (blockElements.length) {
          gsap.fromTo(
            blockElements,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    });

    refreshScrollLayout();

    return () => ctx.revert();
  }, [loading, reducedMotion, pages.length, services.length, blogPosts.length, projects.length]);

  return null;
}
