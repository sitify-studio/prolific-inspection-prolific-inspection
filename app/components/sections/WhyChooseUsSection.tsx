'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

type AppStoreCard = {
  id: string;
  label: string;
  platform: 'android' | 'iphone';
  href?: string;
};

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/4063856/pexels-photo-4063856.jpeg?auto=compress&cs=tinysrgb&w=1200';

const DEFAULT_DESCRIPTION =
  'Schedule inspections, reschedule inspections, cancel inspections, view service area maps, view reports, view the amount due, live chat with Customer Care, and edit your personal information.';

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="currentColor"
        d="M17.6 11.5l1.5-2.6a.7.7 0 00-1.2-.7l-1.6 2.8a8.9 8.9 0 00-7.6 0L7.1 8.2a.7.7 0 00-1.2.7l1.5 2.6A7.1 7.1 0 004 18.2h16a7.1 7.1 0 00-3.6-6.7zM8.5 16.4a.9.9 0 110-1.8.9.9 0 010 1.8zm7 0a.9.9 0 110-1.8.9.9 0 010 1.8z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="currentColor"
        d="M16.7 13.1c-.1-2.2 1.8-3.3 1.9-3.4-1-.1-2-.6-2.6-1.4-.6-.8-1-1.9-.9-3 1-.1 2 .6 2.5 1.4.5-.9 1.4-1.5 2.4-1.5.1 1-.3 2-.9 2.8 1.6 1 2.7 2.5 2.4 4.8-.2 1.9-1.1 3.9-2.5 5.3-.9.9-2 1.9-3.4 1.9-1.3 0-1.7-.8-3.2-.8s-1.9.8-3.1.8c-1.3 0-2.3-.9-3.2-1.9-2.2-2.4-3.9-6.8-1.6-9.8 1.1-1.6 3.1-2.6 5.2-2.6zM14.9 4.8c.7-.9 1.2-2.1 1.1-3.3-1.1.1-2.4.7-3.1 1.6-.7.8-1.2 2-1 3.2 1.2.1 2.4-.6 3-1.5z"
      />
    </svg>
  );
}

function QrPlaceholder({ label, href }: { label: string; href?: string }) {
  const content = (
    <div className="hg-download-app-qr" aria-hidden={!href}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <rect width="120" height="120" fill="#fff" />
        <rect x="8" y="8" width="28" height="28" fill="#111" />
        <rect x="84" y="8" width="28" height="28" fill="#111" />
        <rect x="8" y="84" width="28" height="28" fill="#111" />
        <rect x="14" y="14" width="16" height="16" fill="#fff" />
        <rect x="90" y="14" width="16" height="16" fill="#fff" />
        <rect x="14" y="90" width="16" height="16" fill="#fff" />
        <rect x="44" y="12" width="8" height="8" fill="#111" />
        <rect x="56" y="12" width="8" height="8" fill="#111" />
        <rect x="44" y="24" width="8" height="8" fill="#111" />
        <rect x="68" y="24" width="8" height="8" fill="#111" />
        <rect x="44" y="44" width="32" height="32" fill="#fff" stroke="#111" strokeWidth="4" />
        <text x="60" y="66" textAnchor="middle" fill="#111" fontSize="8" fontWeight="700">
          APP
        </text>
        <rect x="12" y="44" width="8" height="8" fill="#111" />
        <rect x="24" y="56" width="8" height="8" fill="#111" />
        <rect x="84" y="44" width="8" height="8" fill="#111" />
        <rect x="96" y="56" width="8" height="8" fill="#111" />
        <rect x="44" y="84" width="8" height="8" fill="#111" />
        <rect x="56" y="96" width="8" height="8" fill="#111" />
        <rect x="68" y="84" width="8" height="8" fill="#111" />
        <rect x="92" y="84" width="8" height="8" fill="#111" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hg-download-app-qr-link">
        {content}
      </a>
    );
  }

  return content;
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const { site } = useWebBuilder();
  const brandName = getBrandName(site) || 'HomeGuard';

  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || 'Download the App',
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description) || DEFAULT_DESCRIPTION,
    [whyChooseUsSection?.description]
  );

  const appStores = useMemo((): AppStoreCard[] => {
    const items = whyChooseUsSection?.items ?? [];
    const platforms: Array<'android' | 'iphone'> = ['android', 'iphone'];

    return platforms.map((platform, index) => {
      const item = items[index];
      const itemTitle = tiptapToText(item?.title);
      const itemDescription = tiptapToText(item?.description);
      const defaultLabel =
        platform === 'android' ? `${brandName} Android App` : `${brandName} iPhone App`;

      return {
        id: platform,
        platform,
        label: itemTitle || defaultLabel,
        href: itemDescription && isUrl(itemDescription) ? itemDescription.trim() : undefined,
      };
    });
  }, [whyChooseUsSection?.items, brandName]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;

  return (
    <section id="why-choose-us" className={cn('hg-download-app-section', className)}>
      <div className="hg-download-app-grid">
        <div className="hg-download-app-media">
          <Image
            src={DEFAULT_IMAGE}
            alt="Download our inspection app"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={false}
          />
        </div>

        <div className="hg-download-app-panel">
          <div className="hg-download-app-panel-inner">
            <h2 className="hg-download-app-title">{title}</h2>
            <p className="hg-download-app-desc">{description}</p>

            <div className="hg-download-app-stores">
              {appStores.map((store) => (
                <div key={store.id} className="hg-download-app-store">
                  {store.platform === 'android' ? <AndroidIcon /> : <AppleIcon />}
                  <p className="hg-download-app-store-label">{store.label}</p>
                  <QrPlaceholder label={store.label} href={store.href} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
