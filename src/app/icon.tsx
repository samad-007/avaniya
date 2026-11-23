import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111915",
          borderRadius: "8px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M27.5 21V13.8L36.5 9.5V22.5L32 19.6L27.5 21Z" fill="#158056" />
          <path d="M19 38.5V24.5L27.5 19.5V31.5L21.5 38.5H19Z" fill="#158056" />
          <path d="M36.5 21.5L45 26.2V38.5H36.5V21.5Z" fill="#158056" />
          <path d="M24.5 38.5L32.5 29.8V38.5H24.5Z" fill="#0F6E4A" />
          <path d="M15.5 43.2L25.5 49.5H15.5V43.2Z" fill="#158056" />
          <path d="M48.5 43.2L38.5 49.5H48.5V43.2Z" fill="#158056" />
          <path d="M32 45.8L40 41H24L32 45.8Z" fill="#0F6E4A" />
          <path d="M27.5 20V13.8L36.5 9.5V21.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 38.5V24.5L27.5 19.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 28.5V18.5L45 26.2V38.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21.5 38.5L33 27.5V38.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 39.5H24.5L32 44.5L39.5 39.5H49.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 39.5L32 51L49.5 39.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 39.5V50.5H25.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M49.5 39.5V50.5H38.5" stroke="#DFC07C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
