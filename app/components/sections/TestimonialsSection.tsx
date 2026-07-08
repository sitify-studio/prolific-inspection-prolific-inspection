'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type TestimonialItem = {
  name: string;
  role: string;
  text: string;
  company: string;
  rating: number;
};

function mapTestimonials(
  section?: Page['testimonialsSection'],
  siteTestimonials?: { title?: string; description?: string; testimonials: unknown[] } | null
): TestimonialItem[] {
  const fromSection = section?.testimonials ?? [];
  const source =
    fromSection.length > 0 ? fromSection : (siteTestimonials?.testimonials ?? []);

  const items: TestimonialItem[] = [];

  for (const item of source) {
    const record = item as {
      name?: string;
      role?: string;
      company?: string;
      text?: unknown;
      content?: unknown;
      rating?: number;
    };
    const text = tiptapToText(record.text) || tiptapToText(record.content);
    const name = record.name?.trim() || '';
    const role = record.role?.trim() || '';
    const company = record.company?.trim() || '';
    if (!text && !name) continue;

    items.push({
      text,
      name,
      role,
      company,
      rating: typeof record.rating === 'number' ? record.rating : 5,
    });
  }

  return items;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="hg-testimonials-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn('hg-testimonials-star', i < rating && 'is-filled')}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SatisfactionBadge({
  percent,
  subline,
}: {
  percent: number;
  subline: string;
}) {
  return (
    <div className="hg-satisfaction-badge" aria-hidden>
      <svg className="hg-satisfaction-badge-svg" viewBox="0 0 200 200" role="presentation">
        <defs>
          <radialGradient id="hg-badge-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--wb-primary) 18%, #f0c14b)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--wb-primary) 42%, #c9a227)" />
          </radialGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <polygon
              key={i}
              points="100,18 108,42 100,50 92,42"
              fill="url(#hg-badge-fill)"
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}
        <circle cx="100" cy="100" r="62" fill="url(#hg-badge-fill)" />
        <circle
          cx="100"
          cy="100"
          r="58"
          fill="none"
          stroke="color-mix(in srgb, var(--wb-text-main) 35%, transparent)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="hg-satisfaction-badge-content">
        <span className="hg-satisfaction-badge-label">Satisfaction Rating</span>
        <span className="hg-satisfaction-badge-percent">{percent}%</span>
        <span className="hg-satisfaction-badge-sub">{subline}</span>
        <div className="hg-satisfaction-badge-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({
  testimonialsSection,
  className,
}: TestimonialsSectionProps) {
  const { testimonials: siteTestimonials } = useWebBuilder();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = useMemo(
    () => mapTestimonials(testimonialsSection, siteTestimonials),
    [testimonialsSection, siteTestimonials]
  );

  const sectionDescription = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.description);
    if (fromSection?.trim()) return fromSection.trim();
    return siteTestimonials?.description?.trim() || '';
  }, [testimonialsSection?.description, siteTestimonials?.description]);

  const satisfactionPercent = useMemo(() => {
    if (!testimonials.length) return 96;
    const avg =
      testimonials.reduce((sum, t) => sum + Math.min(Math.max(t.rating, 0), 5), 0) /
      testimonials.length;
    return Math.round((avg / 5) * 100);
  }, [testimonials]);

  useEffect(() => {
    if (activeIndex >= testimonials.length) setActiveIndex(0);
  }, [activeIndex, testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonialsSection?.enabled === false) return null;
  if (!testimonials.length) return null;

  const current = testimonials[activeIndex];

  return (
    <section id="testimonials" className={cn('hg-testimonials-section', className)}>
      <span className="hg-testimonials-deco hg-testimonials-deco-open" aria-hidden>
        &ldquo;
      </span>
      <span className="hg-testimonials-deco hg-testimonials-deco-close" aria-hidden>
        &rdquo;
      </span>

      <div className="container mx-auto px-4 lg:px-8 relative z-[1]">
        <div className="hg-testimonials-layout">
          <div className="hg-testimonials-main">
            <StarRating rating={current.rating} />

            <blockquote className="hg-testimonials-quote">
              &ldquo;{current.text}&rdquo;
            </blockquote>

            <cite className="hg-testimonials-author">&ndash; {current.name}</cite>

            {testimonials.length > 1 && (
              <div className="hg-testimonials-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show testimonial ${index + 1}`}
                    aria-current={index === activeIndex}
                    onClick={() => setActiveIndex(index)}
                    className={cn('hg-testimonials-dot', index === activeIndex && 'is-active')}
                  />
                ))}
              </div>
            )}
          </div>

          <SatisfactionBadge
            percent={satisfactionPercent}
            subline={sectionDescription || `${testimonials.length}+ reviews shared!`}
          />
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
