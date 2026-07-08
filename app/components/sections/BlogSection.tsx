'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
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

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

function formatPostDate(iso: string | undefined, show: boolean): string | null {
  if (!show || !iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  categories?: string[];
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

export function BlogSection({ blogSection, className }: BlogSectionProps) {
  const { blogPosts, loading, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? false,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      showDate: current?.showDate ?? fallback?.showDate ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ??
        pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const resolvedTitle = useMemo(
    () => tiptapToText(sectionData?.title) || 'Latest Articles',
    [sectionData?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData?.description),
    [sectionData?.description]
  );

  const hasTitle = hasTiptapContent(sectionData?.title);
  const hasDescription = hasTiptapContent(sectionData?.description);

  const blogHref = useMemo(() => {
    const blogPage = pages.find((p) => p.pageType === 'blog-list');
    return blogPage ? getPageHref(blogPage) : '/blog';
  }, [pages]);

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count) as BlogPostItem[];
  const showExcerpt = Boolean(sectionData.showExcerpt);
  const showDate = Boolean(sectionData.showDate);

  if (loading && blogPosts.length === 0) {
    return (
      <section
        id="blog"
        className={cn('relative py-6 lg:py-8 overflow-hidden wb-surface-light', className)}
      >
        <div className="container mx-auto px-6 lg:px-10 xl:px-14">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--wb-text-main)_8%,var(--wb-page-bg))]" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-[color-mix(in_srgb,var(--wb-text-main)_8%,var(--wb-page-bg))]" />
              <div className="h-24 animate-pulse rounded bg-[color-mix(in_srgb,var(--wb-text-main)_8%,var(--wb-page-bg))]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) {
    return null;
  }

  return (
    <section id="blog" className={cn('hg-section hg-section-alt', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="hg-section-title">{resolvedTitle}</h2>
        {resolvedDescription && (
          <p className="hg-section-desc max-w-2xl">
            {resolvedDescription}
          </p>
        )}

        {displayPosts.length === 0 ? (
          <p className="text-center text-[var(--wb-text-secondary)]">
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <BlogPostCard
                key={post._id}
                post={post}
                showExcerpt={showExcerpt}
                showDate={showDate}
              />
            ))}
          </div>
        )}

        {displayPosts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link href={blogHref} className="hg-btn">
              View All Articles
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function BlogPostCard({
  post,
  showExcerpt,
  showDate,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
}) {
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);

  return (
    <article className="hg-service-card">
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <div className="relative aspect-[16/10] overflow-hidden">
          {imgSrc ? (
            <OptimizedImage
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              className="object-cover"
              sizes={IMAGE_SIZES.card}
              quality={IMAGE_QUALITY_HIGH}
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--wb-page-bg)]" />
          )}
        </div>
        <div className="p-5">
          <PostMeta post={post} showDate={showDate} className="mb-2" />
          {post.title && (
            <h3 className="font-bold text-[var(--wb-text-main)] leading-snug">{post.title}</h3>
          )}
          {showExcerpt && excerpt && (
            <p className="text-sm text-[var(--wb-text-secondary)] mt-2 line-clamp-3">{excerpt}</p>
          )}
          <span className="hg-learn-more">Read More</span>
        </div>
      </Link>
    </article>
  );
}

function PostMeta({
  post,
  showDate,
  className,
}: {
  post: BlogPostItem;
  showDate: boolean;
  className?: string;
}) {
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);
  const author = post.author?.name?.trim();
  const category = post.categories?.[0];

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--wb-text-secondary)]', className)}>
      {category && (
        <span className="rounded-full border wb-border-on-light px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          {category}
        </span>
      )}
      {author && <span>By {author}</span>}
      {dateLabel && <span>{dateLabel}</span>}
    </div>
  );
}

export default BlogSection;
