import { Diamond, Plus } from 'lucide-react';

type BulletItem = {
  text: string;
  price?: string;
};

type InfoCard = {
  title: string;
  type: 'included' | 'addon';
  bullets: BulletItem[];
};

type CardGroup = {
  label: string;
  cards: [InfoCard, InfoCard];
};

const CARD_GROUPS: CardGroup[] = [
  {
    label: 'Cocktail Hour',
    cards: [
      {
        title: "What's Always Included",
        type: 'included',
        bullets: [
          { text: '1 hour of passed service by Gilbertsville staff' },
          { text: '4 hors d\'oeuvre selections (cold & hot)' },
          { text: 'All platters, serving ware & napkins provided' },
          { text: 'Bar service runs concurrently' },
        ],
      },
      {
        title: 'Add-On Options',
        type: 'addon',
        bullets: [
          { text: '5th hors d\'oeuvre selection', price: '+$8pp' },
          { text: 'Premium item upcharges', price: '+$1–$7pp per item' },
          { text: 'Display stations (Harvest Board, Raw Bar, etc.)', price: 'priced separately pp' },
        ],
      },
    ],
  },
  {
    label: 'Reception Dinner (Family Style)',
    cards: [
      {
        title: 'Base Package — $105pp includes:',
        type: 'included',
        bullets: [
          { text: 'Artisan bread service' },
          { text: '1 farm salad' },
          { text: '1 pasta or grain' },
          { text: '2 protein entrées' },
          { text: '2 vegetables or starches' },
          { text: 'All family-style platters, service & staffing' },
        ],
      },
      {
        title: 'Build It Up — Available Add-Ons',
        type: 'addon',
        bullets: [
          { text: '2nd salad', price: '+$8pp' },
          { text: '2nd pasta or grain', price: '+$12pp' },
          { text: '3rd entrée', price: '+$22pp' },
          { text: '3rd side', price: '+$8pp' },
          { text: 'Premium item upcharges vary by selection' },
        ],
      },
    ],
  },
  {
    label: 'Bar Service (All Events)',
    cards: [
      {
        title: 'Reception Bar — Always Includes',
        type: 'included',
        bullets: [
          { text: '8 full hours of open bar service' },
          { text: 'Licensed, trained Gilbertsville bartenders' },
          { text: 'All glassware, ice & bar equipment' },
          { text: 'Non-alcoholic options (water, sodas, juices)' },
          { text: 'All packages include house beer & wine (see Bar Packages tab for full lists)' },
        ],
      },
      {
        title: 'Rehearsal Dinner Bar — Always Includes',
        type: 'included',
        bullets: [
          { text: '3 hours of open bar service' },
          { text: 'Full house spirits, beer & wine' },
          { text: 'All glassware, ice & service' },
          { text: 'Priced at $36pp' },
        ],
      },
    ],
  },
  {
    label: 'After-Party & Welcome Party',
    cards: [
      {
        title: 'Welcome Party — $45pp',
        type: 'included',
        bullets: [
          { text: '2 hours of service' },
          { text: 'Full open bar' },
          { text: 'Bonfire & s\'mores station' },
          { text: 'Dessert selection' },
        ],
      },
      {
        title: 'After-Party — $3,500 flat',
        type: 'included',
        bullets: [
          { text: '2 hours · up to 100 guests' },
          { text: 'Bar extension from reception service' },
          { text: '1 late-night food selection' },
          { text: 'Full staffing & setup' },
        ],
      },
    ],
  },
  {
    label: 'Breakfast, Brunch & Lunch Events',
    cards: [
      {
        title: "What's Always Included",
        type: 'included',
        bullets: [
          { text: 'Buffet-style service with full staffing' },
          { text: 'Coffee, tea & juice service' },
          { text: 'All tableware, linens & setup' },
          { text: 'Served in the Chandelier Hall or outdoor spaces' },
        ],
      },
      {
        title: 'Brunch Add-Ons Available',
        type: 'addon',
        bullets: [
          { text: 'Mimosa Bar', price: '+$20pp' },
          { text: 'Bloody Mary Bar', price: '+$20pp' },
        ],
      },
    ],
  },
];

function BulletLine({ item, type }: { item: BulletItem; type: 'included' | 'addon' }) {
  return (
    <li className="flex items-start gap-2.5 py-[5px]">
      {type === 'included' ? (
        <Diamond size={10} className="text-sage mt-[5px] shrink-0 fill-sage" />
      ) : (
        <Plus size={12} className="text-warm mt-[4px] shrink-0" strokeWidth={2.5} />
      )}
      <span className="font-serif text-[15px] italic text-text-muted-brand leading-[1.6]">
        {item.text}
        {item.price && (
          <span className="not-italic font-semibold text-text-brand"> — {item.price}</span>
        )}
      </span>
    </li>
  );
}

function InfoCardComponent({ card }: { card: InfoCard }) {
  return (
    <div className="bg-white rounded-lg p-7 shadow-card">
      <h4 className="font-serif text-[20px] font-light text-grove mb-4 leading-[1.3]">
        {card.title}
      </h4>
      <ul className="space-y-0.5">
        {card.bullets.map((b, i) => (
          <BulletLine key={i} item={b} type={card.type} />
        ))}
      </ul>
    </div>
  );
}

export function BasicsContent() {
  return (
    <div>
      {/* Intro block */}
      <div className="mb-10">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[10px]">
          How It All Works
        </p>
        <h2
          className="font-serif font-light text-grove leading-[1.15] mb-3"
          style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          What's Included in Every Event
        </h2>
        <p className="font-serif text-[15px] italic text-text-muted-brand max-w-[640px] leading-[1.75]">
          Every food &amp; beverage event at Gilbertsville Farmhouse is built from the same
          foundation — fresh, scratch-made food, attentive service, and beautiful presentation.
          Here's what's always included, by event type.
        </p>
        <div className="w-[60px] h-px bg-sage-light mt-5 mb-9" />
      </div>

      {/* Card groups */}
      <div className="space-y-10">
        {CARD_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-cream-dark" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.cards.map((card, i) => (
                <InfoCardComponent key={i} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
