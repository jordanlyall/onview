import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "onview.art - Art Blocks Collection Viewer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 300,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            onview
          </span>
          <span
            style={{
              fontSize: 120,
              fontWeight: 300,
              color: "#6366f1",
              letterSpacing: "-0.02em",
            }}
          >
            .art
          </span>
        </div>
        <p
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: 0,
          }}
        >
          Your Art Blocks collection, beautifully presented
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
