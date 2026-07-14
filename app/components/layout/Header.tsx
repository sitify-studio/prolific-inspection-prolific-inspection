'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName, getHeaderNavLinks } from '@/app/lib/siteContent';
import { cn, getImageSrc } from '@/app/lib/utils';

export function Header() {
  const { site, pages } = useWebBuilder();
  const [isOpen, setIsOpen] = useState(false);

  const businessName = getBrandName(site);

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const { mainNavLinks, contactNav } = useMemo(() => getHeaderNavLinks(pages), [pages]);

  const navLinks = useMemo(
    () => mainNavLinks.filter((link) => link.href !== contactNav.href),
    [mainNavLinks, contactNav.href]
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="gb-header">
      <div className="gb-header-main">
        <Link href="/" className="gb-header-logo">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={site?.footer?.logo?.altText?.trim() || businessName || 'Logo'}
              width={180}
              height={48}
              priority
              className="gb-header-logo-img"
            />
          ) : (
            <span className="gb-header-logo-text">{businessName}</span>
          )}
        </Link>

        <nav className="gb-header-nav" aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.id} href={link.href} className="gb-header-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="gb-header-actions">
          <Link href={contactNav.href} className="gb-header-contact">
            {contactNav.label}
          </Link>
          <button
            type="button"
            className="gb-header-menu-btn"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((o) => !o)}
          >
            <span className={cn('gb-header-burger', isOpen && 'is-open')} aria-hidden>
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className={cn('gb-header-drawer', isOpen && 'is-open')} aria-hidden={!isOpen}>
        <nav className="gb-header-drawer-nav" aria-label="Mobile">
          {navLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="gb-header-drawer-link"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={contactNav.href}
            className="gb-header-drawer-link gb-header-drawer-link--cta"
            onClick={() => setIsOpen(false)}
          >
            {contactNav.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
