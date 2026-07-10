'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

const DEFAULT_TITLE = 'Why Realtors Choose Prolific';

const DEFAULT_DESCRIPTION =
  'Built for real estate transactions—fast scheduling, clear reports, and one trusted partner for Home, Roof, and Termite inspections.';

const DEFAULT_BENEFITS = [
  'One Company',
  'One Appointment',
  'Home, Roof & Termite Inspections',
  'Reports Delivered Within 24 Hours',
  'Expedited Reporting Options Available',
  'Licensed Contractor Insight',
  'Fast Scheduling',
  'Detailed Digital Reports',
  'Clear Communication',
  'Supporting Buyers, Sellers & Agents',
];

type IconKind =
  | 'company'
  | 'appointment'
  | 'inspections'
  | 'reports'
  | 'expedited'
  | 'license'
  | 'schedule'
  | 'digital'
  | 'communication'
  | 'support'
  | 'realtor'
  | 'default';

function resolveIconKind(label: string): IconKind {
  const t = label.toLowerCase();
  if (t.includes('one company') || (t.includes('company') && !t.includes('communication')))
    return 'company';
  if (t.includes('appointment')) return 'appointment';
  if (
    (t.includes('home') && t.includes('roof')) ||
    t.includes('termite') ||
    (t.includes('inspection') && !t.includes('report'))
  )
    return 'inspections';
  if (t.includes('expedited') || t.includes('fast report')) return 'expedited';
  if (t.includes('licensed') || t.includes('contractor') || t.includes('license')) return 'license';
  if (t.includes('schedul')) return 'schedule';
  if (t.includes('digital') || t.includes('detailed')) return 'digital';
  if (t.includes('24') || t.includes('within') || t.includes('report')) return 'reports';
  if (t.includes('communication') || t.includes('clear')) return 'communication';
  if (t.includes('realtor')) return 'realtor';
  if (t.includes('buyer') || t.includes('seller') || t.includes('agent') || t.includes('support'))
    return 'support';
  return 'default';
}

function BenefitIcon({ kind }: { kind: IconKind }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'hg-realtors-benefit-icon',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (kind) {
    case 'company':
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );
    case 'appointment':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'inspections':
      return (
        <svg {...common}>
          <path d="M4 12l8-7 8 7v8H4v-8z" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'expedited':
      return (
        <svg {...common}>
          <path d="M13 3L5 14h6l-1 7 9-12h-6l0-6z" />
        </svg>
      );
    case 'license':
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'schedule':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'digital':
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      );
    case 'communication':
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 3V5z" />
        </svg>
      );
    case 'support':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 19c1.5-3 4-4.5 6-4.5S13.5 16 15 19" />
          <path d="M15 19c.8-1.8 2.2-2.8 4-2.8 1 0 1.8.3 2.5.8" />
        </svg>
      );
    case 'realtor':
      return (
        <svg {...common}>
          <path d="M4 20V10l8-6 8 6v10" />
          <path d="M10 20v-6h4v6" />
          <path d="M8 12h2M14 12h2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
  }
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || DEFAULT_TITLE,
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description) || DEFAULT_DESCRIPTION,
    [whyChooseUsSection?.description]
  );

  const benefits = useMemo(() => {
    const fromCms = (whyChooseUsSection?.items ?? [])
      .map((item) => tiptapToText(item?.title) || tiptapToText(item?.description))
      .filter(Boolean);

    const seen = new Set(DEFAULT_BENEFITS.map((b) => b.toLowerCase()));
    const extras = fromCms.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return [...DEFAULT_BENEFITS, ...extras];
  }, [whyChooseUsSection?.items]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;

  return (
    <section id="why-choose-us" className={cn('hg-realtors-section', className)}>
      <div className="hg-realtors-shell">
        <div className="hg-realtors-intro">
          <p className="hg-realtors-eyebrow">Trusted by Realtors</p>
          <h2 className="hg-realtors-title">
            <span className="hg-realtors-title-text">{title}</span>
          </h2>
          <div className="hg-realtors-rule" aria-hidden />
          <p className="hg-realtors-desc">{description}</p>
        </div>

        <ul className="hg-realtors-grid">
          {benefits.map((benefit) => {
            const iconKind = resolveIconKind(benefit);
            return (
              <li key={benefit} className="hg-realtors-item">
                <div className="hg-realtors-card">
                  <span className="hg-realtors-check" aria-hidden>
                    <BenefitIcon kind={iconKind} />
                  </span>
                  <span className="hg-realtors-item-text">{benefit}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
