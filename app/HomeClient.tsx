'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { BlogSection } from '@/app/components/sections/BlogSection';
import { ContactSection } from './components/sections/ContactSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { GallerySection } from '@/app/components/sections/GallerySection';
import { getThemeColors } from '@/app/lib/themeBuilder';
import { PageContentLoader } from '@/app/components/ui/PageContentLoader';

export default function HomeClient() {
  const { site, pages, loading, error } = useWebBuilder();

  // Get theme colors from site using the new dynamic CSS variable system

  const themeColors = getThemeColors(site);

  // Get theme fonts from site
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  if (loading) {
    return <PageContentLoader />;
  }

  if (error && !site) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div 
          className="p-6 rounded-lg max-w-lg text-center"
          style={{ 
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px'
          }}
        >
          <h2
            className="mb-2 text-xl font-bold"
            style={{
              color: themeColors.mainText,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondaryText,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  const displayPage = pages.find((p: Page) => p.pageType === 'home');

  if (!displayPage) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ 
            color: themeColors.mainText,
            fontFamily: themeFonts.heading
          }}
        >
          No Home Page Found
        </h2>
        <p 
          style={{ 
            color: themeColors.secondaryText,
            fontFamily: themeFonts.body
          }}
        >
          Please create a page with type &quot;home&quot; in the site builder.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen selection:bg-black/10 selection:text-inherit"
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >

      <main>
        <HeroSection hero={displayPage.hero} page={displayPage} />
        <TestimonialsSection testimonialsSection={displayPage.testimonialsSection} />
        <ServicesSection
          servicesSection={displayPage.servicesSection}
          companyDetailSection={displayPage.companyDetailSection}
          ctaSection={displayPage.ctaSection}
          page={displayPage}
          servicesLimit={3}
          showViewAllLink
        />
        <AboutSection aboutSection={displayPage.aboutSection} page={displayPage} />
        <CTASection ctaSection={displayPage.ctaSection} />
        <WhyChooseUsSection whyChooseUsSection={displayPage.whyChooseUsSection} />
        <CompanyDetailSection companyDetailSection={displayPage.companyDetailSection} />
        <ProjectsSection
          projectSection={displayPage.projectSection}
          projectsSection={displayPage.projectsSection}
          projectsLimit={3}
        />
        <GallerySection gallerySection={displayPage.gallerySection} />
        <BlogSection blogSection={displayPage.blogSection} />
        <FAQSection faqSection={displayPage.faqSection} />
        <ContactSection contactSection={displayPage.contactSection} />
      </main>
      <Footer />
    </div>
  );
}
