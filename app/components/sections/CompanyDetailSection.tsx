'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const { pages } = useWebBuilder();

  const title = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );

  const ctaHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [pages]);

  const details = useMemo(() => {
    return (companyDetailSection?.details ?? [])
      .map((detail, index) => {
        const detailTitle =
          tiptapToText(detail.title) || detail.label?.trim() || '';
        const detailDesc =
          tiptapToText(detail.description) || tiptapToText(detail.value) || '';
        const imageUrl = detail.image?.url ? getImageSrc(detail.image.url) : '';
        const imageAlt = detail.image?.altText?.trim() || detailTitle || '';
        if (!detailTitle && !detailDesc && !imageUrl) return null;
        return {
          id: String(index),
          title: detailTitle,
          description: detailDesc,
          imageUrl,
          imageAlt,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          title: string;
          description: string;
          imageUrl: string;
          imageAlt: string;
        } => Boolean(item)
      );
  }, [companyDetailSection?.details]);

  if (companyDetailSection?.enabled === false) return null;
  if (!title && !description && details.length === 0) return null;

  return (
    <section id="company-details" className={cn('gb-help-section', className)}>
      <div className="gb-container">
        {(title || description) && (
          <header className="gb-help-head">
            {title ? <h2 className="gb-help-title">{title}</h2> : null}
            {description ? <p className="gb-help-desc">{description}</p> : null}
          </header>
        )}

        {details.length > 0 ? (
          <div className="gb-help-list">
            {details.map((item, index) => {
              const reverse = index % 2 === 1;
              return (
                <article
                  key={item.id}
                  className={cn('gb-help-row', reverse && 'gb-help-row--reverse')}
                >
                  <div className="gb-help-media-wrap">
                    {item.imageUrl ? (
                      <div className="gb-help-media">
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          fill
                          sizes="(max-width: 768px) 72vw, 280px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="gb-help-media gb-help-media--empty" aria-hidden />
                    )}
                  </div>

                  <div className="gb-help-copy">
                    {item.title ? <h3 className="gb-help-card-title">{item.title}</h3> : null}
                    {item.description ? (
                      <p className="gb-help-card-desc">{item.description}</p>
                    ) : null}
                    <Link href={ctaHref} className="gb-help-cta">
                      Learn More
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CompanyDetailSection;
