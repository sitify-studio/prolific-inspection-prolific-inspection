'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
  title?: string;
  description?: string;
  questions?: Array<{ question: string; answer: string }>;
}

export function FAQSection({
  faqSection,
  className,
  title: titleOverride,
  description: descriptionOverride,
  questions: questionsOverride,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const title = useMemo(
    () =>
      titleOverride ||
      tiptapToText(faqSection?.title) ||
      'Frequently Asked Questions',
    [titleOverride, faqSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(faqSection?.description) ||
      'Clear answers to the questions we hear most often.',
    [descriptionOverride, faqSection?.description]
  );

  const questions = useMemo(() => {
    if (questionsOverride?.length) return questionsOverride;
    return (faqSection?.items ?? [])
      .map((item) => ({
        question: tiptapToText(item.question),
        answer: tiptapToText(item.answer),
      }))
      .filter((item) => item.question || item.answer);
  }, [questionsOverride, faqSection?.items]);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!questions.length) return null;

  return (
    <section id="faq" className={cn('hg-section wb-surface-page', className)}>
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 className="hg-section-title">{title}</h2>
        {description && (
          <p className="hg-section-desc">{description}</p>
        )}

        <div>
          {questions.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="hg-faq-item">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[var(--wb-text-main)] pr-4">
                    {faq.question}
                  </span>
                  <span className="text-[var(--wb-primary)] text-xl shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && faq.answer && (
                  <div className="px-4 pb-4 text-sm text-[var(--wb-text-secondary)] leading-relaxed border-t border-[var(--color-gray-200)] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
