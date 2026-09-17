import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SHOFIDEV_TOOLS - All-in-One Developer Tools Suite",
    short_name: "SHOFIDEV_TOOLS",
    description:
      "Fast, privacy-first developer tools and browser utilities created by Shofiqul Islam. 100% client-side.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0c10",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

