import { ImageResponse } from "next/og";
export const alt =
  "Gear5 UI — Make the web feel something. Expressive React blocks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#0b0c0e",
          color: "#f4f4ef",
          padding: 70,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <span style={{ color: "#d9fc87" }}>GEAR5 / UI</span>
          <span>COLLECTION 01</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            lineHeight: 1.05,
            letterSpacing: -5,
          }}
        >
          <span>Make the web</span>
          <span style={{ color: "#d9fc87" }}>feel something.</span>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #34383b",
            paddingTop: 25,
            fontSize: 23,
          }}
        >
          Expressive React blocks. Source you own.
        </div>
      </div>
    ),
    size,
  );
}
