import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "62px 68px 58px",
          background:
            "radial-gradient(circle at 84% 12%, rgba(169,145,255,.22), transparent 31%), linear-gradient(135deg, #101316 0%, #121720 58%, #171525 100%)",
          color: "#f4f4ef",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
            <div
              style={{
                display: "flex",
                gap: 4,
                width: 42,
                height: 42,
                transform: "skew(-11deg)",
              }}
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    width: 11,
                    height: 38,
                    marginTop: index === 1 ? -5 : 0,
                    border: "2px solid #a991ff",
                    background:
                      index === 1
                        ? "rgba(169,145,255,.52)"
                        : "rgba(169,145,255,.12)",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 750,
                letterSpacing: "-1.1px",
              }}
            >
              Auto
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#91ead0",
              fontSize: 16,
              fontWeight: 650,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#72e2c0",
              }}
            />
            Open-source product engineering system
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 960 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 590,
              letterSpacing: "-4.3px",
            }}
          >
            AI coding. Reliable enough
          </div>
          <div
            style={{
              display: "flex",
              color: "#a991ff",
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 590,
              letterSpacing: "-4.3px",
            }}
          >
            for real products.
          </div>
          <div
            style={{
              display: "flex",
              width: 900,
              marginTop: 31,
              color: "#b4bbc4",
              fontSize: 25,
              lineHeight: 1.42,
              letterSpacing: "-0.4px",
            }}
          >
            One repository-aware system for architecture, design, implementation,
            QA, security, and delivery.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,.14)",
            color: "#f4f4ef",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span>Build consistently</span>
            <span style={{ color: "#646c76" }}>·</span>
            <span>Verify deliberately</span>
            <span style={{ color: "#646c76" }}>·</span>
            <span>Ship with evidence</span>
          </div>
          <div style={{ display: "flex", color: "#a991ff", fontWeight: 700 }}>
            buildwithauto.ai
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
