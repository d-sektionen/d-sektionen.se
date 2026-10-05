/*
 * Navigation menu, built on Base UI and assembled the way shadcn ships its
 * components: one composable part per export and `data-slot` hooks for styling.
 */

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";

/*
 * Chevron icon from Lucide (https://lucide.dev/icons/chevron-down) - MIT license.
 */
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...props}
  >
    <title>Chevron Down</title>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

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
  "hover:bg-primary hover:text-foreground-50",
  "focus-visible:bg-background-100 focus-visible:ring-2 focus-visible:ring-primary",
  "disabled:pointer-events-none disabled:opacity-50",
  "data-popup-open:bg-primary data-popup-open:text-foreground-50",
  "data-active:bg-background-100",
].join(" ");

/** An entry inside a dropdown panel. */
const itemLook = [
  "block select-none py-4 px-8 leading-none no-underline outline-none",
  "text-foreground-800 transition-colors",
  "hover:bg-primary hover:text-foreground-50",
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
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
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
            "border-background-200 bg-background-50 text-foreground-800 border shadow-lg",
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
      <div className="border-background-200 bg-background-50 relative top-[60%] size-2 rotate-45 border-r border-b" />
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
