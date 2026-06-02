import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg, #0A1F44 0%, #06122A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            background: "#52E1E7",
            transform: "rotate(45deg)",
            borderRadius: 12,
            boxShadow: "0 0 60px rgba(82,225,231,0.7)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
