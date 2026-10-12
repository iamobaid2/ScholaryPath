import Hero from "@/components/home/Hero";
import { FaqSection, FinalCta, HowItWorks, Services } from "@/components/home/Sections";
import { ReviewsSection, ShowcaseSection } from "@/components/home/Work";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <ShowcaseSection />
      <ReviewsSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
