import Hero from "@/components/home/Hero";
import { FaqSection, FinalCta, HowItWorks, Services, Testimonials } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
      <FinalCta />
    </>
  );
}
