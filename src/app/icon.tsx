import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The mark at favicon size: a pad, and a payload sitting on it. Built from
 * divs because ImageResponse renders a flexbox subset, not arbitrary SVG —
 * so the payload is a block rather than the nose cone the nav lockup draws.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          background: "#c7c6c1",
        }}
      >
        <div style={{ display: "flex", width: 20, height: 26, background: "#d93d0e" }} />
        <div style={{ display: "flex", width: 44, height: 12, background: "#17181b" }} />
      </div>
    ),
    { ...size },
  );
}
