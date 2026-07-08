'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName, getFooterNavLinks, getPageHref } from '@/app/lib/siteContent';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

type SocialPlatform = 'facebook' | 'instagram' | 'X' | 'youtube' | 'linkedin';

const FOOTER_SOCIAL_ORDER: SocialPlatform[] = ['facebook', 'instagram', 'X', 'youtube', 'linkedin'];

const BRAND_BOOSTER_URL = 'https://usbrandbooster.com/';

function extractContractorLicense(site: ReturnType<typeof useWebBuilder>['site']): string | null {
  const sources = [
    tiptapToText(site?.footer?.description),
    tiptapToText(site?.footer?.copyright),
    site?.business?.tagline,
    site?.business?.description ? tiptapToText(site.business.description) : '',
  ].filter(Boolean) as string[];

  for (const text of sources) {
    const match = text.match(/(?:Contractor\s+)?Lic(?:ense)?\s*#?\s*([A-Za-z0-9-]+)/i);
    if (match?.[1]) return match[1];
  }

  return null;
}

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
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"
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
  }
}

export function Footer() {
  const { site, pages } = useWebBuilder();

  const businessName = getBrandName(site) || 'HomeGuard';

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const navLinks = useMemo(() => getFooterNavLinks(pages), [pages]);

  const socialLinks = useMemo(() => {
    if (site?.footer?.showSocialLinks === false) return [];
    const links = site?.socialLinks ?? [];
    return FOOTER_SOCIAL_ORDER.map((platform) =>
      links.find((link) => link.platform === platform && link.url?.trim())
    ).filter((link): link is { platform: SocialPlatform; url: string } => Boolean(link));
  }, [site?.footer?.showSocialLinks, site?.socialLinks]);

  const contractorLicense = useMemo(() => extractContractorLicense(site), [site]);

  const copyrightText = useMemo(() => {
    const fromCms = tiptapToText(site?.footer?.copyright);
    if (fromCms && !fromCms.toLowerCase().includes('brand booster')) {
      return fromCms.replace(/\s*Build by.*$/i, '').trim();
    }
    return `© ${new Date().getFullYear()} ${businessName} – All Rights Reserved`;
  }, [site?.footer?.copyright, businessName]);

  const corporateOffice = useMemo(() => {
    const address = site?.business?.address;
    if (!address?.street && !address?.city) return '';
    const cityStateZip = [address.city, address.state].filter(Boolean).join(', ');
    const tail = [cityStateZip, address.zipCode].filter(Boolean).join(' ');
    return ['Corporate Office:', address.street, tail].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }, [site?.business?.address]);

  const contactHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [pages]);

  return (
    <footer id="footer" className="hg-footer">
      <div className="hg-footer-main">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="hg-footer-brands">
            <div className="hg-footer-brand hg-footer-brand-center">
              <Link href="/" className="inline-block">
                <Image
                  src={logoSrc}
                  alt={site?.footer?.logo?.altText?.trim() || businessName}
                  width={220}
                  height={72}
                  className="h-14 w-auto object-contain"
                />
              </Link>
              {contractorLicense && (
                <p className="hg-footer-license">Contractor Lic #{contractorLicense}</p>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="hg-footer-socials">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hg-footer-social-link"
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {navLinks.length > 0 && (
            <nav className="hg-footer-nav" aria-label="Footer navigation">
              {navLinks.map((link, index) => (
                <span key={link.id} className="hg-footer-nav-item">
                  {index > 0 && <span className="hg-footer-nav-sep" aria-hidden>|</span>}
                  <Link href={link.href}>{link.label}</Link>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="hg-footer-bottom">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="hg-footer-bottom-inner">
            <div className="hg-footer-bottom-left">
              <span>{copyrightText}</span>
              <span className="hg-footer-bottom-sep" aria-hidden>|</span>
              <a
                href={BRAND_BOOSTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
              >
                US Brand Booster
              </a>
              {corporateOffice && (
                <>
                  <span className="hg-footer-bottom-sep" aria-hidden>|</span>
                  <span>{corporateOffice}</span>
                </>
              )}
              <span className="hg-footer-bottom-sep" aria-hidden>|</span>
              <Link href="/sitemap.xml">Sitemap</Link>
              <span className="hg-footer-bottom-sep" aria-hidden>|</span>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>

            <Link href={contactHref} className="hg-footer-live-chat">
              Live Chat
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2h-5.4L8.8 20.3A1 1 0 017 19.4V17H4a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
