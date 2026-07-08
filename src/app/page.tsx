import Hero from '@/components/sections/Hero';
import Principles from '@/components/sections/Principles';
import Portfolio from '@/components/sections/Portfolio';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Inquiry from '@/components/sections/Inquiry';
import ClosingCTA from '@/components/sections/ClosingCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Principles />
      <Portfolio />
      <About />
      <Services />
      <Inquiry />
      <ClosingCTA />
    </>
  );
}
