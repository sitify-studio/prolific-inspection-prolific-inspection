'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface CTA5SectionProps {
  cta5Section: Page['cta5Section'];
  className?: string;
}

export const CTA5Section: React.FC<CTA5SectionProps> = ({ cta5Section, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const safe = (cta5Section ?? { enabled: false }) as NonNullable<Page['cta5Section']>;

  const bgUrl = useMemo(
    () => (safe.backgroundImage ? getImageSrc(safe.backgroundImage) : ''),
    [safe.backgroundImage]
  );

  if (!safe?.enabled) return null;

  const onImage = Boolean(bgUrl);

  return (
    <section
      className={cn('relative overflow-hidden py-12 md:py-16', className)}
      style={{
        backgroundColor: safe.backgroundColor || themeColors.pageBackground,
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: themeFonts.body,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: bgUrl
            ? `radial-gradient(ellipse 120% 80% at 20% 40%, color-mix(in srgb, ${themeColors.pageBackground} 55%, transparent) 0%, color-mix(in srgb, ${themeColors.pageBackground} 25%, transparent) 45%, color-mix(in srgb, ${themeColors.pageBackground} 75%, transparent) 100%)`
            : `radial-gradient(ellipse at 30% 20%, color-mix(in srgb, ${themeColors.primaryButton} 22%, transparent), transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[length:56px_56px] opacity-40"
        style={{
          backgroundImage: `linear-gradient(color-mix(in srgb, ${themeColors.darkPrimaryText} 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, ${themeColors.darkPrimaryText} 4%, transparent) 1px, transparent 1px)`,
        }}
      />

      <div className="relative container mx-auto px-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {safe.title && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'text-3xl font-light uppercase leading-tight tracking-[0.08em] md:text-5xl lg:text-6xl',
                onImage ? 'text-[var(--wb-text-on-dark)]' : 'text-[var(--wb-text-main)]'
              )}
              style={{ fontFamily: themeFonts.heading }}
            >
              <TiptapRenderer content={safe.title} />
            </motion.div>
          )}
          {safe.description && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'mt-8 max-w-2xl text-sm font-light leading-relaxed tracking-wide md:text-base',
                onImage ? 'text-[var(--wb-text-on-dark-secondary)]' : 'text-[var(--wb-text-secondary)]'
              )}
            >
              <TiptapRenderer content={safe.description} />
            </motion.div>
          )}
          {safe.primaryButton && (
            <motion.a
              href={safe.primaryButton.href}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className={cn(
                'mt-12 inline-flex items-center justify-center rounded-full border px-10 py-4 text-xs font-semibold uppercase tracking-[0.35em] backdrop-blur-xl',
                onImage ? 'text-[var(--wb-text-on-dark)]' : 'text-[var(--wb-text-main)]'
              )}
              style={{
                borderColor: onImage
                  ? `color-mix(in srgb, ${themeColors.darkPrimaryText} 15%, transparent)`
                  : `color-mix(in srgb, ${themeColors.mainText} 15%, transparent)`,
                backgroundColor: onImage
                  ? `color-mix(in srgb, ${themeColors.darkPrimaryText} 8%, transparent)`
                  : `color-mix(in srgb, ${themeColors.mainText} 6%, transparent)`,
                boxShadow: `0 0 50px color-mix(in srgb, ${themeColors.pageBackground} 45%, transparent)`,
              }}
            >
              {safe.primaryButton.label}
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTA5Section;
