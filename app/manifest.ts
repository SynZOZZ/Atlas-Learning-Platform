import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Atlas Learning Platform", short_name: "Atlas", description: "Secure bilingual learning platform", start_url: "/", display: "standalone", background_color: "#f4f1e9", theme_color: "#3159e8", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] }; }
