import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { bpsToPercent, splitTerms } from "@/lib/economics";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHROME =
  "linear-gradient(160deg, #ffffff 0%, #f2f5f2 22%, #b9c2bb 52%, #8d968f 66%, #f2f5f2 88%, #ffffff 100%)";

/**
 * The card that actually circulates, so the state of the project is printed on
 * it rather than left for whoever clicks through: it says NO FACTORY DEPLOYED,
 * and it says what the protocol takes. The asterisk is three rotated bars —
 * ImageResponse renders a flexbox subset, so the site's stacked-stroke SVG
 * does not survive the trip.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          background:
            "linear-gradient(135deg, #ffffff 0%, #ffffff 38%, #f2fce0 66%, #d5f78c 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: 20,
            letterSpacing: 4,
            color: "#636967",
          }}
        >
          <div style={{ display: "flex" }}>LAUNCHPAD · ROBINHOOD CHAIN</div>
          <div style={{ display: "flex" }}>NO FACTORY DEPLOYED</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 190,
              height: 190,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {[0, 60, 120].map((angle) => (
              <div
                key={angle}
                style={{
                  position: "absolute",
                  display: "flex",
                  width: 30,
                  height: 168,
                  borderRadius: 999,
                  background: CHROME,
                  transform: `rotate(${angle}deg)`,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 118,
                letterSpacing: -4,
                color: "#2e3132",
                lineHeight: 1,
              }}
            >
              {siteConfig.wordmark}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 38,
                letterSpacing: -1,
                color: "#2e3132",
                maxWidth: 720,
                lineHeight: 1.15,
              }}
            >
              Launch a token that pays its holders in stock.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 19,
            letterSpacing: 1,
            color: "#4a4f50",
          }}
        >
          <div style={{ display: "flex", maxWidth: 760 }}>
            Free to launch. {bpsToPercent(splitTerms.platformShareBps)} of
            collected fees to the protocol.{" "}
            {bpsToPercent(splitTerms.minHolderShareBps)} minimum to holders.
          </div>
          <div style={{ display: "flex" }}>HELD</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
