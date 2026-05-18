import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f7f1e8",
          color: "#18212f",
          padding: "70px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "3px solid #18212f",
            padding: "56px",
            background: "#fbfaf7",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#7d4b32",
              fontWeight: 700,
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 112,
                lineHeight: 1,
                fontWeight: 800,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 42,
                lineHeight: 1.2,
                color: "#4f5967",
                maxWidth: 840,
              }}
            >
              Custom keychains handcrafted from reclaimed denim.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
