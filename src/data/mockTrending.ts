import type { TrendingRepository } from "../state/schema.ts";

export const mockTrending: TrendingRepository[] = [
  {
    id: "vitejs-vite",
    owner: "vitejs",
    name: "vite",
    description: "Next generation frontend tooling. Fast, lean, and pleasant.",
    language: "TypeScript",
    stars: 77200,
    url: "https://github.com/vitejs/vite"
  },
  {
    id: "facebook-react",
    owner: "facebook",
    name: "react",
    description: "The library for web and native user interfaces.",
    language: "JavaScript",
    stars: 241000,
    url: "https://github.com/facebook/react"
  },
  {
    id: "aklinker1-vite-plugin-web-extension",
    owner: "aklinker1",
    name: "vite-plugin-web-extension",
    description: "Build browser extensions with Vite and a smooth dev loop.",
    language: "TypeScript",
    stars: 1600,
    url: "https://github.com/aklinker1/vite-plugin-web-extension"
  }
];
