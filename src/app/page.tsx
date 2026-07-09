import Hero from '@/components/sections/Hero';
import Principles from '@/components/sections/Principles';
import Portfolio from '@/components/sections/Portfolio';
import ClosingCTA from '@/components/sections/ClosingCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Principles />
      <div id="work">
        <Portfolio />
      </div>
      <ClosingCTA />
    </>
  );
}
