'use client';

import React from 'react';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';

interface ServiceDetailsProps {
  details: unknown;
  className?: string;
}

/** Service area details — same hardcoded certifications layout as homepage. */
export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ className }) => {
  return <CompanyDetailSection className={className} />;
};

export default ServiceDetails;
