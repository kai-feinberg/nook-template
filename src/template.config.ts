import type { NookSettings, WidgetId } from "./state/schema.ts";
import cloud from "./app/assets/decor-cloud.png";
import flower from "./app/assets/decor-flower.png";
import mascot from "./app/assets/nook-fox.png";

// Start here. These defaults apply on first use and after Reset in Settings.
// Content and branding apply immediately. Personal settings stay in local storage.
export const templateConfig = {
  brand: { name: "nook", tagline: "a soft shelf for this tab" },
  quote: { text: "Make room for what matters.", author: "Your daily reminder" },
  decorations: { cloud, flower, mascot },
  widgetOrder: ["rituals", "quickLinks", "personalNote", "curatedArt", "githubTrending", "quote"] as WidgetId[],
  layout: "balanced" as NookSettings["selectedLayout"],
  background: "butterCream" as NookSettings["appearance"]["background"]["colorToken"],
  widgets: {
    quote: true, rituals: true, quickLinks: true, personalNote: true,
    curatedArt: true, githubTrending: false, clock: true
  } satisfies Record<WidgetId, boolean>,
  rituals: ["Drink water", "Stretch shoulders", "Look away from the screen"],
  quickLinks: [
    { label: "Wikipedia", url: "https://wikipedia.org" },
    { label: "Calendar", url: "https://calendar.google.com" },
    { label: "Mail", url: "https://mail.google.com" }
  ],
  note: "Make this space your own. Edit this note, then open Settings to choose your pieces.",
  art: [
    { id: "starter-art", title: "A familiar friend", imageUrl: mascot,
      alt: "An illustrated fox", sourceUrl: "" }
  ],
  artRotationMs: 4 * 60 * 60 * 1000
};
