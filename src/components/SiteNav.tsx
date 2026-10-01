import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@components/ui/navigation-menu";
import type { ReactNode } from "react";

/** A single navigable page. */
export type SiteNavItem = {
  title: string;
  href: string;
};

/**
 * A top-level entry is either a plain link, or a `[groupTitle, links]` tuple
 * which renders as a dropdown.
 */
export type Navigation = (SiteNavItem | [string, SiteNavItem[]])[];

type SiteNavProps = {
  items: Navigation;
  leading?: ReactNode;
};

/**
 * Must remain a single React component.
 *
 * Astro renders slotted React children as separate roots, preventing
 * NavigationMenu context from reaching nested primitives. Passing plain
 * navigation data as props keeps the entire menu within one React tree.
 */
export function SiteNav({ items, leading }: SiteNavProps) {
  return (
    // Rendered as a div rather than Base UI's default <nav>: Navbar provides
    // the navigation landmark, and nesting a second one inside it just gives
    // screen readers two unlabelled "navigation" regions.
    <NavigationMenu render={<div />}>
      <NavigationMenuList>
        {leading ? <NavigationMenuItem>{leading}</NavigationMenuItem> : null}
        {items.map((item) =>
          Array.isArray(item) ? (
            // A group needs Trigger + Content to become a dropdown.
            // A nested List on its own would just render inline,
            // always visible, with nothing to open.
            <NavigationMenuItem key={item[0]}>
              <NavigationMenuTrigger>{item[0]}</NavigationMenuTrigger>
              <NavigationMenuContent>
                {item[1].map((subitem) => (
                  <NavigationMenuLink href={subitem.href} key={subitem.href}>
                    {subitem.title}
                  </NavigationMenuLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink variant="trigger" href={item.href}>
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
