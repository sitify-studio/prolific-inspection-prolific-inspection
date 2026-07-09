'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ContactSideFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSideForm: React.FC<ContactSideFormProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { site } = useWebBuilder();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'power2.out',
      }).to(formRef.current, { x: 0, duration: 0.8, ease: 'expo.out' }, '-=0.3');
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
        },
      });
      tl.to(formRef.current, { x: '100%', duration: 0.6, ease: 'expo.in' }).to(
        overlayRef.current,
        { opacity: 0, visibility: 'hidden', duration: 0.4 },
        '-=0.2'
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteId: site?._id,
          subject: `Contact Form - ${formData.name}`,
        }),
      });

      if (response.ok) {
        setSubmitMessage('Message sent successfully!');
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
          setFormData({ name: '', email: '', message: '' });
        }, 2000);
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
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 opacity-0 invisible pointer-events-auto cursor-pointer"
        style={{ backgroundColor: 'color-mix(in srgb, var(--wb-text-main) 30%, transparent)' }}
        aria-hidden
      />

      <div
        ref={formRef}
        className="hg-contact-side-panel pointer-events-auto absolute top-0 right-0 flex h-full w-full max-w-[440px] translate-x-full flex-col overflow-hidden"
      >
        <div className="flex shrink-0 justify-end px-5 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--wb-text-on-dark-secondary)] transition-opacity hover:opacity-80"
            aria-label="Close form"
          >
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 md:px-8">
          <h2 className="hg-contact-side-title">Contact Us</h2>
          <div className="hg-contact-accent mb-6" aria-hidden />

          <form onSubmit={handleSubmit} className="hg-contact-form">
            <input
              type="text"
              required
              placeholder="Enter your Name"
              className="hg-contact-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder="Enter a valid email address"
              className="hg-contact-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <textarea
              required
              rows={5}
              placeholder="Enter your message"
              className="hg-contact-input hg-contact-textarea"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <button type="submit" disabled={isSubmitting} className="hg-contact-submit">
              {isSubmitting ? 'Sending…' : submitMessage || 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSideForm;
