'use client';

import { useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

function formatTime(time: string, displayFormat?: string) {
  if (!time) return '';
  if (displayFormat === '12h') {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  return time;
}

function formatDayHours(dayHours: BusinessHours, displayFormat?: string) {
  if (!dayHours.isOpen) return 'Closed';
  if (dayHours.is24Hours) return '24 Hours';
  if (dayHours.timeRanges?.length) {
    return dayHours.timeRanges
      .map((range) => `${formatTime(range.openTime, displayFormat)} - ${formatTime(range.closeTime, displayFormat)}`)
      .join(', ');
  }
  return '';
}

export function ContactSection({ contactSection, className }: ContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const resolvedTitle =
    tiptapToText(contactSection.title) || 'Contact Us';
  const resolvedDescription = tiptapToText(contactSection.description);

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <section id="contact" className={cn('hg-section wb-surface-page', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="hg-section-title">{resolvedTitle}</h2>
        {resolvedDescription && (
          <p className="hg-section-desc max-w-2xl">
            {resolvedDescription}
          </p>
        )}

        <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showContactInfo && (
            <div className="space-y-6">
              {showForm && (
                <button type="button" onClick={() => setIsFormOpen(true)} className="hg-btn">
                  Send Us a Message
                </button>
              )}

              {business?.phone && (
                <div className="border border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] rounded p-5 bg-[var(--wb-card-bg-light)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:${business.phone.replace(/\s/g, '')}`}
                    className="hg-phone-link text-lg"
                  >
                    {business.phone}
                  </a>
                </div>
              )}

              {business?.email && (
                <div className="border border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] rounded p-5 bg-[var(--wb-card-bg-light)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${business.email}`}
                    className="text-[var(--wb-text-main)] hover:text-[var(--wb-primary)] break-all"
                  >
                    {business.email}
                  </a>
                </div>
              )}

              {(address?.street || address?.city) && (
                <div className="border border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] rounded p-5 bg-[var(--wb-card-bg-light)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-1">
                    Office
                  </p>
                  <address className="not-italic text-[var(--wb-text-main)] leading-relaxed">
                    {address?.street && (
                      <>
                        {address.street}
                        <br />
                      </>
                    )}
                    {[address?.city, address?.state].filter(Boolean).join(', ')}
                    {address?.zipCode ? ` ${address.zipCode}` : ''}
                  </address>
                  {addressLine && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-[var(--wb-primary)] hover:underline"
                    >
                      View on Map
                    </a>
                  )}
                </div>
              )}

              {businessHours?.isEnabled && (
                <div className="border border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] rounded p-5 bg-[var(--wb-card-bg-light)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wb-text-secondary)] mb-3">
                    Business Hours
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {businessHours.hours.map((day) => (
                      <div key={day.day} className="flex justify-between gap-4">
                        <span className="font-medium text-[var(--wb-text-main)]">
                          {DAY_LABELS[day.day]}
                        </span>
                        <span className="text-[var(--wb-text-secondary)]">
                          {formatDayHours(day, businessHours.displayFormat)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showMap && (
            <div className="relative min-h-[320px] border border-[var(--color-gray-200)] rounded overflow-hidden">
              {site?.business?.coordinates?.latitude != null &&
              site?.business?.coordinates?.longitude != null ? (
                <iframe
                  title="Office Location"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 h-full w-full border-0"
                  src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center bg-[var(--wb-page-bg)] text-[var(--wb-text-secondary)]">
                  Map coordinates not configured
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
