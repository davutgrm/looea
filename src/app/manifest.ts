import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Looea — Kuaför ve Berber Randevu",
    short_name: "Looea",
    description:
      "Yakınındaki kuaförleri, berberleri ve güzellik salonlarını keşfet, saniyeler içinde randevunu al.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#B423F3",
    lang: "tr",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
