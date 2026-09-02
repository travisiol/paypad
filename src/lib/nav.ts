/**
 * Shared nav data, deliberately in a module with no "use client" directive.
 *
 * Exports of a "use client" module become *client references* when a server
 * component imports them — a server-rendered footer importing this array from
 * the client navbar gets a proxy, and `navLinks.map is not a function` at
 * prerender. Data that crosses the boundary lives here instead.
 */
export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "/#mechanism", label: "Mechanism" },
  { href: "/#split", label: "Fee split" },
  { href: "/launch", label: "Launch" },
  { href: "/pads", label: "Pads" },
  { href: "/#questions", label: "Questions" },
];

/** Section ids on the home page, in document order, for scroll spy. */
export const homeSections = [
  "mechanism",
  "split",
  "one-click",
  "chain",
  "registry",
  "questions",
] as const;
