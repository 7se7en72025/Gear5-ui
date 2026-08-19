import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gear5 UI — components for agent interfaces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#141518",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#67d3ee",
            }}
          />
          <div style={{ fontSize: 26, color: "#f5f6f7", letterSpacing: -0.5 }}>
            Gear5 UI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              color: "#f5f6f7",
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            The interface around
          </div>
          <div
            style={{
              fontSize: 68,
              color: "#f5f6f7",
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            your agent loop
          </div>
          <div style={{ fontSize: 28, color: "#9aa0a6", marginTop: 28 }}>
            Approvals, tool calls, traces, and diffs — headless and accessible.
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#6f757c" }}>
          <div>24 components</div>
          <div>·</div>
          <div>Headless + styled</div>
          <div>·</div>
          <div>MIT</div>
        </div>
      </div>
    ),
    size,
  );
}
