export const EXAMPLES: Record<string, string> = {
  "orbit-hero": `import { OrbitHero } from "@/components/gear5/orbit-hero";
export default function Hero() {
  return <OrbitHero headingLevel="h1" title={"Ideas into\\nsomething real."}
    accent="#d9fc87"
    action={{ label: "See my work", href: "#work" }}
    secondaryAction={{ label: "Get in touch", href: "mailto:you@example.com" }} />;
}`,
  "project-showcase": `import { ProjectShowcase } from "@/components/gear5/project-showcase";
export default function Work() {
  return <ProjectShowcase projects={[{
    id: "studio", title: "Studio", category: "Brand & web design",
    description: "The story behind the project.", href: "/work/studio",
    symbol: "s.", color: "#d5e6d3",
  }]} />;
}`,
  "feature-switcher": `import { FeatureSwitcher } from "@/components/gear5/feature-switcher";
export default function Features() {
  return <FeatureSwitcher title="Your process, made visible." features={[
    { id: "design", label: "Design", title: "Every detail matters.",
      description: "A visual system with character.", visual: <div>Your product preview</div> },
    { id: "build", label: "Build", title: "Ready for the real world.",
      description: "From idea to launch.", visual: <div>Your second preview</div> },
  ]} />;
}`,
  "pricing-switch": `import { PricingSwitch } from "@/components/gear5/pricing-switch";
export default function Pricing() {
  return <PricingSwitch plans={[{
    id: "pro", name: "Pro", description: "For your next big thing.",
    monthlyPrice: "$29", yearlyPrice: "$24",
    monthlyNote: "$29 billed each month", yearlyNote: "$288 billed once a year",
    features: ["Unlimited projects", "Priority support"],
    href: "/signup", featured: true,
  }]} />;
}`,
  "testimonial-deck": `import { TestimonialDeck } from "@/components/gear5/testimonial-deck";
export default function Testimonials() {
  return <TestimonialDeck testimonials={[
    { id: "one", quote: "Replace this with a real, permitted quote.",
      name: "Your client", role: "Their role, Company" },
  ]} />;
}`,
  "portfolio-template": `import { PortfolioTemplate } from "@/components/gear5/portfolio-template";
export default function Portfolio() {
  return <PortfolioTemplate name="Your name" initials="yn."
    email="you@example.com" accent="#d9fc87"
    title={"Thoughtful design.\\nUnexpected details."}
    description="Describe the work you do and the people you help."
    projects={[{
      id: "studio", title: "Studio", category: "Brand & web design",
      description: "The story behind the project.", href: "/work/studio",
      symbol: "s.", color: "#d5e6d3",
    }]}
    testimonials={[]}
    services={[]}
  />;
}`,
};
export const BLOCK_NOTES: Record<string, string[]> = {
  "orbit-hero": [
    "Set headingLevel to h1 for your page hero; the default h2 suits embedded sections.",
    "Pointer tilt is decorative and disabled by the user’s reduced-motion preference. Touch users get the same content and actions.",
    "Change artworkLabels, mark, accent, action, and secondaryAction to match your site.",
  ],
  "project-showcase": [
    "Each card uses native details/summary. Click, tap, Space, or Enter to open a case study.",
    "Bring unique project ids and your own titles, descriptions, colors, symbols, and links.",
    "No image request or animation package is required. You can edit the source to add project artwork.",
  ],
  "feature-switcher": [
    "Arrow keys move and select tabs; Home and End reach the first and last. Direction follows the surrounding layout.",
    "Pass a React node as each feature’s visual to display your product preview.",
    "The default bars are decorative artwork, not analytics or real measurements.",
  ],
  "pricing-switch": [
    "Monthly and yearly controls use native radio buttons with keyboard support.",
    "Supply price strings and billing notes explicitly, in your customer’s language and currency.",
    "This block displays your plans. Connect the href for each plan to your own checkout or enquiry page.",
  ],
  "testimonial-deck": [
    "Previous and next wrap around. Navigation stays manual; there is no autoplay.",
    "The active quote is announced without moving keyboard focus.",
    "Default quotes are labelled examples. Replace them with real quotes you have permission to publish.",
  ],
};
