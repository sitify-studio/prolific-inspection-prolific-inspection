'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarClock,
  FileClock,
  FileText,
  HeartHandshake,
  Home,
  MessageSquareText,
  Zap,
} from 'lucide-react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

type DisplayItem = {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
};

const DEFAULT_TITLE = 'Why Realtors Choose Prolific';
const DEFAULT_EYEBROW = 'Trusted by Realtors';

const ICON_COLORS = [
  '#2563EB', // blue
  '#059669', // green
  '#EA580C', // orange
  '#7C3AED', // purple
  '#D97706', // amber
  '#0D9488', // teal
  '#E11D48', // rose
  '#4F46E5', // indigo
  '#0891B2', // cyan
  '#C026D3', // fuchsia
] as const;

const REQUIRED_POINTS: Array<{
  title: string;
  match: string[];
  Icon: LucideIcon;
  color: string;
}> = [
  {
    title: 'One Company',
    match: ['one company'],
    Icon: Building2,
    color: ICON_COLORS[0],
  },
  {
    title: 'One Appointment',
    match: ['one appointment'],
    Icon: CalendarCheck,
    color: ICON_COLORS[1],
  },
  {
    title: 'Home, Roof & Termite Inspections',
    match: ['home, roof', 'termite inspection', 'roof & termite'],
    Icon: Home,
    color: ICON_COLORS[2],
  },
  {
    title: 'Reports Delivered Within 24 Hours',
    match: ['24 hours', 'reports delivered'],
    Icon: FileClock,
    color: ICON_COLORS[3],
  },
  {
    title: 'Expedited Reporting Options Available',
    match: ['expedited reporting options'],
    Icon: Zap,
    color: ICON_COLORS[4],
  },
  {
    title: 'Licensed Contractor Insight',
    match: ['licensed contractor', 'contractor insight'],
    Icon: BadgeCheck,
    color: ICON_COLORS[5],
  },
  {
    title: 'Fast Scheduling',
    match: ['fast scheduling'],
    Icon: CalendarClock,
    color: ICON_COLORS[6],
  },
  {
    title: 'Detailed Digital Reports',
    match: ['digital report', 'detailed digital'],
    Icon: FileText,
    color: ICON_COLORS[7],
  },
  {
    title: 'Clear Communication',
    match: ['clear communication', 'communication'],
    Icon: MessageSquareText,
    color: ICON_COLORS[8],
  },
  {
    title: 'Supporting Buyers, Sellers & Agents',
    match: ['supporting buyers', 'buyers, sellers', 'sellers & agents'],
    Icon: HeartHandshake,
    color: ICON_COLORS[9],
  },
];

function resolveIcon(title: string, index: number): { Icon: LucideIcon; color: string } {
  const label = title.toLowerCase();
  const match = REQUIRED_POINTS.find((point) =>
    point.match.some((key) => label.includes(key))
  );
  if (match) return { Icon: match.Icon, color: match.color };
  return {
    Icon: BadgeCheck,
    color: ICON_COLORS[index % ICON_COLORS.length],
  };
}

function matchesRequired(title: string, point: (typeof REQUIRED_POINTS)[number]) {
  const label = title.toLowerCase();
  return point.match.some((key) => label.includes(key));
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const builderTitle = useMemo(
    () => tiptapToText(whyChooseUsSection?.title),
    [whyChooseUsSection?.title]
  );

  const title = builderTitle || DEFAULT_TITLE;

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description),
    [whyChooseUsSection?.description]
  );

  const items = useMemo(() => {
    const fromBuilder = (whyChooseUsSection?.items ?? [])
      .map((item, index) => {
        const itemTitle = tiptapToText(item?.title);
        const itemDesc = tiptapToText(item?.description);
        if (!itemTitle && !itemDesc) return null;
        const resolved = resolveIcon(itemTitle || itemDesc, index);
        return {
          id: `builder-${index}`,
          title: itemTitle,
          description: itemDesc,
          Icon: resolved.Icon,
          color: resolved.color,
        };
      })
      .filter((item): item is DisplayItem => Boolean(item));

    const shouldEnsureRealtorPoints =
      /realtor/i.test(title) || !builderTitle || fromBuilder.length === 0;

    if (!shouldEnsureRealtorPoints) {
      return fromBuilder.map((item, index) => ({
        ...item,
        color: item.color || ICON_COLORS[index % ICON_COLORS.length],
      }));
    }

    const ensured = [...fromBuilder];
    for (const point of REQUIRED_POINTS) {
      const exists = ensured.some((item) => matchesRequired(item.title, point));
      if (!exists) {
        ensured.push({
          id: `required-${point.title}`,
          title: point.title,
          description: '',
          Icon: point.Icon,
          color: point.color,
        });
      }
    }

    return ensured;
  }, [whyChooseUsSection?.items, title, builderTitle]);

  useEffect(() => {
    if (!sectionRef.current || !items.length) return;

    ensureGsapScroll();
    const ctx = gsap.context(() => {
      const head = sectionRef.current!.querySelectorAll('[data-wcu-reveal]');
      const cards = sectionRef.current!.querySelectorAll('[data-wcu-card]');

      if (reducedMotion) {
        gsap.set(head, { opacity: 1, y: 0, x: 0 });
        gsap.set(cards, { opacity: 1, y: 0, x: 0 });
        return;
      }

      gsap.fromTo(
        head,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      );

      gsap.fromTo(
        cards,
        { opacity: 0, x: 28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current!.querySelector('.gb-wcu-grid'),
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [items, reducedMotion, title, description]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;
  if (!title && !description && items.length === 0) return null;

  return (
    <section
      id="why-choose-us"
      ref={sectionRef}
      className={cn('gb-wcu-section', className)}
    >
      <div className="gb-container">
        <div className="gb-wcu-layout">
          <aside className="gb-wcu-copy-col">
            <p data-wcu-reveal className="gb-wcu-eyebrow">
              {DEFAULT_EYEBROW}
            </p>
            {title ? (
              <h2 data-wcu-reveal className="gb-wcu-title">
                {title}
              </h2>
            ) : null}
            <span data-wcu-reveal className="gb-wcu-rule" aria-hidden />
            {description ? (
              <p data-wcu-reveal className="gb-wcu-desc">
                {description}
              </p>
            ) : null}
          </aside>

          {items.length > 0 ? (
            <div className="gb-wcu-grid">
              {items.map((item, index) => {
                const Icon = item.Icon;
                const color = item.color || ICON_COLORS[index % ICON_COLORS.length];
                return (
                  <article
                    key={item.id}
                    data-wcu-card
                    className="gb-wcu-card"
                    style={{ ['--wcu-accent' as string]: color }}
                  >
                    <span
                      className="gb-wcu-icon"
                      aria-hidden
                      style={{
                        color,
                        backgroundColor: `${color}22`,
                        borderColor: color,
                      }}
                    >
                      <Icon strokeWidth={2.25} color={color} />
                    </span>
                    <div className="gb-wcu-card-copy">
                      {item.title ? (
                        <h3 className="gb-wcu-card-title">
                          <span className="gb-wcu-card-title-text">{item.title}</span>
                        </h3>
                      ) : null}
                      {item.description ? (
                        <p className="gb-wcu-card-desc">{item.description}</p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
