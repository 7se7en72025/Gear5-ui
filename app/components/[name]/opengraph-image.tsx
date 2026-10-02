import { ImageResponse } from "next/og";
import { TIER_BUDGETS, components, getItem } from "@/lib/registry";

export const alt = "Gear5 UI component";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return components.map((item) => ({ name: item.name }));
}

export default async function ComponentOpengraphImage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = getItem(name);
  const budget = item?.tier ? TIER_BUDGETS[item.tier] : undefined;

  // Satori requires an explicit `display` on any element with more than one
  // child, and treats an interpolated expression as its own child — so every
  // string is assembled here rather than inline in JSX.
  const eyebrow = item?.category
    ? `GEAR5 UI · ${item.category.toUpperCase()}`
    : "GEAR5 UI";
  const facts = [
    "React + Tailwind",
    budget ? `${budget} B gzip ceiling` : null,
    "Keyboard · reduced motion",
  ].filter((fact): fact is string => fact !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c0e",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 2,
              color: "#d9fc87",
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: -2,
              color: "#f4f4ef",
            }}
          >
            {item?.title ?? "Component"}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#b4b6af",
              lineHeight: 1.4,
            }}
          >
            {item?.description ?? ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 48,
            fontSize: 24,
            color: "#f4f4ef",
            borderTop: "1px solid #34383b",
            paddingTop: 28,
          }}
        >
          {facts.map((fact) => (
            <div key={fact} style={{ display: "flex" }}>
              {fact}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
