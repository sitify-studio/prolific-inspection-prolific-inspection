'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName, getFooterNavLinks, getPageHref, hasFooterDescriptionContent } from '@/app/lib/siteContent';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

type SocialPlatform = 'facebook' | 'instagram' | 'X' | 'youtube' | 'linkedin';

const FOOTER_SOCIAL_ORDER: SocialPlatform[] = ['facebook', 'instagram', 'X', 'youtube', 'linkedin'];

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
  const { site, pages, services } = useWebBuilder();

  const businessName = getBrandName(site);

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const exploreLinks = useMemo(() => getFooterNavLinks(pages), [pages]);

  const serviceLinks = useMemo(() => {
    return services
      .filter((s) => s.status === 'published' && s.name?.trim())
      .slice(0, 6)
      .map((s) => ({
        id: s._id,
        label: s.name.trim(),
        href: `/service/${resolveServiceSlug(s)}`,
      }));
  }, [services]);

  const socialLinks = useMemo(() => {
    if (site?.footer?.showSocialLinks === false) return [];
    const links = site?.socialLinks ?? [];
    return FOOTER_SOCIAL_ORDER.map((platform) =>
      links.find((link) => link.platform === platform && link.url?.trim())
    ).filter((link): link is { platform: SocialPlatform; url: string } => Boolean(link));
  }, [site?.footer?.showSocialLinks, site?.socialLinks]);

  const contactHref = useMemo(() => {
    const contactPage = pages.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [pages]);

  const footerDescription = useMemo(() => {
    const content = site?.footer?.description;
    if (!hasFooterDescriptionContent(content)) return null;
    return content;
  }, [site?.footer?.description]);

  const footerDescriptionText = useMemo(
    () => (footerDescription ? tiptapToText(footerDescription).trim() : ''),
    [footerDescription]
  );

  const copyrightText = useMemo(() => {
    const fromCms = tiptapToText(site?.footer?.copyright);
    if (fromCms && !fromCms.toLowerCase().includes('brand booster')) {
      return fromCms.replace(/\s*Build by.*$/i, '').trim();
    }
    return businessName
      ? `Copyright © ${new Date().getFullYear()}. ${businessName}. All rights reserved.`
      : `Copyright © ${new Date().getFullYear()}. All rights reserved.`;
  }, [site?.footer?.copyright, businessName]);

  const addressLines = useMemo(() => {
    const address = site?.business?.address;
    if (!address) return [] as string[];
    const lines: string[] = [];
    if (businessName) lines.push(businessName);
    if (address.street?.trim()) lines.push(address.street.trim());
    const cityLine = [address.city, address.state].filter(Boolean).join(', ');
    const withZip = [cityLine, address.zipCode].filter(Boolean).join(' ');
    if (withZip) lines.push(withZip);
    return lines;
  }, [site?.business?.address, businessName]);

  return (
    <footer id="footer" className="gb-footer">
      <div className="gb-footer-main">
        <div className="gb-container">
          <div className="gb-footer-grid">
            <div className="gb-footer-brand">
              <Link href="/" className="gb-footer-logo">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={site?.footer?.logo?.altText?.trim() || businessName || 'Logo'}
                    width={220}
                    height={72}
                    className="gb-footer-logo-img"
                  />
                ) : businessName ? (
                  <span className="gb-footer-brand-text">{businessName}</span>
                ) : null}
              </Link>

              {addressLines.length > 0 ? (
                <address className="gb-footer-address">
                  {addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              ) : null}

              {socialLinks.length > 0 ? (
                <div className="gb-footer-socials">
                  {socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gb-footer-social-link"
                      aria-label={link.platform}
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {exploreLinks.length > 0 ? (
              <nav className="gb-footer-col" aria-label="Explore">
                <h3 className="gb-footer-col-title">Explore</h3>
                <ul className="gb-footer-col-list">
                  {exploreLinks.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {serviceLinks.length > 0 ? (
              <nav className="gb-footer-col" aria-label="Services">
                <h3 className="gb-footer-col-title">Services</h3>
                <ul className="gb-footer-col-list">
                  {serviceLinks.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <nav className="gb-footer-col" aria-label="Legal">
              <h3 className="gb-footer-col-title">Legal</h3>
              <ul className="gb-footer-col-list">
                <li>
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/sitemap.xml">Sitemap</Link>
                </li>
                <li>
                  <Link href={contactHref}>Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="gb-footer-bottom">
        <div className="gb-container">
          <div className="gb-footer-bottom-inner">
            <div className="gb-footer-fineprint">
              {footerDescription && footerDescriptionText ? (
                typeof footerDescription === 'string' ? (
                  <p>{footerDescriptionText}</p>
                ) : (
                  <TiptapRenderer content={footerDescription} />
                )
              ) : null}
            </div>
            <p className="gb-footer-copyright">{copyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
