import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { bpsToPercent, splitTerms } from "@/lib/economics";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card that actually circulates, so the state of the project is printed on
 * it rather than left for whoever clicks through: it says HELD, and it says
 * what the protocol takes. The hazard bar is drawn as a row of blocks —
 * repeating-linear-gradient is not reliably supported by the renderer.
 */
export default async function Image() {
  const stripes = Array.from({ length: 24 }, (_, index) => index);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#c7c6c1",
        }}
      >
        <div style={{ display: "flex", height: 18 }}>
          {stripes.map((index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flex: 1,
                background: index % 2 === 0 ? "#d93d0e" : "#1a1a1c",
              }}
            />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              letterSpacing: 5,
              color: "rgba(19,19,22,0.62)",
            }}
          >
            <div style={{ display: "flex" }}>
              LAUNCHPAD · ROBINHOOD CHAIN
            </div>
            <div style={{ display: "flex", color: "#93230a" }}>
              NO FACTORY DEPLOYED
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 132,
                letterSpacing: -2,
                color: "#131316",
                lineHeight: 1,
              }}
            >
              {siteConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 40,
                letterSpacing: 1,
                color: "#131316",
                maxWidth: 940,
                lineHeight: 1.15,
              }}
            >
              {siteConfig.tagline}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: 19,
              letterSpacing: 2,
              color: "rgba(19,19,22,0.62)",
            }}
          >
            <div style={{ display: "flex", maxWidth: 700 }}>
              Free to launch. {bpsToPercent(splitTerms.platformShareBps)} of
              collected fees to the protocol.{" "}
              {bpsToPercent(splitTerms.minHolderShareBps)} minimum to holders.
            </div>
            <div style={{ display: "flex" }}>NOT DEPLOYED</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
