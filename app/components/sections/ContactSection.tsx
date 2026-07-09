'use client';

import { useMemo, useState } from 'react';
import type { BusinessHours, Page } from '@/app/lib/types';
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

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

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
    return `${displayHour}${minutes === '00' ? '' : `:${minutes}`} ${ampm.toLowerCase()}`;
  }
  return time;
}

function formatDayHours(dayHours: BusinessHours, displayFormat?: string) {
  if (!dayHours.isOpen) return 'Closed';
  if (dayHours.is24Hours) return '24 Hours';
  if (dayHours.timeRanges?.length) {
    return dayHours.timeRanges
      .map(
        (range) =>
          `${formatTime(range.openTime, displayFormat)} – ${formatTime(range.closeTime, displayFormat)}`
      )
      .join(', ');
  }
  return '';
}

export function ContactSection({ contactSection, className }: ContactSectionProps) {
  const { site } = useWebBuilder();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const weeklyHours = useMemo(() => {
    if (!businessHours?.isEnabled) return [];

    if (businessHours.is24_7) {
      return DAY_ORDER.map((day) => ({
        day: DAY_LABELS[day],
        hours: '24 Hours',
      }));
    }

    return DAY_ORDER.map((day) => {
      const entry = businessHours.hours?.find((h) => h.day === day);
      return {
        day: DAY_LABELS[day],
        hours: entry
          ? formatDayHours(entry, businessHours.displayFormat)
          : 'Closed',
      };
    });
  }, [businessHours]);

  const mapSrc = useMemo(() => {
    if (site?.business?.coordinates?.latitude != null && site?.business?.coordinates?.longitude != null) {
      return `https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`;
    }
    if (addressLine) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&z=15&output=embed`;
    }
    return '';
  }, [site?.business?.coordinates, addressLine]);

  if (!contactSection?.enabled) return null;

  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;
  const resolvedTitle = tiptapToText(contactSection.title) || 'Contact Us';

  const hasAddress = Boolean(address?.street || address?.city);
  const hasPhone = Boolean(business?.phone?.trim());
  const hasEmail = Boolean(business?.email?.trim());
  const hasHours = weeklyHours.length > 0;
  const hasContactDetails = hasAddress || hasPhone || hasEmail;
  const hasInfo = showContactInfo && (hasContactDetails || hasHours);
  const showInfoPanel = hasInfo || showForm;

  return (
    <section
      id="contact"
      className={cn('hg-contact-section', !showInfoPanel && 'hg-contact-section--no-info', className)}
    >
      <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      <div className="hg-contact-layout">
        {showInfoPanel && (
          <div className="hg-contact-info-side">
            <div className="hg-contact-info-inner">
              <h2 className="hg-contact-info-title">{resolvedTitle}</h2>
              <div className="hg-contact-accent" aria-hidden />

              {hasInfo && (
                <div className="hg-contact-info-grids">
                  {hasContactDetails && (
                    <div className="hg-contact-info-grid">
                      {hasAddress && (
                        <div className="hg-contact-info-block">
                          <h3 className="hg-contact-info-label">Address</h3>
                          <address className="hg-contact-info-value not-italic">
                            {address?.street && (
                              <>
                                {address.street}
                                <br />
                              </>
                            )}
                            {[address?.city, address?.state].filter(Boolean).join(', ')}
                            {address?.zipCode ? ` ${address.zipCode}` : ''}
                          </address>
                        </div>
                      )}

                      {hasPhone && (
                        <div className="hg-contact-info-block">
                          <h3 className="hg-contact-info-label">Call Us</h3>
                          <p className="hg-contact-info-value">
                            <a href={`tel:${business!.phone!.replace(/\s/g, '')}`}>
                              {business!.phone}
                            </a>
                          </p>
                        </div>
                      )}

                      {hasEmail && (
                        <div className="hg-contact-info-block">
                          <h3 className="hg-contact-info-label">Email</h3>
                          <p className="hg-contact-info-value">
                            <a href={`mailto:${business!.email}`}>{business!.email}</a>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(hasHours || showForm) && (
                    <div className="hg-contact-info-grid hg-contact-info-grid--hours">
                      {hasHours && (
                        <div className="hg-contact-info-block">
                          <h3 className="hg-contact-info-label">Opening Hours</h3>
                          <div className="hg-contact-hours-list">
                            {weeklyHours.map((row) => (
                              <div key={row.day} className="hg-contact-hours-row">
                                <span className="hg-contact-hours-day">{row.day}</span>
                                <span className="hg-contact-hours-time">{row.hours}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {showForm && (
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(true)}
                          className="hg-btn hg-contact-message-btn"
                        >
                          Send Us a Message
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!hasInfo && showForm && (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="hg-btn hg-contact-message-btn"
                >
                  Send Us a Message
                </button>
              )}
            </div>
          </div>
        )}

        {showMap && (
          <div className="hg-contact-map-side">
            {mapSrc ? (
              <iframe
                title="Office Location"
                src={mapSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="hg-contact-map-fallback">Map not available</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
