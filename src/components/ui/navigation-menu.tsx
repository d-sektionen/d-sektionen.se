/*
 * Navigation menu, built on Base UI and assembled the way shadcn ships its
 * components: one composable part per export and `data-slot` hooks for styling.
 *
 * STYLING - self-contained. Every part owns a single fixed class string and
 * does not accept `className` (the prop is removed from the types, and the
 * fixed `className`/`data-slot` are applied after any spread props so they
 * cannot be overridden at runtime either). `NavigationMenuLink` is the one
 * part with a choice to make, via `variant`:
 *
 *   "item"    (default) - an entry inside a dropdown panel
 *   "trigger"           - a top-level nav-bar item, the same look a
 *                         `NavigationMenuTrigger` has, for a plain link
 *
 * Because class strings are fixed rather than composed, they must never
 * contain two utilities from the same group (e.g. `p-3` next to `px-4`, or
 * `block` next to `inline-flex`). CSS would silently pick a winner by
 * stylesheet order rather than by the order written, so keep each string
 * conflict-free when editing.
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
import { ChevronDownIcon } from "lucide-react";

/**
 * A nav-bar item: used by `NavigationMenuTrigger` (a button) and by a
 * `NavigationMenuLink` with `variant="trigger"` (an anchor) - hence the anchor
 * resets (`no-underline`, `select-none`) and `data-active`, which only ever
 * matches on a link.
 */
const triggerLook = [
  "inline-flex h-9 w-max items-center justify-center gap-1",
  "select-none no-underline outline-none",
  "bg-background-50 px-4 py-2 text-sm font-medium text-foreground-800",
  "transition-[color,background-color,box-shadow]",
  "hover:bg-dsek-pink hover:text-foreground-50",
  "focus-visible:bg-background-100 focus-visible:ring-2 focus-visible:ring-primary",
  "disabled:pointer-events-none disabled:opacity-50",
  "data-popup-open:bg-dsek-pink data-popup-open:text-foreground-50",
  "data-active:bg-background-100",
].join(" ");

/** An entry inside a dropdown panel. */
const itemLook = [
  "block select-none py-4 px-8 leading-none no-underline outline-none",
  "text-foreground-800 transition-colors",
  "hover:bg-dsek-pink hover:text-foreground-50",
  "focus-visible:bg-background-100 focus-visible:ring-2 focus-visible:ring-primary",
  "data-active:bg-background-100",
].join(" ");

const lookByVariant = {
  item: itemLook,
  trigger: triggerLook,
} as const;

type NavigationMenuLinkVariant = keyof typeof lookByVariant;

function NavigationMenu({
  align = "start",
  children,
  ...props
}: Omit<NavigationMenuPrimitive.Root.Props, "className"> &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      {...props}
      data-slot="navigation-menu"
      className="relative flex max-w-max flex-1 items-center justify-center"
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  ...props
}: Omit<NavigationMenuPrimitive.List.Props, "className">) {
  return (
    <NavigationMenuPrimitive.List
      {...props}
      data-slot="navigation-menu-list"
      className="flex flex-1 list-none items-center justify-center gap-1"
    />
  );
}

function NavigationMenuItem({
  ...props
}: Omit<NavigationMenuPrimitive.Item.Props, "className">) {
  return (
    <NavigationMenuPrimitive.Item
      {...props}
      data-slot="navigation-menu-item"
      className="relative"
    />
  );
}

function NavigationMenuTrigger({
  children,
  ...props
}: Omit<NavigationMenuPrimitive.Trigger.Props, "className">) {
  return (
    <NavigationMenuPrimitive.Trigger
      {...props}
      data-slot="navigation-menu-trigger"
      className={triggerLook}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="relative top-px size-3 shrink-0 transition-transform duration-200 in-data-popup-open:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  ...props
}: Omit<NavigationMenuPrimitive.Content.Props, "className">) {
  return (
    <NavigationMenuPrimitive.Content
      {...props}
      data-slot="navigation-menu-content"
      className={[
        "h-full w-auto transition-[opacity,transform,translate] duration-300",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-1/2",
        "data-starting-style:data-[activation-direction=right]:translate-x-1/2",
        "data-ending-style:data-[activation-direction=left]:translate-x-1/2",
        "data-ending-style:data-[activation-direction=right]:-translate-x-1/2",
      ].join(" ")}
    />
  );
}

function NavigationMenuPositioner({
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: Omit<NavigationMenuPrimitive.Positioner.Props, "className">) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        {...props}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={[
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
          "transition-[top,left,right,bottom] duration-300 data-instant:transition-none",
        ].join(" ")}
      >
        <NavigationMenuPrimitive.Popup
          className={[
            "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin)",
            "border border-background-200 bg-background-50 text-foreground-800 shadow-lg",
            "transition-[opacity,transform,width,height,scale,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
          ].join(" ")}
        >
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuLink({
  variant = "item",
  ...props
}: Omit<NavigationMenuPrimitive.Link.Props, "className"> & {
  /** "item" (default) for a dropdown entry, "trigger" for a top-level link. */
  variant?: NavigationMenuLinkVariant;
}) {
  return (
    <NavigationMenuPrimitive.Link
      {...props}
      data-slot="navigation-menu-link"
      className={lookByVariant[variant]}
    />
  );
}

function NavigationMenuIndicator({
  ...props
}: Omit<NavigationMenuPrimitive.Icon.Props, "className">) {
  return (
    <NavigationMenuPrimitive.Icon
      {...props}
      data-slot="navigation-menu-indicator"
      className="top-full z-1 flex h-1.5 items-end justify-center overflow-hidden"
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
};
