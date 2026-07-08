'use client';

import React, { useMemo } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface CTA3SectionProps {
  cta3Section: Page['cta3Section'];
  className?: string;
}

export const CTA3Section: React.FC<CTA3SectionProps> = ({ cta3Section, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  const safeCta: NonNullable<Page['cta3Section']> = (cta3Section ?? { enabled: false }) as NonNullable<Page['cta3Section']>;

  const backgroundImageUrl = useMemo(() => {
    return safeCta.backgroundImage ? getImageSrc(safeCta.backgroundImage) : '';
  }, [safeCta.backgroundImage]);

  if (!safeCta?.enabled) return null;

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: themeColors.pageBackground }
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background: backgroundImageUrl
            ? `linear-gradient(90deg, color-mix(in srgb, ${themeColors.pageBackground} 72%, transparent) 0%, color-mix(in srgb, ${themeColors.pageBackground} 30%, transparent) 52%, color-mix(in srgb, ${themeColors.pageBackground} 10%, transparent) 100%)`
            : `linear-gradient(135deg, ${themeColors.primaryButton}22 0%, transparent 60%)`,
        }}
      />

      <div className="relative container mx-auto px-4">
        <div className="py-10 lg:py-14">
          <div className="max-w-4xl">
            {safeCta.title && (
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"
                style={{ color: backgroundImageUrl ? themeColors.darkPrimaryText : themeColors.lightPrimaryText }}
              >
                <TiptapRenderer content={safeCta.title} />
              </div>
            )}

            {safeCta.description && (
              <div
                className="mt-6 text-base sm:text-lg lg:text-xl max-w-2xl"
                style={{
                  color: backgroundImageUrl
                    ? 'color-mix(in srgb, var(--wb-text-on-dark) 88%, transparent)'
                    : themeColors.lightSecondaryText,
                }}
              >
                <TiptapRenderer content={safeCta.description} />
              </div>
            )}

            {safeCta.primaryButton && (
              <div className="mt-8">
                <a
                  href={safeCta.primaryButton.href}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-colors"
                  style={{
                    backgroundColor: themeColors.pageBackground,
                    color: themeColors.lightPrimaryText,
                  }}
                >
                  {safeCta.primaryButton.label}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA3Section;
