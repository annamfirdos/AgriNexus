import FadingVideo from './FadingVideo';
import { LeafDropIcon, ChipIcon, SproutCartIcon } from './icons';

// Swap in real field / control-room footage once you have it.
const CAPABILITIES_VIDEO: string | undefined = undefined;

const CARDS = [
  {
    title: 'Sense',
    Icon: LeafDropIcon,
    tags: ['Soil Sensors', 'Satellite Scans', 'Weather AI', 'Water IoT'],
    body: "We read your fields continuously — soil moisture, nutrient levels, canopy health and hyperlocal weather — turning scattered signals into one live picture of the farm.",
  },
  {
    title: 'Decide',
    Icon: ChipIcon,
    tags: ['Crop AI', 'Yield Models', 'Risk Scoring', 'What-if Simulator'],
    body: 'Every recommendation runs through a model trained on real yields and prices, not averages — so you see the water, cost and risk trade-off before you plant, not after.',
  },
  {
    title: 'Grow',
    Icon: SproutCartIcon,
    tags: ['Market Linkage', 'Logistics', 'Storage', 'Profit Tracking'],
    body: 'Launch is the easy part. We stay with you through harvest, storage and sale — pooling loads, tracking prices, and closing the loop into next season\u2019s plan.',
  },
];

export default function Capabilities() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <FadingVideo src={CAPABILITIES_VIDEO} className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="grain z-[1]" />
      <div className="absolute inset-0 z-[1] bg-black/45" />

      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        <div className="mb-auto">
          <div className="text-sm font-body text-white/80 mb-6">// The Platform</div>
          <h2 className="font-heading italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
            Every acre,
            <br />
            end to end
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map(({ title, Icon, tags, body }) => (
            <div key={title} className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center">
                  <Icon />
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <div>
                <div className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none">{title}</div>
                <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
