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
  "project-gallery": `import { ProjectGallery, type GalleryProject } from "@/components/gear5/project-gallery";
const projects: GalleryProject[] = [
  { id: "studio", category: "Identity", title: "Studio",
    description: "A new identity for an independent practice.",
    artworkAlt: "Abstract graphic for the Studio identity.",
    href: "/work/studio",
    artwork: <div className="flex aspect-[5/4] items-center justify-center bg-stone-200 text-7xl">S.</div> },
];
export default function Work() {
  return <ProjectGallery projects={projects} title="Selected work." />;
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
  "spotlight-bento": `import { SpotlightBento, type BentoFeature } from "@/components/gear5/spotlight-bento";
const features: BentoFeature[] = [
  { id: "direction", eyebrow: "01 / POINT OF VIEW",
    title: "Make it unmistakably yours.",
    description: "A considered identity that travels across every detail.",
    size: "wide", visual: <div aria-hidden="true">Your brand artwork</div> },
  { id: "launch", eyebrow: "02 / READY TO SHIP",
    title: "From idea to open doors.",
    description: "Show people what changes when they choose your product.",
    href: "/get-started" },
];
export default function Story() {
  return <SpotlightBento features={features} title="Good work, made visible." />;
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
  "project-gallery": [
    "Use artwork for your locally hosted, optimized project image or SVG. The caller controls image loading and alt text.",
    "Filters and project choices are buttons; arrow keys, Home, and End move through the visible projects.",
    "The example artwork and portfolio names are fictional. Replace them with images you can publish.",
  ],
  "spotlight-bento": [
    "Use standard, wide, and tall sizes to give important stories more space.",
    "Artwork is a caller-supplied React node, so add lightweight SVG or existing UI without a runtime dependency.",
    "Pointer lighting stops for touch and reduced-motion preferences; every feature remains ordinary readable content.",
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
