import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const CHROME =
  "linear-gradient(160deg, #ffffff 0%, #f2f5f2 22%, #b9c2bb 52%, #8d968f 66%, #f2f5f2 88%, #ffffff 100%)";

/**
 * The mark at favicon size: the glass asterisk on the lime ground, built from
 * three rotated bars because ImageResponse renders a flexbox subset — the
 * stacked-stroke SVG the site uses does not survive the trip.
 */
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
          position: "relative",
          background:
            "linear-gradient(150deg, #ffffff 0%, #f2fce0 45%, #d5f78c 100%)",
        }}
      >
        {[0, 60, 120].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              display: "flex",
              width: 11,
              height: 50,
              borderRadius: 999,
              background: CHROME,
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
