'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';

interface ServiceDetailsProps {
  details: Page['companyDetailSection'] | unknown;
  className?: string;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  return (
    <CompanyDetailSection
      companyDetailSection={details as Page['companyDetailSection']}
      className={className}
    />
  );
};

export default ServiceDetails;
