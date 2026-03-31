import { Diamond, Plus } from 'lucide-react';

const nonAlcoholicItems = ['Lemonade', 'Unsweetened or Sweetened Iced Tea'];

const infusedWaters = [
  'Lavender Lemon',
  'Strawberry Mint',
  'Watermelon Basil & Lime',
  'Cucumber Lemon',
  'Blackberry Mint Orange',
  'Strawberry Basil',
  'Blueberry Lime Raspberry',
  'Lemon Ginger',
  'Apple Cinnamon Water',
  'Hot Apple Cider',
];

const spritzers = [
  'Classic Citrus Spritzer with lemon & lime',
  'Mixed Berry Spritzer with strawberries & raspberries',
  'Blackberry Mint Spritzer with lime',
  'Watermelon Basil Spritzer',
  'Sparkling Strawberry Limoncello Spritzer',
  'Raspberry Lemon Blush Sangria',
  'Sparkling Apple Cider Ginger Spritzer',
  'Pumpkin Spice Spritzer with Cinnamon Stick',
];

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 font-sans text-[12px] text-charcoal/80 leading-[1.5]">
      <Diamond size={8} className="text-sage fill-sage mt-[5px] shrink-0" />
      <span>{text}</span>
    </li>
  );
}

export function WelcomeTableContent() {
  return (
    <div>
      {/* Section header */}
      <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[10px]">
        Welcome Table
      </p>
      <p className="font-serif italic text-text-muted-brand max-w-[640px] leading-[1.75] mb-9 text-base text-primary">
        Service Included: Your welcome beverages are displayed at the welcome table as guests arrive before the ceremony. All drinks are served station-style in cocktail cups at no additional charge — this service is included in your reception pricing.
      </p>

      {/* Two cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* LEFT — Non-Alcoholic */}
        <div className="bg-white rounded-[10px] border border-cream-dark p-6">
          <h3 className="font-serif text-[15px] font-medium text-charcoal mb-4">
            Non-Alcoholic Selections — Choose 2
          </h3>
          <ul className="space-y-1.5 mb-5">
            {nonAlcoholicItems.map((item) => (
              <BulletItem key={item} text={item} />
            ))}
          </ul>
          <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-warm mb-3">
            Infused Flavored Waters
          </p>
          <ul className="space-y-1.5">
            {infusedWaters.map((item) => (
              <BulletItem key={item} text={item} />
            ))}
          </ul>
        </div>

        {/* RIGHT — Wine Spritzers */}
        <div className="bg-white rounded-[10px] border border-cream-dark p-6">
          <h3 className="font-serif text-[15px] font-medium text-charcoal mb-4">
            Wine Spritzers — Choose 1
          </h3>
          <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-warm mb-3">
            Sauvignon Blanc · Pinot Grigio · Rosé
          </p>
          <ul className="space-y-1.5">
            {spritzers.map((item) => (
              <BulletItem key={item} text={item} />
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-8" style={{ backgroundColor: '#E8E2D9' }} />

      {/* Service Included */}
      <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[6px]">
        Service Included
      </p>
      <p className="font-serif text-[14px] italic text-text-muted-brand leading-[1.75] mb-6">
        {"\n"}
      </p>

      {/* Upgrade banner */}
      <div
        className="rounded-[8px] px-6 py-5 flex items-start gap-3"
        style={{ backgroundColor: '#2C3E2D' }}
      >
        <Plus size={14} className="text-warm mt-[2px] shrink-0" />
        <div>
          <p className="font-sans text-[12px] text-cream/90 leading-[1.6] tracking-[0.05em] uppercase">
            Upgrade Your Service —{' '}
            <span className="not-italic" style={{ color: '#C9A84C' }}>$8pp</span>
            {' '}per person
          </p>
          <p className="font-serif italic text-cream/55 leading-[1.6] mt-1 text-sm">
            Passed drink service by Gilbertsville staff · served in glassware · includes Saratoga still &amp; sparkling water
          </p>
        </div>
      </div>
    </div>
  );
}
