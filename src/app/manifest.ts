import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avaniya: Real Estate & Asset Tracker",
    short_name: "Avaniya",
    description:
      "Production-grade Indian real estate portfolio management, liquidity accounting, and deal pipeline tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
