'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeFonts } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';

interface ServiceBannerProps {
  service: any;
}

const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const resolved = getImageSrc(url);
  return resolved || undefined;
};

export const ServiceBanner: React.FC<ServiceBannerProps> = ({ service }) => {
  const themeFonts = useThemeFonts();

  const bannerTitle =
    service.banner?.useServiceNameAsTitle !== false
      ? service.name
      : service.banner?.customTitle || service.name;

  const bannerBgImage = service.banner?.backgroundImage?.url
    ? getFullImageUrl(service.banner.backgroundImage.url)
    : service.thumbnailImage?.url
      ? getFullImageUrl(service.thumbnailImage.url)
      : undefined;

  const overlayOpacity = service.banner?.overlayOpacity ?? 55;

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-[var(--wb-page-bg)]">
      {bannerBgImage && (
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${bannerBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
          aria-hidden
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: bannerBgImage
            ? `linear-gradient(to bottom, color-mix(in srgb, var(--wb-page-bg) ${overlayOpacity}%, transparent) 0%, color-mix(in srgb, var(--wb-page-bg) ${Math.round(overlayOpacity * 0.75)}%, transparent) 100%)`
            : 'linear-gradient(to bottom, color-mix(in srgb, var(--wb-page-bg) 88%, transparent) 0%, color-mix(in srgb, var(--wb-page-bg) 72%, transparent) 100%)',
        }}
        aria-hidden
      />

      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
      </div>

      <div className="relative z-10 text-center px-6 md:px-12 py-12 md:py-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 h-px bg-[color-mix(in_srgb,var(--wb-text-main)_35%,transparent)]" />
          <span
            className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold text-[var(--wb-text-secondary)]"
            style={{ fontFamily: themeFonts.body }}
          >
            Our Services
          </span>
          <div className="w-12 h-px bg-[color-mix(in_srgb,var(--wb-text-main)_35%,transparent)]" />
        </div>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light uppercase tracking-tight text-[var(--wb-text-main)] leading-[0.95] mb-6"
          style={{ fontFamily: themeFonts.heading }}
        >
          {bannerTitle}
        </h1>

        {service.shortDescription && (
          <div
            className="text-base md:text-lg lg:text-xl text-[var(--wb-text-secondary)] max-w-2xl mx-auto font-light tracking-wide leading-relaxed"
            style={{ fontFamily: themeFonts.body }}
          >
            {typeof service.shortDescription === 'string' ? (
              service.shortDescription
            ) : (
              <TiptapRenderer content={service.shortDescription} as="inline" />
            )}
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--wb-text-secondary)]">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[color-mix(in_srgb,var(--wb-text-main)_50%,transparent)] to-transparent" />
        </div>
      </div>
    </section>
  );
};
