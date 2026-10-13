import type { DashboardWidgetId, NookSettings, WidgetId, WidgetSize } from "./state/schema.ts";
import cloud from "./app/assets/decor-cloud.png";
import flower from "./app/assets/decor-flower.png";

// Starter settings apply on first use and after Reset. Saved settings take priority.
// Quotes, images, branding, and decoration changes apply on the next page load.
export const templateConfig = {
  brand: { name: "nook", tagline: "a soft shelf for this tab" },
  quotes: [
    { text: "Make room for what matters.", author: "Daily reminder" },
    { text: "A small step is still a step.", author: "Daily reminder" },
    { text: "Leave a little space in your day.", author: "Daily reminder" },
    { text: "You can begin again, right here.", author: "Daily reminder" },
    { text: "Take your time with the good things.", author: "Daily reminder" },
    { text: "Let one thing be enough for now.", author: "Daily reminder" },
    { text: "Notice something you would usually miss.", author: "Daily reminder" }
  ],
  decorations: { cloud, flower },
  widgetOrder: ["personalNote", "rituals", "quickLinks", "curatedArt", "quote"] as DashboardWidgetId[],
  widgetSizes: { personalNote: "large", rituals: "small", quickLinks: "small", curatedArt: "medium", quote: "small" } satisfies Record<DashboardWidgetId, WidgetSize>,
  layout: "balanced" as NookSettings["selectedLayout"],
  background: "butterCream" as NookSettings["appearance"]["background"]["colorToken"],
  widgets: { quote: true, rituals: true, quickLinks: true, personalNote: true, curatedArt: true, clock: true } satisfies Record<WidgetId, boolean>,
  rituals: ["Drink water", "Stretch shoulders", "Look away from the screen"],
  quickLinks: [
    { label: "Wikipedia", url: "https://wikipedia.org" },
    { label: "Calendar", url: "https://calendar.google.com" },
    { label: "Mail", url: "https://mail.google.com" }
  ],
  note: "Make this space your own. Edit this note, then open Settings to choose your pieces.",
  art: [
    { id: "window-light", title: "Window light",
      imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=80",
      alt: "A quiet room with plants and soft daylight", sourceUrl: "https://unsplash.com" },
    { id: "flowers", title: "A little color",
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=80",
      alt: "Flowers in soft daylight", sourceUrl: "https://unsplash.com" },
    { id: "quiet-desk", title: "Space to begin",
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
      alt: "A workspace with natural light", sourceUrl: "https://unsplash.com" }
  ]
};
