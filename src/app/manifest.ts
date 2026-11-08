import type { MetadataRoute } from "next";

// This file tells Android phones the app's name, colours and icon
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Bills",
    short_name: "My Bills", // shown under the icon
    description:
      "A simple bill tracker, calculator and unit converter, made easy to read and use.",
    start_url: "/",
    display: "standalone", // opens like a normal app, without the browser bar
    background_color: "#f5f1e6", // cream, shown briefly while the app opens
    theme_color: "#4a7a2e", // sage green
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      // "maskable" lets Android fit the icon neatly into its round or rounded-square shapes
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}