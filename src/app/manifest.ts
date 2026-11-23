import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avaniya: Real Estate & Asset Tracker",
    short_name: "Avaniya",
    description:
      "Production-grade Indian real estate portfolio management, liquidity accounting, and deal pipeline tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#111915",
    theme_color: "#111915",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
