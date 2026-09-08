import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "4Z Academy", short_name: "4Z", description: "Secure bilingual learning platform", start_url: "/", display: "standalone", background_color: "#f7faf9", theme_color: "#243565", icons: [{ src: "/assets/4z-academy-logo.png", sizes: "2048x2048", type: "image/png" }] }; }
