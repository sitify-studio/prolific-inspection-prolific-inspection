'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page, Project } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

type ProjectCard = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  year: string;
  href: string;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? normalizeHref(href) : '';
}

function projectTitleText(p: DisplayItem): string {
  if (isProjectEntity(p)) return tiptapToText(p.title) || p.title || '';
  return tiptapToText((p as ManualProject).title);
}

function projectDescriptionText(p: DisplayItem): string {
  if (isProjectEntity(p)) {
    return tiptapToText(p.shortDescription) || tiptapToText(p.description) || '';
  }
  return tiptapToText((p as ManualProject).description);
}

function projectImageUrl(p: DisplayItem): string {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage);
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : '';
}

function projectYear(p: DisplayItem): string {
  if (!isProjectEntity(p)) return '';
  const raw = p.date || p.publishedAt;
  if (!raw) return '';
  try {
    return String(new Date(raw).getFullYear());
  } catch {
    return '';
  }
}

function mapProjectCard(item: DisplayItem, index: number): ProjectCard | null {
  const title = projectTitleText(item);
  const description = projectDescriptionText(item);
  const imageUrl = projectImageUrl(item);
  if (!title && !imageUrl) return null;

  const key = isProjectEntity(item) ? item._id : `manual-${index}`;

  return {
    key,
    title: title || 'Project',
    description,
    imageUrl,
    imageAlt: title || 'Project',
    year: projectYear(item),
    href: projectHref(item),
  };
}

function ProjectCardInner({
  card,
  isVisible,
}: {
  card: ProjectCard;
  index: number;
  isVisible: boolean;
}) {
  return (
    <article className={cn('hg-service-card', isVisible ? 'opacity-100' : 'opacity-0')}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {card.imageUrl ? (
          <OptimizedImage
            src={card.imageUrl}
            alt={card.imageAlt}
            fill
            className="object-cover"
            sizes={IMAGE_SIZES.card}
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--wb-page-bg)]" />
        )}
      </div>
      <div className="p-5">
        {card.year && (
          <p className="text-xs text-[var(--wb-text-secondary)] mb-1">{card.year}</p>
        )}
        <h3 className="font-bold text-[var(--wb-text-main)]">{card.title}</h3>
        {card.description && (
          <p className="text-sm text-[var(--wb-text-secondary)] mt-2 line-clamp-2">
            {card.description}
          </p>
        )}
        {card.href && <span className="hg-learn-more">View Project</span>}
      </div>
    </article>
  );
}

export function ProjectsSection({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}: ProjectsSectionProps) {
  const { projects, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled: metaSource?.enabled ?? listingSource?.enabled ?? true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'description'),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const resolvedTitle = useMemo(() => {
    const text = tiptapToText(sectionData.title);
    return text || 'Selected Projects';
  }, [sectionData.title]);

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData.description),
    [sectionData.description]
  );

  const hasTitle = hasTiptapContent(sectionData.title);
  const hasDescription = hasTiptapContent(sectionData.description);

  const cards = useMemo(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    const limited =
      typeof projectsLimit === 'number' && projectsLimit > 0
        ? items.slice(0, projectsLimit)
        : items;

    return limited
      .map((item, index) => mapProjectCard(item, index))
      .filter((card): card is ProjectCard => card !== null);
  }, [sectionData, projects, projectsLimit]);

  const projectsHref = useMemo(() => {
    const projectPage = pages.find((p) => p.pageType === 'project-detail');
    return projectPage ? getPageHref(projectPage) : '/project-detail';
  }, [pages]);

  const { ref: gridRef, visibleItems } = useStaggeredAnimation(cards.length, 120);

  if (!sectionData.enabled) return null;
  if (!cards.length && !hasTitle && !hasDescription) return null;

  return (
    <section id="projects" className={cn('hg-section wb-surface-page', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="hg-section-title">{resolvedTitle}</h2>
        {resolvedDescription && (
          <p className="hg-section-desc max-w-2xl">
            {resolvedDescription}
          </p>
        )}

        {cards.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const inner = (
                <ProjectCardInner
                  card={card}
                  index={index}
                  isVisible={visibleItems.includes(index)}
                />
              );
              return (
                <div key={card.key}>
                  {card.href ? (
                    <Link href={card.href} className="block no-underline">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[var(--wb-text-secondary)]">
            No published projects yet. Add projects in the builder to show them here.
          </p>
        )}

        {showViewAllLink && cards.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link href={projectsHref} className="hg-btn">
              View All Projects
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
