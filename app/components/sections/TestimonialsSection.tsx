'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getTestimonialsNavItem } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
  /** Cap cards on compact surfaces (homepage). Omit/undefined shows all. */
  limit?: number;
  showViewAllLink?: boolean;
}

type TestimonialItem = {
  name: string;
  role: string;
  text: string;
  company: string;
  rating: number;
  avatarUrl: string;
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
      avatar?: string;
    };
    const text = tiptapToText(record.text) || tiptapToText(record.content);
    const name = record.name?.trim() || '';
    const role = record.role?.trim() || '';
    const company = record.company?.trim() || '';
    const avatarUrl = record.avatar?.trim() ? getImageSrc(record.avatar) : '';
    const rating =
      typeof record.rating === 'number' && record.rating > 0
        ? Math.min(5, Math.round(record.rating))
        : 5;
    if (!text && !name) continue;

    items.push({ text, name, role, company, rating, avatarUrl });
  }

  return items;
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" className={className} aria-hidden fill="currentColor">
      <path d="M0 14.2C0 6.8 5.1 1.2 12.2 0L14 4.1C9.5 5.5 7.2 8.4 7.2 12.1c1.5-.7 3.2-1 5-1 4.7 0 8 3.1 8 8.1S17 27.4 12.1 27.4C5.3 27.4 0 22.1 0 14.2zm18 0C18 6.8 23.1 1.2 30.2 0L32 4.1c-4.5 1.4-6.8 4.3-6.8 8 1.5-.7 3.2-1 5-1 4.7 0 8 3.1 8 8.1s-3.3 8.2-8.2 8.2C23.3 27.4 18 22.1 18 14.2z" />
    </svg>
  );
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('gb-stories-stars', className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn('gb-stories-star', i < rating && 'is-filled')}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 13.8 5.2 16.4l.9-5.4L2.2 7.2l5.4-.8L10 1.5z"
          />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection({
  testimonialsSection,
  className,
  limit,
  showViewAllLink = false,
}: TestimonialsSectionProps) {
  const { testimonials: siteTestimonials, pages } = useWebBuilder();

  const title = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.title);
    if (fromSection) return fromSection;
    return siteTestimonials?.title?.trim() || '';
  }, [testimonialsSection?.title, siteTestimonials?.title]);

  const description = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.description);
    if (fromSection) return fromSection;
    return siteTestimonials?.description?.trim() || '';
  }, [testimonialsSection?.description, siteTestimonials?.description]);

  const allTestimonials = useMemo(
    () => mapTestimonials(testimonialsSection, siteTestimonials),
    [testimonialsSection, siteTestimonials]
  );

  const visibleTestimonials = useMemo(() => {
    if (typeof limit === 'number' && limit > 0) {
      return allTestimonials.slice(0, limit);
    }
    return allTestimonials;
  }, [allTestimonials, limit]);

  const remainingCount = Math.max(0, allTestimonials.length - visibleTestimonials.length);
  const badgeLabel = useMemo(() => getTestimonialsNavItem(pages).name, [pages]);

  const summary = useMemo(() => {
    const count = allTestimonials.length;
    if (!count) return null;
    const total = allTestimonials.reduce((sum, item) => sum + item.rating, 0);
    const average = Math.round((total / count) * 10) / 10;
    return { count, average };
  }, [allTestimonials]);

  if (testimonialsSection?.enabled === false) return null;
  if (!visibleTestimonials.length) return null;

  const showSeeMore = showViewAllLink && remainingCount > 0;

  return (
    <section id="testimonials" className={cn('gb-stories-section', className)}>
      <div className="gb-container">
        <header className="gb-stories-head">
          <span className="gb-stories-badge">{badgeLabel}</span>
          {title ? <h2 className="gb-stories-heading">{title}</h2> : null}
          {description ? <p className="gb-stories-subhead">{description}</p> : null}
        </header>

        <ul className="gb-stories-grid">
          {visibleTestimonials.map((item, index) => {
            const isDark = index === 3 && visibleTestimonials.length > 1;
            const roleLine = [item.role, item.company].filter(Boolean).join(', ');

            return (
              <li
                key={`${item.name}-${index}`}
                className={cn('gb-stories-card', isDark && 'gb-stories-card--dark')}
              >
                <QuoteMark className="gb-stories-quote-icon" />
                {item.text ? <p className="gb-stories-quote">{item.text}</p> : null}
                <div className="gb-stories-meta">
                  <span className="gb-stories-avatar" aria-hidden>
                    {item.avatarUrl ? (
                      <Image
                        src={item.avatarUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      (item.name || '?').charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="gb-stories-author">
                    {item.name ? <p className="gb-stories-name">{item.name}</p> : null}
                    {roleLine ? <p className="gb-stories-role">{roleLine}</p> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {(summary || showSeeMore) ? (
          <div className="gb-stories-footer">
            {summary ? (
              <p className="gb-stories-footer-count">
                {summary.count} {summary.count === 1 ? 'client review' : 'client reviews'}
              </p>
            ) : (
              <span />
            )}

            {summary ? (
              <div className="gb-stories-footer-rating">
                <Stars rating={Math.round(summary.average)} />
                <div>
                  <span className="gb-stories-footer-score">{summary.average.toFixed(1)}</span>
                  <span className="gb-stories-footer-based">
                    Based on {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
            ) : (
              <span />
            )}

            {showSeeMore ? (
              <Link href="/testimonials" className="gb-stories-footer-link">
                See remaining reviews
                <svg viewBox="0 0 16 16" aria-hidden fill="none">
                  <path
                    d="M4.5 11.5L11.5 4.5M6 4.5h5.5V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <span />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default TestimonialsSection;
