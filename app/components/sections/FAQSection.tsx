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

function SpeechBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M6 7.5h20a3 3 0 013 3v9a3 3 0 01-3 3H16l-5.5 4.5V22.5H6a3 3 0 01-3-3v-9a3 3 0 013-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="15" r="1.15" fill="currentColor" />
      <circle cx="16" cy="15" r="1.15" fill="currentColor" />
      <circle cx="20.5" cy="15" r="1.15" fill="currentColor" />
    </svg>
  );
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
    () => titleOverride || tiptapToText(faqSection?.title),
    [titleOverride, faqSection?.title]
  );

  const description = useMemo(
    () => descriptionOverride || tiptapToText(faqSection?.description),
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
    <section id="faq" className={cn('gb-faq-section', className)}>
      <div className="gb-container">
        {(title || description) && (
          <header className="gb-faq-head">
            <SpeechBubbleIcon className="gb-faq-head-icon" />
            {title ? <h2 className="gb-faq-heading">{title}</h2> : null}
            {description ? <p className="gb-faq-subhead">{description}</p> : null}
          </header>
        )}

        <div className="gb-faq-list">
          {questions.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const triggerId = `faq-trigger-${index}`;

            return (
              <div
                key={index}
                className={cn('gb-faq-item', isOpen && 'is-open')}
              >
                <button
                  id={triggerId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="gb-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="gb-faq-index" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="gb-faq-main">
                    <span className="gb-faq-question-row">
                      <span className="gb-faq-arrow" aria-hidden>
                        ↓
                      </span>
                      <span className="gb-faq-question">{faq.question}</span>
                    </span>
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="gb-faq-panel"
                  hidden={!isOpen}
                >
                  {faq.answer ? <p className="gb-faq-answer">{faq.answer}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
