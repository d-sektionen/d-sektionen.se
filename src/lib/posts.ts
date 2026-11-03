import type { CollectionEntry } from "astro:content";

/** Number of posts shown on each page of a paginated feed. */
export const POSTS_PER_PAGE = 10;

export type Post = CollectionEntry<"posts">;

/** Where a paginated feed lives. */
export interface PostFeedPaths {
  /** Prefix for page 2 and later, e.g. `/page` or `/kategori/nyheter/page`. */
  pagePath: string;
  /** URL of the first page, e.g. `/` or `/kategori/nyheter`. */
  firstPagePath: string;
}

export const HOME_FEED_PATHS: PostFeedPaths = {
  pagePath: "/page",
  firstPagePath: "/",
};

/** Everything the pagination controls need to build their links. */
export interface Pagination extends PostFeedPaths {
  currentPage: number;
  lastPage: number;
}

/** Props for one page of a feed. */
export interface PostFeedPage {
  posts: Post[];
  pagination: Pagination;
}

/**
 * Sort posts newest first. Returns a new array so the collection data stored by
 * Astro is not reordered in place.
 */
export function sortPosts(posts: readonly Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function getCategoryPosts(
  posts: readonly Post[],
  categoryId: string,
): Post[] {
  return posts.filter((post) => post.data.categories.includes(categoryId));
}

function getLastPage(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
}

function getPagePosts(posts: readonly Post[], currentPage: number): Post[] {
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}

function getPagination(
  currentPage: number,
  totalPosts: number,
  paths: PostFeedPaths,
): Pagination {
  return {
    ...paths,
    currentPage,
    lastPage: getLastPage(totalPosts),
  };
}

export function getPostFeedPage(
  posts: readonly Post[],
  currentPage: number,
  paths: PostFeedPaths,
): PostFeedPage {
  const sortedPosts = sortPosts(posts);

  return {
    posts: getPagePosts(sortedPosts, currentPage),
    pagination: getPagination(currentPage, sortedPosts.length, paths),
  };
}

export function getPostFeedPages(
  posts: readonly Post[],
  paths: PostFeedPaths,
): PostFeedPage[] {
  const sortedPosts = sortPosts(posts);
  const lastPage = getLastPage(sortedPosts.length);

  return Array.from({ length: lastPage }, (_, index) => {
    const currentPage = index + 1;

    return {
      posts: getPagePosts(sortedPosts, currentPage),
      pagination: getPagination(currentPage, sortedPosts.length, paths),
    };
  });
}

/**
 * Turn feed pages into `getStaticPaths()` entries, skipping the first page
 * because it lives at the feed root (e.g. `/` or `/kategori/nyheter`).
 */
export function getPaginatedStaticPaths<TParams extends Record<string, string>>(
  pages: readonly PostFeedPage[],
  getParams: (currentPage: number) => TParams,
): { params: TParams; props: PostFeedPage }[] {
  return pages
    .filter(({ pagination }) => pagination.currentPage > 1)
    .map((props) => ({
      params: getParams(props.pagination.currentPage),
      props,
    }));
}

export function paginationUrl(pagination: Pagination, page: number): string {
  return page === 1
    ? pagination.firstPagePath
    : `${pagination.pagePath}/${page}`;
}
