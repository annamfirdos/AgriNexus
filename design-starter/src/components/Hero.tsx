import { motion } from 'framer-motion';
import FadingVideo from './FadingVideo';
import BlurText from './BlurText';
import { ArrowUpRight, Play, ClockIcon, GlobeIcon } from './icons';

// Swap in real drone / field footage once you have it — a single URL, or an
// array of clips FadingVideo will cycle through. Left empty, the hero falls
// back to the animated ambient-field gradient defined in index.css.
const HERO_VIDEO: string | undefined = undefined;

const NAV_LINKS = ['Platform', 'Method', 'Impact', 'Stories', 'Contact'];
const PARTNERS = ['Kisan Bazaar', 'AgriTrust', 'GreenLoop', 'Harvestly', 'FieldWorks'];

const fadeUp = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      <FadingVideo
        src={HERO_VIDEO}
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: '120%', height: '120%' }}
      />
      <div className="grain z-[1]" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16">
          <div className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center">
            <span className="font-heading italic text-2xl">A</span>
          </div>

          <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body">
                {link}
              </a>
            ))}
            <a
              href="#contact"
              className="ml-1 flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium font-body"
            >
              Book a Demo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="h-12 w-12" />
        </nav>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="liquid-glass rounded-full flex items-center gap-2 pl-1.5 pr-4 py-1.5"
          >
            <span className="rounded-full bg-white text-black text-xs font-semibold font-body px-2.5 py-1">
              Live
            </span>
            <span className="text-sm text-white/90 font-body">
              Now onboarding farms for the Rabi 2026 season
            </span>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }} className="mt-6 max-w-3xl">
            <BlurText
              text="Farming Decisions Built to Outlast Bad Seasons"
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-4px]"
            />
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight"
          >
            AgriNexus connects soil, water, weather and market data into one system, so your next
            decision on the field is backed by evidence, not a guess. Built with agronomists, priced
            for a smallholder's budget.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
            className="mt-6 flex items-center gap-6"
          >
            <a href="#contact" className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium font-body">
              Get Your Farm Plan
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <button className="flex items-center gap-2 text-sm font-medium font-body text-white/90">
              <Play className="h-4 w-4" />
              Watch the Film
            </button>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
            className="mt-8 flex gap-4"
          >
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <ClockIcon className="h-5 w-5 text-white/80" />
              <div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4">48 Hours</div>
              <div className="mt-2 text-xs text-white/70 font-body">From soil test to a full-season plan</div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <GlobeIcon className="h-5 w-5 text-white/80" />
              <div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4">12,000+</div>
              <div className="mt-2 text-xs text-white/70 font-body">Farms guided across six states</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom trust bar */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 pb-8"
        >
          <div className="liquid-glass rounded-full px-4 py-2 text-xs text-white/80 font-body">
            Trusted by farmer collectives, input dealers, and district agriculture offices
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 md:gap-x-16 px-6">
            {PARTNERS.map((name) => (
              <span key={name} className="font-heading italic text-2xl md:text-3xl tracking-tight text-white/85">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
