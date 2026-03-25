// ─────────────────────────────────────────────
//  HARVEST 336 — MENU DATA
//  Edit ONLY this file to update menu content.
// ─────────────────────────────────────────────

export type DietTag = 'veg' | 'vegan' | 'gf' | 'df';

export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  diet?: DietTag[];
  note?: string;
};

export type PackageCard = {
  title: string;
  price: string;
  description: string;
};

export type AccordionGroup = {
  title: string;
  subtitle?: string;
  price?: string;
  emoji?: string;
  body: string;
};

export type MenuSection = {
  id: string;
  label: string;
  emoji?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  description?: string;
  items?: MenuItem[];
  itemGroups?: { label: string; items: MenuItem[] }[];
  packages?: PackageCard[];
  accordions?: AccordionGroup[];
};

// ─── SECTION DATA ────────────────────────────

export const menuSections: MenuSection[] = [
  // ── 1. THE BASICS ──────────────────────────────────────────────────────
  {
    id: 'basics',
    label: 'The Basics',
    sectionTitle: 'The Foundation of Every Weekend',
    description:
      'Included in every Gilbertsville wedding: a welcome hour, cocktail hour, and seated reception dinner. These are the bones. Everything else builds from here.',
    packages: [
      {
        title: 'Site Fee',
        price: 'Starting at $12,500',
        description:
          'Exclusive access to 125 acres, all event spaces, and 41 guest cottages for your full wedding weekend.',
      },
      {
        title: 'Catering',
        price: 'Quoted separately',
        description:
          'All food and beverage is custom-quoted based on your guest count, menu selections, and service style.',
      },
      {
        title: 'Lodging',
        price: 'Guest-paid',
        description:
          'On-site lodging for up to 82 guests across 41 private cottages. Billed directly to your guests — not included in the site fee.',
      },
    ],
  },

  // ── 2. REHEARSAL DINNER ────────────────────────────────────────────────
  {
    id: 'rehearsal',
    label: 'Rehearsal Dinner',
    sectionTitle: 'The Night Before',
    description:
      'Intimate, unhurried, and intentionally warm. The rehearsal dinner sets the tone for the weekend.',
    items: [
      { name: 'Roasted Chicken with Pan Jus & Seasonal Vegetables', diet: ['gf'], price: '$38pp' },
      { name: 'Pan Seared Salmon with Lemon Caper Butter', diet: ['gf'], price: '$42pp' },
      { name: 'Grilled NY Strip with Herb Butter & Roasted Potatoes', diet: ['gf'], price: '$52pp' },
      { name: 'Pasta Primavera with Farm Vegetables & Parmesan', diet: ['veg'], price: '$32pp' },
      { name: 'Caesar Salad with House-Made Croutons', diet: ['veg'], price: '$14pp' },
      {
        name: 'Seasonal Mixed Greens with Champagne Vinaigrette',
        diet: ['veg', 'vegan', 'gf', 'df'],
        price: '$12pp',
      },
      {
        name: 'Roasted Root Vegetable Medley',
        diet: ['veg', 'vegan', 'gf', 'df'],
        price: '$11pp',
      },
      { name: 'Warm Bread Service with Cultured Butter', diet: ['veg'], price: '$6pp' },
    ],
  },

  // ── 3. WELCOME HOUR ────────────────────────────────────────────────────
  {
    id: 'welcome',
    label: 'Welcome Hour',
    sectionTitle: 'The Arrival',
    description:
      'Friday evening. Guests arrive, bags dropped, first drinks poured. The welcome hour is the exhale.',
    items: [
      {
        name: 'Whipped Ricotta Crostini with Estate Honey & Thyme',
        diet: ['veg'],
        price: '$6pp',
        note: 'passed',
      },
      {
        name: 'Prosciutto-Wrapped Melon with Aged Balsamic',
        diet: ['gf', 'df'],
        price: '$7pp',
        note: 'passed',
      },
      {
        name: 'Smoked Salmon Blinis with Crème Fraîche & Dill',
        price: '$8pp',
        note: 'passed',
      },
      {
        name: 'Caprese Skewers with House-Made Pesto',
        diet: ['veg', 'gf'],
        price: '$6pp',
        note: 'passed',
      },
      {
        name: 'Beef Tenderloin Crostini with Horseradish Cream',
        price: '$9pp',
        note: 'passed',
      },
      { name: 'Brie & Fig Jam Phyllo Cup', diet: ['veg'], price: '$7pp', note: 'passed' },
      {
        name: 'Shrimp Cocktail with House Bloody Mary Sauce',
        diet: ['gf', 'df'],
        price: '$9pp',
        note: 'passed',
      },
      {
        name: 'Charcuterie & Cheese Board',
        diet: ['veg'],
        price: '$18pp',
        note: 'stationed',
      },
      {
        name: 'Seasonal Crudité with Herb Dip',
        diet: ['veg', 'vegan', 'gf', 'df'],
        price: '$10pp',
        note: 'stationed',
      },
    ],
  },

  // ── 4. COCKTAIL HOUR ───────────────────────────────────────────────────
  {
    id: 'cocktail',
    label: 'Cocktail Hour',
    sectionTitle: 'Between Ceremony & Celebration',
    description:
      'Cocktail hour is where the party actually begins. Guests mingle, the bar opens, bites circulate.',
    items: [
      { name: 'Duck Confit Crostini with Cherry Gastrique', price: '$11pp', note: 'passed' },
      { name: 'Lobster Bisque Shooter', diet: ['gf'], price: '$12pp', note: 'passed' },
      {
        name: 'Grilled Flatbread with Caramelized Onion & Gruyère',
        diet: ['veg'],
        price: '$8pp',
        note: 'passed',
      },
      {
        name: 'Lamb Chop Lollipop with Mint Chimichurri',
        diet: ['gf', 'df'],
        price: '$14pp',
        note: 'passed',
      },
      {
        name: 'Watermelon & Feta Skewer with Mint',
        diet: ['veg', 'gf'],
        price: '$7pp',
        note: 'passed',
      },
      {
        name: 'Tuna Tartare on Wonton Crisp with Sesame & Scallion',
        price: '$10pp',
        note: 'passed',
      },
      {
        name: 'Foie Gras Torchon with Brioche Toast & Sour Cherry',
        price: '$16pp',
        note: 'passed',
      },
      {
        name: 'Burrata with Heirloom Tomato & Basil Oil',
        diet: ['veg', 'gf'],
        price: '$14pp',
        note: 'stationed',
      },
      {
        name: 'Oysters on the Half Shell with Mignonette',
        diet: ['gf', 'df'],
        price: '$18pp',
        note: 'stationed',
      },
    ],
  },

  // ── 5. RECEPTION ───────────────────────────────────────────────────────
  {
    id: 'reception',
    label: 'Reception',
    sectionTitle: 'The Main Event',
    description:
      'Seated dinner service for your full guest list. All reception menus include salad, entrée, starch, vegetable, and bread service.',
    itemGroups: [
      {
        label: 'Salads',
        items: [
          {
            name: 'Wedge Salad with House Bacon, Blue Cheese & Tomato',
            diet: ['gf'],
            price: '$14pp',
          },
          {
            name: 'Arugula with Shaved Parmesan, Lemon & EVOO',
            diet: ['veg', 'gf'],
            price: '$13pp',
          },
          {
            name: 'Roasted Beet Salad with Goat Cheese & Candied Walnuts',
            diet: ['veg', 'gf'],
            price: '$14pp',
          },
        ],
      },
      {
        label: 'Entrées',
        items: [
          {
            name: 'Filet Mignon with Red Wine Reduction & Truffle Butter',
            diet: ['gf'],
            price: '$68pp',
          },
          { name: 'Roasted Airline Chicken with Natural Jus', diet: ['gf'], price: '$48pp' },
          { name: 'Pan-Seared Halibut with Lemon Beurre Blanc', diet: ['gf'], price: '$58pp' },
          { name: 'Braised Short Rib with Gremolata', diet: ['gf', 'df'], price: '$62pp' },
          { name: 'Wild Mushroom Risotto', diet: ['veg', 'gf'], price: '$42pp' },
        ],
      },
      {
        label: 'Starches & Sides',
        items: [
          { name: 'Truffle Whipped Potatoes', diet: ['veg', 'gf'], price: '$8pp' },
          {
            name: 'Roasted Fingerling Potatoes with Herbs',
            diet: ['veg', 'vegan', 'gf', 'df'],
            price: '$7pp',
          },
          { name: 'Wild Rice Pilaf', diet: ['veg', 'vegan', 'gf', 'df'], price: '$7pp' },
          {
            name: 'Haricot Verts with Almonds & Lemon',
            diet: ['veg', 'vegan', 'gf', 'df'],
            price: '$8pp',
          },
          { name: 'Honey-Glazed Roasted Carrots', diet: ['veg', 'gf'], price: '$7pp' },
        ],
      },
    ],
  },

  // ── 6. DESSERTS ────────────────────────────────────────────────────────
  {
    id: 'desserts',
    label: 'Desserts',
    sectionTitle: 'Sweet Finishes, Made from Scratch',
    description:
      'Individual dessert selections are $8 per person each. Build a Farmhouse Dessert Table with any four selections for $25pp — or add an Espresso Bar for $6pp.',
    packages: [
      {
        title: 'Farmhouse Dessert Table',
        price: '$25pp',
        description: 'Choose any 4 desserts. Presented as a beautiful self-serve station.',
      },
      {
        title: 'Espresso Bar Station',
        price: '$6pp',
        description:
          'House-made biscotti & seasonal syrups. The perfect cap to the night.',
      },
    ],
    items: [
      { name: 'Homemade Cookies, Blondies & Brownies', diet: ['veg'], price: '$8pp' },
      { name: 'Fresh Seasonal Fruit Galettes', diet: ['veg'], price: '$8pp' },
      {
        name: 'Tres Leches Cake with Berry Compote & Buttermilk Sweet Cream',
        diet: ['veg'],
        price: '$8pp',
      },
      { name: 'Chocolate Espresso Cake with Berry Coulis', diet: ['veg'], price: '$8pp' },
      { name: 'Homemade Key Lime Cake', diet: ['veg'], price: '$8pp' },
      { name: 'Fresh Seasonal Pies', diet: ['veg'], price: '$8pp' },
      {
        name: 'Apple Tartlets with Vanilla Ice Cream & Caramel Sauce',
        diet: ['veg'],
        price: '$9pp',
      },
      { name: 'New York Cheesecake with Toppings', diet: ['veg'], price: '$10pp' },
      {
        name: 'Warm Chocolate Soufflé Cake with Armagnac Chantilly',
        diet: ['veg'],
        price: '$11pp',
      },
      { name: 'Creole Bread Pudding with Whiskey Sauce', diet: ['veg'], price: '$10pp' },
    ],
  },

  // ── 7. WEEKEND PACKAGES ────────────────────────────────────────────────
  {
    id: 'packages',
    label: 'Weekend Packages',
    sectionTitle: 'The Full Weekend, Priced Simply',
    description:
      'Bundle your food & beverage into one clean per-person price. All packages include welcome hour, cocktail hour, and reception dinner service.',
    packages: [
      {
        title: 'Essential Weekend',
        price: '$95pp',
        description:
          'Welcome hour with 3 passed bites, cocktail hour with 4 passed bites, plated reception with salad + 1 entrée + 2 sides + bread, non-alcoholic beverages.',
      },
      {
        title: 'Estate Weekend',
        price: '$135pp',
        description:
          'Everything in Essential, plus 5 passed bites each at welcome & cocktail hour, choice of 2 entrées (duet plate), 3 sides, upgraded bread service, coffee & tea service.',
      },
      {
        title: 'White Glove Weekend',
        price: '$185pp',
        description:
          'Everything in Estate, plus stationed displays at cocktail hour, 3-course plated reception, sommelier-selected wine pairings, full dessert table, espresso bar, midnight snack station.',
      },
    ],
  },

  // ── 8. BAR PACKAGES ────────────────────────────────────────────────────
  {
    id: 'bar',
    label: 'Bar',
    sectionTitle: 'The Bar',
    description:
      'All bar packages include professional bartenders, mixers, garnishes, glassware, and non-alcoholic options.',
    accordions: [
      {
        title: 'Beer, Wine & Signature Drinks',
        price: '$42pp',
        emoji: '🍷',
        subtitle: 'Curated selection',
        body: 'A rotating selection of regional craft beers, house red and white wines, and two bespoke signature cocktails crafted around your wedding weekend. Perfect for couples who want great drinks without a full open bar.',
      },
      {
        title: 'Premium Open Bar',
        price: '$58pp',
        emoji: '🥃',
        subtitle: 'Full spirits',
        body: 'Full spirits bar featuring premium vodka, gin, bourbon, rum, and tequila. Premium wine list curated by our sommelier. Full draft and bottle beer selection. Signature cocktails included. Professional bartenders throughout.',
      },
      {
        title: 'White Glove Open Bar',
        price: '$72pp',
        emoji: '✨',
        subtitle: 'Top shelf & sommelier-curated',
        body: 'Top-shelf spirits across all categories. Sommelier-curated wine program with estate and boutique selections. Full bar service. Champagne toast for all guests. Dedicated cocktail station with custom garnish board. The gold standard.',
      },
    ],
  },
];
