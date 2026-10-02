import type { ReactElement } from "react";
import { OrbitHero } from "@/registry/gear5/ui/orbit-hero";
import { ProjectShowcase } from "@/registry/gear5/ui/project-showcase";
import { ProjectGallery } from "@/registry/gear5/ui/project-gallery";
import { FeatureSwitcher } from "@/registry/gear5/ui/feature-switcher";
import { SpotlightBento } from "@/registry/gear5/ui/spotlight-bento";
import { PricingSwitch } from "@/registry/gear5/ui/pricing-switch";
import { TestimonialDeck } from "@/registry/gear5/ui/testimonial-deck";
import { PortfolioTemplate } from "@/registry/gear5/ui/portfolio-template";
export const fixtures: Record<string, () => ReactElement> = {
  "orbit-hero": () => <OrbitHero />,
  "project-showcase": () => <ProjectShowcase />,
  "project-gallery": () => <ProjectGallery />,
  "feature-switcher": () => <FeatureSwitcher />,
  "spotlight-bento": () => <SpotlightBento />,
  "pricing-switch": () => <PricingSwitch />,
  "testimonial-deck": () => <TestimonialDeck />,
  "portfolio-template": () => <PortfolioTemplate />,
};
