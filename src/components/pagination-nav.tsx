import Link from "next/link";

type PaginationNavProps = {
  ariaLabel: string;
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
};

function getPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 1) {
    return [];
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sortedPages = Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);

  return sortedPages.flatMap((value, index) => {
    const previous = sortedPages[index - 1];

    if (previous && value - previous > 1) {
      return ["ellipsis", value] as const;
    }

    return [value] as const;
  });
}

export function PaginationNav({
  ariaLabel,
  currentPage,
  totalPages,
  getPageHref,
}: PaginationNavProps) {
  const paginationItems = getPaginationItems(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mini-pager" aria-label={ariaLabel}>
      <div className="mini-pager__rail">
        {currentPage === 1 ? (
          <span
            className="mini-pager__item mini-pager__item--arrow mini-pager__item--disabled"
            aria-disabled="true"
          >
            {"<"}
          </span>
        ) : (
          <Link
            href={getPageHref(currentPage - 1)}
            className="mini-pager__item mini-pager__item--arrow"
            aria-label="Өмнөх хуудас"
          >
            {"<"}
          </Link>
        )}

        <div className="mini-pager__pages">
          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="mini-pager__item mini-pager__ellipsis"
                aria-hidden="true"
              >
                ...
              </span>
            ) : item === currentPage ? (
              <span
                key={item}
                className="mini-pager__item mini-pager__item--current"
                aria-current="page"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={getPageHref(item)}
                className="mini-pager__item"
              >
                {item}
              </Link>
            ),
          )}
        </div>

        {currentPage === totalPages ? (
          <span
            className="mini-pager__item mini-pager__item--arrow mini-pager__item--disabled"
            aria-disabled="true"
          >
            {">"}
          </span>
        ) : (
          <Link
            href={getPageHref(currentPage + 1)}
            className="mini-pager__item mini-pager__item--arrow"
            aria-label="Дараах хуудас"
          >
            {">"}
          </Link>
        )}
      </div>
    </nav>
  );
}
