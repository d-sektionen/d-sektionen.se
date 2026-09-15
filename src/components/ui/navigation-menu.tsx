/*
 * Navigation menu, built on Base UI and assembled the way shadcn ships its
 * components: one composable part per export, `data-slot` hooks for styling,
 * and `className` merged last so callers can always override.
 *
 * Two Base UI traits worth knowing before you restyle these:
 *
 * - State is exposed as `data-*` attributes, not Radix's `data-[state=open]`.
 *   The trigger gets `data-popup-open` / `data-pressed` / `data-disabled`, the
 *   popup gets `data-open` / `data-closed` / `data-starting-style` /
 *   `data-ending-style` / `data-instant`, and content gets
 *   `data-activation-direction`. Size and placement arrive as CSS variables:
 *   `--popup-width`, `--popup-height`, `--positioner-width`,
 *   `--positioner-height`, `--available-width` and `--transform-origin`.
 * - Base UI composes via the `render` prop rather than Radix's `asChild`, but
 *   it must be given a *React* element, so it is only useful from a `.tsx`
 *   file (e.g. `<NavigationMenuLink render={<Link href="/docs" />}>` for a
 *   router link). From Astro just pass `href` directly - `NavigationMenuLink`
 *   already renders an `<a>`, and an Astro node passed to `render` is not a
 *   React element and will throw.
 *
 * IMPORTANT for Astro - assemble the whole menu inside one React component.
 *
 * Base UI shares state between these parts through React context, and Astro
 * renders slot children as their own separate React roots. So this does NOT
 * work from a `.astro` file:
 *
 *   <NavigationMenu client:load>
 *     <NavigationMenuList>...</NavigationMenuList>   // ✗ no Root context
 *   </NavigationMenu>
 *
 * It fails at render time with "NavigationMenuRootContext is missing" (and
 * minifies to a bare "Base UI error #41" in a production build). Instead put
 * the whole tree in a single `.tsx` component and mount that as one island,
 * passing serializable data as props:
 *
 *   // src/components/site-nav.tsx
 *   export function SiteNav({ items }: { items: NavItem[] }) {
 *     return <NavigationMenu>{...}</NavigationMenu>;
 *   }
 *
 *   ---
 *   // src/pages/index.astro
 *   <SiteNav client:load items={items} />
 *
 * No `"use client"` is needed - that is a Next.js convention. In Astro the
 * menu becomes interactive only where you add a client directive; without one
 * it still server-renders, but its dropdowns will not open.
 */

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { ChevronDownIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities,
 * last one wins. Kept local so this component is self-contained - lift it into
 * a shared module once a second `ui` component needs it too.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group/navigation-menu-list flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  cn(
    "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center gap-1",
    "rounded-md bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800",
    "outline-none transition-[color,background-color,box-shadow]",
    "hover:bg-background-100 hover:text-foreground-950",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-popup-open:bg-background-100 data-popup-open:text-foreground-950",
  ),
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="relative top-px size-3 shrink-0 transition-transform duration-200 group-data-[popup-open]/navigation-menu-trigger:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-auto transition-[opacity,transform,translate] duration-300",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-1/2",
        "data-starting-style:data-[activation-direction=right]:translate-x-1/2",
        "data-ending-style:data-[activation-direction=left]:translate-x-1/2",
        "data-ending-style:data-[activation-direction=right]:-translate-x-1/2",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
          "transition-[top,left,right,bottom] duration-300 data-instant:transition-none",
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          className={cn(
            "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin)",
            "rounded-md border border-background-200 bg-background-50 text-foreground-800 shadow-lg",
            "transition-[opacity,transform,width,height,scale,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
          )}
        >
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "py-4 px-8 block select-none rounded-md p-3 leading-none no-underline outline-none",
        "text-foreground-800 transition-colors",
        "hover:bg-background-100 hover:text-foreground-950",
        "focus-visible:bg-background-100 focus-visible:ring-2 focus-visible:ring-primary",
        "data-active:bg-background-100",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuPrimitive.Icon.Props) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 border-r border-b border-background-200 bg-background-50" />
    </NavigationMenuPrimitive.Icon>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
