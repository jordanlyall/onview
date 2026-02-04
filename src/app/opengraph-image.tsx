import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "onview.art - Turn Any Wallet Into a Gallery";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Iconic Art Blocks pieces - hardcoded preview URLs
const SHOWCASE_IMAGES = [
  // Fidenza #313
  "https://media-proxy.artblocks.io/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/78000313.png",
  // Ringers #879
  "https://media-proxy.artblocks.io/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000879.png",
  // Chromie Squiggle #7583
  "https://media-proxy.artblocks.io/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a/7583.png",
  // Meridian #295
  "https://media-proxy.artblocks.io/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/163000295.png",
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* 2x2 image grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 500,
            height: 500,
            gap: 16,
          }}
        >
          {SHOWCASE_IMAGES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              width={242}
              height={242}
              style={{
                borderRadius: 16,
                objectFit: "cover",
              }}
            />
          ))}
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginLeft: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 72,
                fontWeight: 300,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              onview
            </span>
            <span
              style={{
                fontSize: 72,
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
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: 16,
              maxWidth: 350,
              lineHeight: 1.4,
            }}
          >
            Instant galleries for Art Blocks collectors
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
