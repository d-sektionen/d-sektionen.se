import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@components/ui/navigation-menu";

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

/**
 * The site's own navigation, composing the Base UI primitives from
 * `@components/ui/navigation-menu`.
 *
 * This wrapper exists because those primitives cannot be assembled from a
 * `.astro` file. Astro renders slot children as their own separate React
 * roots, so `NavigationMenu.Root`'s context never reaches `List` / `Item` /
 * `Link`, and the render fails with "NavigationMenuRootContext is missing".
 * Keeping the whole tree in one component and passing plain data in as props
 * is what makes it work, so mount it with a client directive:
 *
 *   <SiteNav client:load items={items} />
 */
export function SiteNav({ items }: { items: Navigation }) {
  return (
    // Rendered as a div rather than Base UI's default <nav>: Navbar.astro
    // already provides the navigation landmark, and nesting a second one
    // inside it just gives screen readers two unlabelled "navigation"
    // regions.
    <NavigationMenu render={<div />}>
      <NavigationMenuList>
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
