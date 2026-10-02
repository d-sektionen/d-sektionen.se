import { type Navigation, SiteNav } from "@components/SiteNav";
import { useEffect, useRef, useState } from "react";
import logoDsek from "../assets/logo_dsektionen.svg";
import logoDsekRound from "../assets/logo_dsektionen_round.svg";

/**
 * The site header: the wordmark and the menu bar that pins to the top of the
 * viewport once the wordmark has been scrolled away.
 *
 * The wordmark and menu bar are siblings so the sticky bar is not constrained
 * by a wrapper that scrolls away with the wordmark.
 *
 * `items` is built by `SiteHeader.astro` from the `pages` collection and
 * passed to this client component as a prop.
 */
export function Navbar({ items }: { items: Navigation }) {
  const logoRowRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const logoRow = logoRowRef.current;

    if (!logoRow) return;

    // `position: sticky` cannot report whether it is currently pinned, so the
    // wordmark above the bar is watched instead: the bar pins at exactly the
    // moment that wordmark has been scrolled past, i.e. its bottom edge
    // reaches the top of the viewport. Observer avoids running JavaScript on
    // every scroll event.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPinned(
          !entry.isIntersecting && entry.boundingClientRect.bottom <= 0,
        );
      },
      { threshold: 0 },
    );

    observer.observe(logoRow);

    return () => observer.disconnect();
  }, []);

  // Compact logo for the pinned bar. It stays mounted while hidden so its
  // reserved space prevents the navigation items from shifting sideways.
  const compactLogo = (
    <a
      href="/"
      aria-label="D-sektionens startsida"
      className={[
        "mr-4 hidden h-9 items-center md:flex",
        "motion-safe:transition-[opacity,visibility] duration-200 ease-out",
        pinned ? "visible opacity-100" : "invisible opacity-0",
      ].join(" ")}
    >
      <img
        src={logoDsekRound.src}
        width={logoDsekRound.width}
        height={logoDsekRound.height}
        alt=""
        className="h-8 w-auto"
      />
    </a>
  );

  return (
    <>
      <div
        ref={logoRowRef}
        className="flex w-full flex-col items-center bg-background-50 pt-2 pb-4"
      >
        <a href="/" aria-label="D-sektionens startsida">
          <img
            src={logoDsek.src}
            width={logoDsek.width}
            height={logoDsek.height}
            alt=""
          />
        </a>
      </div>

      <nav className="sticky top-0 z-100 mb-2 flex w-full flex-col items-center bg-background-50 shadow-sm">
        <SiteNav items={items} leading={compactLogo} />
      </nav>
    </>
  );
}
