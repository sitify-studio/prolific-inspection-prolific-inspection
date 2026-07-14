'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page | null;
  className?: string;
}

export function AboutSection({ aboutSection, page, className }: AboutSectionProps) {
  const { pages } = useWebBuilder();
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => tiptapToText(aboutSection?.title), [aboutSection?.title]);
  const description = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );

  const eyebrow = useMemo(() => {
    const first = aboutSection?.features?.[0];
    if (!first) return '';
    return first.label?.trim() || tiptapToText(first.description);
  }, [aboutSection?.features]);

  const aboutImage = useMemo(() => {
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : '';
  }, [aboutSection?.image?.url]);

  const ctaButton = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    if (!contactPage?.name?.trim()) return null;
    return { label: contactPage.name.trim(), href: getPageHref(contactPage) };
  }, [pages]);

  useEffect(() => {
    if (!aboutImage || !sectionRef.current || !revealRef.current || !mediaRef.current) return;

    ensureGsapScroll();
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(revealRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
        });
        return;
      }

      // Soft wipe + rise (no 3D flip)
      gsap.fromTo(
        revealRef.current,
        {
          opacity: 0.2,
          y: 52,
          scale: 1.07,
          clipPath: 'inset(14% 10% 18% 10%)',
        },
        {
          opacity: 1,
          y: -18,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [aboutImage, reducedMotion]);

  if (aboutSection?.enabled === false) return null;
  if (!title && !description && !aboutImage) return null;

  return (
    <section
      ref={sectionRef}
      id="about"
      className={cn('gb-about', !aboutImage && 'gb-about--no-media', className)}
    >
      <div className="gb-about-track">
        <div className="gb-about-sticky">
          <div className="gb-about-copy">
            {eyebrow ? <p className="gb-about-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="gb-about-title">{title}</h2> : null}
            {description ? <p className="gb-about-desc">{description}</p> : null}
            {ctaButton ? (
              <a href={ctaButton.href} className="gb-btn-outline">
                {ctaButton.label}
              </a>
            ) : null}
          </div>

          {aboutImage ? (
            <div ref={mediaRef} className="gb-about-media">
              <div ref={revealRef} className="gb-about-reveal">
                <Image
                  src={aboutImage}
                  alt={aboutSection?.image?.altText || title || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  quality={90}
                  className="gb-about-image"
                />
              </div>
            </div>
          ) : null}
        </div>

        {aboutImage ? (
          <div className="gb-about-frame" aria-hidden>
            <div className="gb-about-border gb-about-border--top" />
            <div className="gb-about-border gb-about-border--bottom" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AboutSection;
