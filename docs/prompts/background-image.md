# Background image prompt

Use this prompt in your preferred image generator. It is designed for a quiet wallpaper behind the Nook widgets. No generated image is included yet.

## Day version — copy this prompt

```text
Create a refined, calm wallpaper for a personal browser new tab page. Landscape 16:9, 2560 × 1440 pixels. A warm butter-cream and ivory palette, with very faint mint and blush accents. Soft morning window light, quiet tonal variation, and a fine natural paper texture. Keep the center and upper three quarters spacious, low contrast, and almost uniform so cards and text placed over it remain easy to read. Any delicate botanical detail should stay tiny and confined to the outer corners and lower edge. No focal object, hard horizon, sharp stripes, dense pattern, text, letters, icons, UI, borders, logos, people, animals, or foxes. The result should feel like a restful place to land, with understated detail that rewards a closer look. Flat full-frame wallpaper, not a photograph of a monitor or an interface mockup.
```

## Night version

Use the same composition, but replace the palette and light sentence with:

```text
Deep ink navy and muted slate blue, with restrained warm cream highlights. Very soft evening light and a sparse scattering of tiny, dim stars near the outer edges. Keep the center dark and even, with no bright nebula, prominent moon, or high-contrast celestial object.
```

## Use the result

1. Review the image behind the real widgets at wide and narrow sizes. Crop safely; keep important details away from the center.
2. Save a WebP or PNG in `src/app/assets/`, for example `background-day.webp`. WebP is usually smaller; aim for a file under 1 MB when quality allows.
3. Append this override to `src/app/styles/styles.css` after the existing theme rules:

```css
.bg-butterCreamHalftone {
  --app-bg-image: url("../assets/background-day.webp");
  --app-bg-position: center;
  --app-bg-repeat: no-repeat;
  --app-bg-size: cover;
}
```

4. Choose **Halftone day** in Settings → Background. This reuses an existing theme without changing storage or the settings schema. Set `background: "butterCreamHalftone"` in the template config if you want it as the first-use default.
5. For a night image, use `.bg-nightSkyHalftone`, a corresponding local file, and **Halftone night**.
6. Run `pnpm build:extension`, then reload the extension.

Only add the CSS override after the image file exists, or the build will fail. Vite bundles the local asset into the extension. The user photo collection is separate from the page wallpaper.
