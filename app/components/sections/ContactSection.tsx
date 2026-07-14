'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import type { BusinessHours, Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

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
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sendCopy, setSendCopy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
        hours: entry ? formatDayHours(entry, businessHours.displayFormat) : 'Closed',
      };
    });
  }, [businessHours]);

  const mapSrc = useMemo(() => {
    if (
      site?.business?.coordinates?.latitude != null &&
      site?.business?.coordinates?.longitude != null
    ) {
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
  const resolvedTitle = tiptapToText(contactSection.title);

  const hasAddress = Boolean(address?.street || address?.city);
  const hasPhone = Boolean(business?.phone?.trim());
  const hasEmail = Boolean(business?.email?.trim());
  const hasHours = weeklyHours.length > 0;
  const hasContactDetails = hasAddress || hasPhone || hasEmail;
  const showHoursBlock = showContactInfo && hasHours;
  const showContactBlock = showContactInfo && hasContactDetails;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sendCopy,
          siteId: site?._id,
          subject: `Contact Form - ${formData.name}`,
        }),
      });

      if (response.ok) {
        setSubmitMessage('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
        setSendCopy(false);
      } else {
        setSubmitMessage('Failed to send. Please try again.');
      }
    } catch {
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={cn('gb-contact-section', className)}>
      {showMap ? (
        <div className="gb-contact-map" aria-hidden={!mapSrc}>
          {mapSrc ? (
            <iframe
              title="Office Location"
              src={mapSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="gb-contact-map-fallback">Map not available</div>
          )}
        </div>
      ) : (
        <div className="gb-contact-map gb-contact-map--empty" aria-hidden />
      )}

      <div className="gb-container gb-contact-overlay">
        <div className="gb-contact-card">
          {resolvedTitle ? <h2 className="gb-contact-title">{resolvedTitle}</h2> : null}

          <div className="gb-contact-grid">
            {showForm ? (
              <form className="gb-contact-form" onSubmit={handleSubmit}>
                <label className="gb-contact-field">
                  <span className="sr-only">Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="gb-contact-input"
                  />
                </label>

                <label className="gb-contact-field">
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="gb-contact-input"
                  />
                </label>

                <label className="gb-contact-field">
                  <span className="sr-only">Message</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="gb-contact-input gb-contact-textarea"
                  />
                </label>

                <label className="gb-contact-copy">
                  <input
                    type="checkbox"
                    checked={sendCopy}
                    onChange={(e) => setSendCopy(e.target.checked)}
                  />
                  <span>Send me a copy of this message</span>
                </label>

                <button type="submit" className="gb-contact-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send'}
                </button>

                {submitMessage ? (
                  <p className="gb-contact-status" role="status">
                    {submitMessage}
                  </p>
                ) : null}
              </form>
            ) : null}

            {(showHoursBlock || showContactBlock) && (
              <div className="gb-contact-info">
                {showHoursBlock ? (
                  <div className="gb-contact-info-item">
                    <span
                      className="gb-contact-info-icon"
                      style={{
                        color: '#2563EB',
                        backgroundColor: '#2563EB22',
                        borderColor: '#2563EB',
                      }}
                      aria-hidden
                    >
                      <Clock color="#2563EB" strokeWidth={2.1} />
                    </span>
                    <div>
                      <h3 className="gb-contact-info-heading">Business Hours</h3>
                      <div className="gb-contact-hours">
                        {weeklyHours.map((row) => (
                          <div key={row.day} className="gb-contact-hours-row">
                            <span>{row.day}</span>
                            <span>{row.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {showContactBlock ? (
                  <div className="gb-contact-info-item">
                    <span
                      className="gb-contact-info-icon"
                      style={{
                        color: '#059669',
                        backgroundColor: '#05966922',
                        borderColor: '#059669',
                      }}
                      aria-hidden
                    >
                      {hasPhone ? (
                        <Phone color="#059669" strokeWidth={2.1} />
                      ) : (
                        <MapPin color="#059669" strokeWidth={2.1} />
                      )}
                    </span>
                    <div>
                      <h3 className="gb-contact-info-heading">Contact Info</h3>
                      <div className="gb-contact-info-lines">
                        {hasAddress ? (
                          <address className="not-italic">
                            {address?.street ? (
                              <>
                                {address.street}
                                <br />
                              </>
                            ) : null}
                            {[address?.city, address?.state].filter(Boolean).join(', ')}
                            {address?.zipCode ? ` ${address.zipCode}` : ''}
                          </address>
                        ) : null}
                        {hasPhone ? (
                          <a href={`tel:${business!.phone!.replace(/\s/g, '')}`}>
                            {business!.phone}
                          </a>
                        ) : null}
                        {hasEmail ? (
                          <a href={`mailto:${business!.email}`}>{business!.email}</a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
