import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: "36px",
          border: "4px solid #22C55E",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Minimalist Geometric Diamond 'A' Emblem */}
          <polygon
            points="12,2 22,12 12,22 2,12"
            stroke="#22C55E"
            strokeWidth="2"
            fill="#060907"
          />
          <path
            d="M12 6L17 17H7L12 6Z"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
          />
          <line
            x1="9"
            y1="13.5"
            x2="15"
            y2="13.5"
            stroke="#22C55E"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
