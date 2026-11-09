import { ImageResponse } from "next/og";

// The same picture as the main icon, sized for iPhone and iPad home screens
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // iPhones add their own rounded corners, so the blue fills the whole square
      <svg
        width="180"
        height="180"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="512" height="512" fill="#1a4e69" />
        <rect x="146" y="100" width="220" height="312" rx="28" fill="#fbfdfe" />
        <rect x="182" y="146" width="148" height="22" rx="11" fill="#1a4e69" />
        <rect x="182" y="186" width="100" height="22" rx="11" fill="#1a4e69" />
        <polyline
          points="192,310 236,354 322,262"
          fill="none"
          stroke="#1a4e69"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    { ...size },
  );
}