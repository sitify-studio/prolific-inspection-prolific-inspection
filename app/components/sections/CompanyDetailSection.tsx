'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

const DEFAULT_VIDEO_URL = 'https://www.facebook.com/share/r/1BYdeUdvKK/';

const DEFAULT_TITLE =
  'California Termite, Home, Roof, Sewer Lateral, Pool Inspections, & Natural Hazard Disclosures';

const DEFAULT_DESCRIPTION =
  'HomeGuard Incorporated is a family of companies that have been serving the real estate transaction process in California since 1989. We offer a wide range of services including termite, home, roof, sewer lateral, pool inspections, and natural hazard disclosures. Our experienced professionals are dedicated to providing thorough, reliable inspections that help protect your investment.';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type SocialPlatform = 'facebook' | 'instagram' | 'X' | 'youtube' | 'linkedin';

const VIDEO_SOCIAL_ORDER: SocialPlatform[] = ['facebook', 'X', 'youtube', 'linkedin', 'instagram'];

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M13.5 4H16V1h-3c-2.8 0-4.5 1.7-4.5 4.6V10H6v3h2.5v9H12v-9h2.7l.5-3H12V5.4c0-.9.3-1.4 1.5-1.4z"
          />
        </svg>
      );
    case 'X':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M17.3 3H20l-6.2 7.1L21 21h-5.9l-4.6-5.9L5.4 21H2.7l6.7-7.7L3 3h6l4.2 5.5L17.3 3zm-2.1 16.2h1.6L8.9 4.8H7.2l8 14.4z"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C17.7 5 12 5 12 5s-5.7 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C6.3 19 12 19 12 19s5.7 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M6.5 8.7H3.4V20h3.1V8.7zM5 3a1.8 1.8 0 100 3.6A1.8 1.8 0 005 3zm4.2 5.7H6.1V20h3.1v-5.6c0-1.3.3-2.7 2-2.7 1.7 0 1.7 1.6 1.7 2.8V20h3.1v-6c0-3-1.6-4.4-3.9-4.4-1.8 0-2.6 1-3 1.7l-.1-1.2z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"
          />
        </svg>
      );
  }
}

const CERTIFICATIONS = [
  { id: 'spcb', label: 'SPCB Structural Pest Control Board', Logo: SpcbLogo },
  { id: 'ashi', label: 'ASHI American Society of Home Inspectors', Logo: AshiLogo },
  { id: 'cslb', label: 'California Contractors State License Board', Logo: CslbLogo },
  { id: 'car', label: 'California Association of Realtors', Logo: CarLogo },
  { id: 'nassco', label: 'NASSCO National Association of Sewer Service Companies', Logo: NasscoLogo },
] as const;

function SpcbLogo() {
  return (
    <svg viewBox="0 0 180 72" className="hg-cert-logo-svg" role="img" aria-label="SPCB">
      <path
        d="M28 52V28c0-8 6-14 14-14h20c8 0 14 6 14 14v24"
        fill="none"
        stroke="#5ba4d9"
        strokeWidth="3"
      />
      <path d="M18 52h80" stroke="#5ba4d9" strokeWidth="3" />
      <path d="M48 38h12v14H48z" fill="#5ba4d9" />
      <text x="96" y="34" fill="#5ba4d9" fontSize="28" fontWeight="700" fontFamily="Arial, sans-serif">
        SPCB
      </text>
      <text x="96" y="50" fill="#5ba4d9" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif">
        STRUCTURAL PEST CONTROL BOARD
      </text>
    </svg>
  );
}

function AshiLogo() {
  return (
    <svg viewBox="0 0 120 120" className="hg-cert-logo-svg hg-cert-logo-seal" role="img" aria-label="ASHI">
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * 360) / 20;
        return (
          <polygon
            key={i}
            points="60,8 66,24 60,30 54,24"
            fill="#c9a227"
            transform={`rotate(${angle} 60 60)`}
          />
        );
      })}
      <circle cx="60" cy="60" r="38" fill="#f4e4b0" stroke="#c9a227" strokeWidth="2" />
      <text x="60" y="58" textAnchor="middle" fill="#111" fontSize="22" fontWeight="700" fontFamily="Arial, sans-serif">
        ASHI
      </text>
      <text x="60" y="72" textAnchor="middle" fill="#111" fontSize="5.5" fontWeight="600" fontFamily="Arial, sans-serif">
        AMERICAN SOCIETY
      </text>
      <text x="60" y="79" textAnchor="middle" fill="#111" fontSize="5.5" fontWeight="600" fontFamily="Arial, sans-serif">
        OF HOME INSPECTORS
      </text>
    </svg>
  );
}

function CslbLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="CSLB">
      <path d="M8 52V24l28-12 28 12v28H8z" fill="#1f5fa8" />
      <text x="22" y="34" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif">
        CSLB
      </text>
      <rect x="18" y="38" width="8" height="8" fill="#fff" opacity="0.85" />
      <rect x="30" y="38" width="8" height="8" fill="#fff" opacity="0.85" />
      <text x="72" y="28" fill="#111" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
        CALIFORNIA CONTRACTORS
      </text>
      <text x="72" y="42" fill="#111" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
        STATE LICENSE BOARD
      </text>
      <text x="72" y="58" fill="#111" fontSize="10" fontFamily="Arial, sans-serif">
        www.cslb.ca.gov
      </text>
    </svg>
  );
}

function CarLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="California Association of Realtors">
      <polygon points="20,12 44,36 20,60 44,60 44,12" fill="#111" />
      <path
        d="M26 24c6-4 14-4 20 0 4 3 6 7 6 12s-2 9-6 12c-6 4-14 4-20 0"
        fill="#fff"
        opacity="0.9"
      />
      <text x="56" y="34" fill="#111" fontSize="12" fontWeight="700" fontFamily="Georgia, serif">
        CALIFORNIA ASSOCIATION
      </text>
      <text x="56" y="50" fill="#111" fontSize="12" fontWeight="700" fontFamily="Georgia, serif">
        OF REALTORS®
      </text>
    </svg>
  );
}

function NasscoLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="NASSCO">
      <circle cx="30" cy="36" r="22" fill="#1a3f7a" />
      <text x="30" y="43" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700" fontFamily="Arial, sans-serif">
        N
      </text>
      <text x="62" y="34" fill="#1a3f7a" fontSize="24" fontWeight="800" fontFamily="Arial, sans-serif">
        NASSCO
      </text>
      <text x="62" y="50" fill="#1a3f7a" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">
        NATIONAL ASSOCIATION OF SEWER
      </text>
      <text x="62" y="60" fill="#1a3f7a" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">
        SERVICE COMPANIES
      </text>
    </svg>
  );
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const { site } = useWebBuilder();
  const phoneNumber = site?.business?.phone?.trim() || '';

  const videoUrl = DEFAULT_VIDEO_URL;

  const title = useMemo(
    () => tiptapToText(companyDetailSection?.title) || DEFAULT_TITLE,
    [companyDetailSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description) || DEFAULT_DESCRIPTION,
    [companyDetailSection?.description]
  );

  const socialLinks = useMemo(() => {
    const links = site?.socialLinks ?? [];
    return VIDEO_SOCIAL_ORDER.map((platform) =>
      links.find((link) => link.platform === platform && link.url?.trim())
    ).filter((link): link is { platform: SocialPlatform; url: string } => Boolean(link));
  }, [site?.socialLinks]);

  if (companyDetailSection?.enabled === false) return null;

  return (
    <section id="company-details" className={cn('hg-section hg-company-detail-section', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="hg-company-detail-grid">
          <div className="hg-company-detail-media">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hg-company-video-frame hg-company-video-thumb-link"
              aria-label="Watch on Facebook"
            >
              <Image
                src="/fb.png"
                alt="Prolific Inspections Facebook reel"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </a>

            {socialLinks.length > 0 && (
              <div className="hg-company-video-socials">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hg-company-video-social-link"
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="hg-company-detail-content">
            <h2 className="hg-company-detail-title">{title}</h2>
            <p className="hg-company-detail-desc">{description}</p>

            {phoneNumber && (
              <p className="hg-company-detail-cta">
                Schedule an Appointment{' '}
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hg-company-detail-phone">
                  ({phoneNumber})
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="hg-company-detail-certs">
          <h3 className="hg-certifications-title">Certifications, Licensing &amp; Memberships</h3>
          <div className="hg-certifications-logos">
            {CERTIFICATIONS.map(({ id, label, Logo }) => (
              <div key={id} className="hg-certifications-logo-item" title={label}>
                <Logo />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
