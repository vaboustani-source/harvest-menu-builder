// ─── Harvest 336 Menu Builder — Static Data ───

// === TYPES ===

export interface RehearsalTheme {
  id: string;
  name: string;
  price: number;
  season: string;
  dietaryTags: string[];
  items: string[];
  addOn?: { name: string; price: number };
}

export interface WelcomeOption {
  id: string;
  name: string;
  category: 'beverage' | 'infused-water';
}

export interface SpritzerOption {
  id: string;
  name: string;
}

export interface CocktailItem {
  id: string;
  name: string;
  type: 'passed' | 'stationed';
  price: number;
  diet: string[];
}

export interface ReceptionItem {
  id: string;
  name: string;
  price: number;
  diet: string[];
  season: string[];
  subcategory?: string;
}

export interface ReceptionCategory {
  id: string;
  label: string;
  included: number;
  extraPrice: number;
  extraLabel: string;
  items: ReceptionItem[];
}

export interface BuilderSelections {
  rehearsalDinner: {
    themeId: string | null;
    addOnSelected: boolean;
    customThemeNote: string;
  };
  welcomeHour: {
    nonAlcoholic: string[];
    spritzers: string[];
    passedServiceUpgrade: boolean;
    champagneUpgrade: boolean;
  };
  cocktailHour: string[];
  reception: {
    salads: string[];
    pastasGrains: string[];
    proteins: string[];
    vegetablesStarches: string[];
  };
  mealInclusions: {
    mimosaBar: boolean;
    bloodyMaryBar: boolean;
  };
  desserts: {
    notes: string;
  };
  barPackage: {
    notes: string;
  };
}

export const defaultSelections: BuilderSelections = {
  rehearsalDinner: { themeId: null, addOnSelected: false, customThemeNote: '' },
  welcomeHour: { nonAlcoholic: [], spritzers: [], passedServiceUpgrade: false, champagneUpgrade: false },
  cocktailHour: [],
  reception: { salads: [], pastasGrains: [], proteins: [], vegetablesStarches: [] },
  mealInclusions: { mimosaBar: false, bloodyMaryBar: false },
  desserts: { notes: '' },
  barPackage: { notes: '' },
};

// === STEPS ===

export const STEPS = [
  { id: 'rehearsal', label: 'Rehearsal Dinner' },
  { id: 'welcome', label: 'Welcome Hour' },
  { id: 'cocktail', label: 'Cocktail Hour' },
  { id: 'reception', label: 'Reception Dinner' },
  { id: 'inclusions', label: 'Meal Inclusions' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'bar', label: 'Bar Package' },
  { id: 'review', label: 'Review & Submit' },
] as const;

// === REHEARSAL DINNER THEMES ===

export const rehearsalThemes: RehearsalTheme[] = [
  {
    id: 'traditional-italian',
    name: 'Traditional Italian',
    price: 65,
    season: 'Summer (year-round with pantry tomatoes)',
    dietaryTags: ['VG'],
    items: [
      'Antipasto Cheese Board',
      'Arugula Lemon Parmesan Salad',
      'Rigatoni with fresh tomatoes, caramelized onions & marjoram',
      'Classic Chicken Parmesan',
      'Oven Roasted Mushrooms with balsamic, garlic & herbs',
      'Cannolis',
      'Coffee & Tea',
    ],
    addOn: { name: 'Fusilli with creamy three pepper sauce', price: 10 },
  },
  {
    id: 'southern-comfort',
    name: 'Southern Comfort',
    price: 65,
    season: 'Year-Round (cobbler seasonal)',
    dietaryTags: ['GF'],
    items: [
      'Salad of Baby Greens with goat cheese & raspberry-vanilla bean vinaigrette',
      'Fresh Buffalo Mozzarella with bacon marmalade',
      'Pulled BBQ Chicken or Pork with soft buns & slaw',
      'Southern Baked Mac-N-Cheese',
      'Grilled Carrots with lemon aioli, feta, dill & toasted coriander',
      'Blueberry or Peach Cobbler',
      'Coffee & Tea',
    ],
    addOn: { name: 'Slow Cooked Ribs with strawberry cinnamon glaze', price: 15 },
  },
  {
    id: 'asian-fusion',
    name: 'Asian Fusion',
    price: 67,
    season: 'Year-Round',
    dietaryTags: ['GF', 'DF'],
    items: [
      'Kale Salad with mint dressing',
      'Korean BBQ Chicken',
      'Sweet & Spicy Pork Belly with grilled pineapple & steamed buns',
      'Ginger Fried Rice with Shiitake mushrooms',
      'Grilled Baby Bok Choy with miso butter',
      '5-Spice Brownies',
      'Coffee & Tea',
    ],
    addOn: { name: 'Vegetarian Steamed Dumplings with Hoisin dipping sauce', price: 8 },
  },
  {
    id: 'thai-inspired',
    name: 'Thai Inspired',
    price: 67,
    season: 'Year-Round',
    dietaryTags: ['GF', 'DF'],
    items: [
      'Crispy Calamari Salad with roasted tomato dressing',
      'Chili Rubbed Pork or Salmon',
      'Thai Coconut Curry Chicken',
      'Coconut Jasmine Rice',
      'Traditional Naan Bread',
      'Black Rice Pudding',
      'Coffee & Tea',
    ],
    addOn: { name: 'Roasted Seasonal Vegetables', price: 8 },
  },
  {
    id: 'chefs-favorite',
    name: "Chef's Favorite",
    price: 80,
    season: 'Year-Round',
    dietaryTags: ['VG', 'GF', 'DF'],
    items: [
      'Citrus Wilted Kale Salad with carrots & zucchini',
      'Select one: Ginger Soy Grilled Pork Loin OR Chicken with Pineapple & Green Onions',
      'Chile & Lime Spiked Shrimp with garlic & black pepper',
      'Grilled Cauliflower Steaks with garlic, lemon & honey',
      'Orzo with Cranberries, Red Peppers & Spring Onions',
      'Rainbow Vegetable Medley',
      'Homemade Cookies',
      'Coffee & Tea',
    ],
  },
  {
    id: 'taco-bar',
    name: 'Taco Bar',
    price: 80,
    season: 'Summer (year-round with substitutions)',
    dietaryTags: ['VG', 'GF'],
    items: [
      'Pineapple Cucumber Salad with red onions, cilantro & spicy chili-lime dressing',
      'Mexican Street Rice with corn & feta',
      'Taco Bar with choice of two proteins: Grilled Steak, Marinated Chicken, Fried Fish, Brussels Sprouts, Grilled Cauliflower (+$15pp each additional)',
      'Guacamole, mango salsa, fire-roasted peppers & onions, cilantro-jalapeño slaw, Cotija cheese',
      'Stuffed Sweet Potatoes with black beans, corn, cilantro & cheese',
      'Margarita Cupcakes',
      'Coffee & Tea',
    ],
  },
  {
    id: 'regional-sliders',
    name: 'Regional Sliders',
    price: 80,
    season: 'Year-Round (tomato salad summer only)',
    dietaryTags: ['VG'],
    items: [
      'Heirloom Tomato Salad with feta & pistachios (Summer) or Mixed Greens (off-season)',
      'Greens Pasta Salad with arugula, peas & buttermilk Champagne vinaigrette',
      'Slider Bar — choice of five: Southern Fried Chicken · Smoky Brown Sugar Pulled Pork · Honey Aleppo Flank Steak · Portobello Roasted Red Pepper & Avocado · Sweet & Hot Sausage · Bacon Cheddar Burger',
      'Premium sliders: Butter Poached Lobster +$13pp · Crab Cake +$5pp · Fried Oyster Po\'Boy +$5pp · Kansas City Short Rib +$7pp · Prime Rib +$6pp',
      'House-Made Potato Chips, Sweet Potato Fries & Onion Rings with savory dipping sauces',
      'Apple Hand Pies (Fall: September–November)',
      'Coffee & Tea',
    ],
  },
  {
    id: 'modern-cuban',
    name: 'Modern Cuban',
    price: 85,
    season: 'Year-Round',
    dietaryTags: ['GF', 'DF'],
    items: [
      'Avocado, Watercress & Pineapple Salad with sweet onions & creamy lime dressing',
      'Classic Arroz Moro (Black Beans & Rice)',
      'Cuban Mojo Chicken roasted with orange juice, garlic, lime, mint & cilantro',
      'Coffee Crusted Grilled Flank Steak with herbed corn salsa',
      'Smashed Plantains with cilantro aioli dipping sauce',
      'Grilled Vegetables with Cotija cheese, paprika, chili powder, cumin, cilantro & lime',
      'Cuban Custard with cinnamon sprinkle',
      'Coffee & Tea',
    ],
    addOn: { name: 'Slow-Roasted Whole Pig (substitute +$15pp / add +$32pp)', price: 15 },
  },
  {
    id: 'argentine-asado',
    name: 'Argentine "Asado" BBQ',
    price: 95,
    season: 'Summer (June–August)',
    dietaryTags: ['GF'],
    items: [
      'Hearty Country Greens with avocado, hearts of palm & grapefruit wedges',
      'Traditional Asado BBQ on mini tabletop grills: chorizo, salchicha, Spanish blood sausage, short ribs, flank steak & sweetbread',
      'Vegetarian Stuffed Red Bell Peppers with provolone white sauce',
      'Jalapeño Spiked Spanish Rice',
      'Grilled Smashed Potatoes with garlic aioli',
      'Grilled Sweet Corn with basil butter',
      'Dulce de Leche Truffles & Sandwich Cookies',
      'Coffee & Tea',
    ],
  },
];

// === WELCOME HOUR ===

export const welcomeOptions: WelcomeOption[] = [
  { id: 'lemonade', name: 'Lemonade', category: 'beverage' },
  { id: 'iced-tea', name: 'Unsweetened or Sweetened Iced Tea', category: 'beverage' },
  { id: 'lavender-lemon', name: 'Lavender Lemon', category: 'infused-water' },
  { id: 'strawberry-mint', name: 'Strawberry Mint', category: 'infused-water' },
  { id: 'watermelon-basil-lime', name: 'Watermelon Basil & Lime', category: 'infused-water' },
  { id: 'cucumber-lemon', name: 'Cucumber Lemon', category: 'infused-water' },
  { id: 'blackberry-mint-orange', name: 'Blackberry Mint Orange', category: 'infused-water' },
  { id: 'strawberry-basil', name: 'Strawberry Basil', category: 'infused-water' },
  { id: 'blueberry-lime-raspberry', name: 'Blueberry Lime Raspberry', category: 'infused-water' },
  { id: 'lemon-ginger', name: 'Lemon Ginger', category: 'infused-water' },
  { id: 'apple-cinnamon', name: 'Apple Cinnamon Water', category: 'infused-water' },
  { id: 'hot-apple-cider', name: 'Hot Apple Cider', category: 'infused-water' },
];

export const spritzerOptions: SpritzerOption[] = [
  { id: 'classic-citrus', name: 'Classic Citrus Spritzer with lemon & lime' },
  { id: 'mixed-berry', name: 'Mixed Berry Spritzer with strawberries & raspberries' },
  { id: 'blackberry-mint', name: 'Blackberry Mint Spritzer with lime' },
  { id: 'watermelon-basil', name: 'Watermelon Basil Spritzer' },
  { id: 'strawberry-limoncello', name: 'Sparkling Strawberry Limoncello Spritzer' },
  { id: 'raspberry-lemon', name: 'Raspberry Lemon Blush Sangria' },
  { id: 'apple-ginger', name: 'Sparkling Apple Cider Ginger Spritzer' },
  { id: 'pumpkin-spice', name: 'Pumpkin Spice Spritzer with Cinnamon Stick' },
];

// === COCKTAIL HOUR ===

export const cocktailHourItems: CocktailItem[] = [
  { id: 'ch-ricotta-crostini', name: 'Whipped Ricotta Crostini with Estate Honey & Thyme', type: 'passed', price: 6, diet: ['VG'] },
  { id: 'ch-prosciutto-melon', name: 'Prosciutto-Wrapped Melon with Aged Balsamic', type: 'passed', price: 7, diet: ['GF', 'DF'] },
  { id: 'ch-caprese-skewers', name: 'Caprese Skewers with House-Made Pesto', type: 'passed', price: 6, diet: ['VG', 'GF'] },
  { id: 'ch-brie-fig', name: 'Brie & Fig Jam Phyllo Cup', type: 'passed', price: 7, diet: ['VG'] },
  { id: 'ch-salmon-blinis', name: 'Smoked Salmon Blinis with Crème Fraîche & Dill', type: 'passed', price: 8, diet: [] },
  { id: 'ch-beef-crostini', name: 'Beef Tenderloin Crostini with Horseradish Cream', type: 'passed', price: 9, diet: [] },
  { id: 'ch-shrimp-cocktail', name: 'Shrimp Cocktail with House Bloody Mary Sauce', type: 'passed', price: 9, diet: ['GF', 'DF'] },
  { id: 'ch-crudite', name: 'Seasonal Crudité with Herb Dip', type: 'stationed', price: 10, diet: ['VG', 'VE', 'GF', 'DF'] },
  { id: 'ch-charcuterie', name: 'Charcuterie & Cheese Board', type: 'stationed', price: 18, diet: ['VG'] },
];

export const COCKTAIL_INCLUDED_COUNT = 4;

// === RECEPTION DINNER ===

export const receptionCategories: ReceptionCategory[] = [
  {
    id: 'salads',
    label: 'SALADS',
    included: 1,
    extraPrice: 8,
    extraLabel: '+$8pp each additional',
    items: [
      { id: 'r-mixed-greens', name: 'Mixed Greens with Shallot-Dijon Dressing', price: 0, diet: [], season: [] },
      { id: 'r-caesar', name: 'Farmhouse Caesar Baby Romaine with Toasted Garlic Vinaigrette, Herbed Croutons, Tomatoes & Shaved Parmesan', price: 0, diet: [], season: [] },
      { id: 'r-blueberry-salad', name: 'Blueberry Salad with Spring Greens & Lemon Vinaigrette', price: 0, diet: [], season: ['spring', 'summer'] },
      { id: 'r-arugula-heirloom', name: 'Arugula Lemon Parmesan Salad with Baby Heirloom Tomatoes', price: 0, diet: [], season: ['spring', 'summer'] },
      { id: 'r-apple-fennel', name: 'Apple Fennel Arugula Salad with Honey Lemon Vinaigrette', price: 0, diet: [], season: ['fall'] },
      { id: 'r-spinach-pumpkin', name: 'Baby Spinach & Arugula Salad with Cherry Tomatoes, Pumpkin Seeds & Smoky Chili Dressing', price: 0, diet: [], season: ['fall'] },
      { id: 'r-spinach-bacon', name: 'Baby Spinach Salad with Smoked Bacon Dressing, Roasted Field Mushrooms & Local NY Cheddar Crumble', price: 2, diet: [], season: [] },
      { id: 'r-beet-frisee', name: 'Roasted Beet Salad with Frisée & Gem Lettuce', price: 2, diet: [], season: [] },
      { id: 'r-pear-walnut', name: 'Mixed Field Greens with Pears, Toasted Walnuts & Raspberry-Vanilla Bean Vinaigrette', price: 2, diet: [], season: ['fall'] },
      { id: 'r-peach-burrata', name: 'Grilled Peach & Burrata Salad with Arugula, Toasted Pine Nuts & Balsamic', price: 3, diet: [], season: ['summer'] },
      { id: 'r-chanterelle-beet', name: 'Organic Greens with Roasted Chanterelle Mushrooms, Golden Beets & Goat Cheese', price: 3, diet: [], season: ['fall', 'winter'] },
      { id: 'r-arugula-parm', name: 'Arugula with Shaved Parmesan, Lemon & EVOO', price: 13, diet: ['VG', 'GF'], season: [] },
      { id: 'r-wedge', name: 'Wedge Salad with House Bacon, Blue Cheese & Tomato', price: 14, diet: ['GF'], season: [] },
      { id: 'r-beet-goat', name: 'Roasted Beet Salad with Goat Cheese & Candied Walnuts', price: 14, diet: ['VG', 'GF'], season: [] },
    ],
  },
  {
    id: 'pastas-grains',
    label: 'PASTAS & GRAINS',
    included: 1,
    extraPrice: 12,
    extraLabel: '+$12pp each additional',
    items: [
      { id: 'r-mushroom-pasta', name: 'Mushroom & Spinach Pasta with Garlic Butter Sauce', price: 0, diet: [], season: [] },
      { id: 'r-saffron-couscous', name: 'Saffron Israeli Couscous with Dried Cranberries, Toasted Almonds & Fresh Herbs', price: 0, diet: [], season: [] },
      { id: 'r-tomato-pasta', name: 'Pasta with Fresh Tomatoes, Caramelized Onions & Marjoram', price: 0, diet: [], season: ['summer'] },
      { id: 'r-couscous-veg', name: 'Israeli Couscous with Roasted Seasonal Vegetables', price: 0, diet: [], season: ['summer'] },
      { id: 'r-orzo-gratin', name: 'Yellow Pepper Orzo Gratin with Cranberries & Thyme', price: 0, diet: [], season: ['fall'] },
      { id: 'r-winter-pasta', name: 'Winter Green Pasta with Swiss Chard, Garlic, Lemon & Parmesan', price: 0, diet: [], season: ['fall', 'winter'] },
      { id: 'r-wild-rice', name: 'Wild Rice with Nuts & Dried Fruits', price: 2, diet: [], season: [] },
      { id: 'r-broccoli-rabe', name: 'Pasta with Broccoli Rabe, Glazed Onions & Honey Lavender Jus', price: 2, diet: [], season: ['spring', 'fall'] },
      { id: 'r-gnocchi-corn', name: 'Gnocchi (or Tortellini) with Summer Corn & Heirloom Tomatoes', price: 2, diet: [], season: ['summer'] },
      { id: 'r-pesto-squash', name: 'Pesto Pasta with Roasted Butternut Squash & Pumpkin Seeds', price: 2, diet: [], season: ['fall'] },
      { id: 'r-squash-ravioli', name: 'Butternut Squash Ravioli in Fresh Sage Butter', price: 2, diet: [], season: ['fall'] },
      { id: 'r-tortellini-artichoke', name: 'Three Cheese Tortellini with Artichokes & Asparagus, Lemon, Shaved Parmesan & Cracked Black Pepper', price: 3, diet: [], season: ['spring'] },
      { id: 'r-fig-pasta', name: 'Pasta with Mission Figs, Chili, Lemon & Cream', price: 3, diet: [], season: ['fall'] },
    ],
  },
  {
    id: 'proteins',
    label: 'PROTEINS',
    included: 2,
    extraPrice: 22,
    extraLabel: '+$22pp for 3rd entrée',
    items: [
      // Poultry
      { id: 'r-roast-chicken', name: "Farmer's Recipe Roasted Whole Chicken with Lemon, Rosemary & Garlic Butter", price: 0, diet: [], season: [], subcategory: 'Poultry' },
      { id: 'r-tagine-chicken', name: 'Tagine of Chicken with Caramelized Shallots, Dried Fruit, Pine Nuts & Saffron', price: 0, diet: [], season: [], subcategory: 'Poultry' },
      { id: 'r-bbq-chicken', name: 'Sweet & Sticky Brown-Sugar Rubbed BBQ Chicken', price: 0, diet: [], season: [], subcategory: 'Poultry' },
      { id: 'r-spice-chicken', name: "Grilled Free Range Chicken Breast with Chef's Homemade Spice Rub", price: 0, diet: [], season: [], subcategory: 'Poultry' },
      { id: 'r-mango-chicken', name: 'House Marinated Grilled Chicken Breast with Mango Mint Salsa', price: 0, diet: [], season: ['summer'], subcategory: 'Poultry' },
      { id: 'r-cider-chicken', name: 'Cider Roasted Harvest Whole Chicken with Fall Grapes or Kalamata Olives', price: 0, diet: [], season: ['fall'], subcategory: 'Poultry' },
      { id: 'r-cast-iron-chicken', name: 'Cast Iron Chicken Thighs with Sweet Peas, Herbed Mushrooms & Apples', price: 2, diet: [], season: ['spring', 'fall'], subcategory: 'Poultry' },
      { id: 'r-blueberry-chicken', name: 'Blueberry & Fig Balsamic Roasted Chicken', price: 2, diet: [], season: ['summer', 'fall'], subcategory: 'Poultry' },
      { id: 'r-duck', name: 'Crispy Duck Breast with Spicy Plum Sauce', price: 13, diet: [], season: ['fall', 'winter'], subcategory: 'Poultry' },
      // Meats
      { id: 'r-flank-chimichurri', name: 'Grilled Flank Steak with Chimichurri', price: 0, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-baby-back-ribs', name: 'Fall-Off-The-Bone Baby Back Pork Ribs with Homemade Brown Sugar Spice Rub & Smokey Bourbon BBQ Sauce', price: 0, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-bacon-pork', name: 'Bacon Wrapped Pork Loin with Spiced Peach Chutney', price: 0, diet: [], season: ['summer'], subcategory: 'Meats' },
      { id: 'r-pork-fennel', name: 'Roasted Pork Loin with Onion, Fennel & Bourbon Reduction', price: 0, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-pork-medallions', name: 'Grilled Pork Medallions with Roasted Onions, Apples & Fennel Cream Sauce', price: 0, diet: [], season: ['fall'], subcategory: 'Meats' },
      { id: 'r-tagine-beef', name: 'Tagine of Beef with Caramelized Shallots, Dried Fruit, Pine Nuts & Saffron', price: 0, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-balsamic-flank', name: 'Balsamic & Soy Flank Steak with Cranberry Reduction', price: 1, diet: [], season: ['summer', 'fall'], subcategory: 'Meats' },
      { id: 'r-beef-ribs', name: 'Beef Ribs with Homemade Brown Sugar Spice Rub & Smokey Bourbon BBQ Sauce', price: 3, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-filet', name: 'Filet Mignon with Black Currant & Ruby Port Reduction or Cassis Onion Marmalade', price: 7, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-ribeye', name: 'Grilled Rib Eye Steak with Soy Butter Glaze', price: 7, diet: [], season: [], subcategory: 'Meats' },
      { id: 'r-short-ribs-cab', name: 'Braised Short Ribs with Cabernet Demi-Glaze', price: 9, diet: [], season: ['fall', 'winter'], subcategory: 'Meats' },
      { id: 'r-short-ribs-wine', name: 'Garlic Braised Short Ribs in Red Wine Reduction', price: 9, diet: [], season: ['fall', 'winter'], subcategory: 'Meats' },
      { id: 'r-lamb-shank', name: 'Red Wine Braised Lamb Shank with Fennel Peppered Rice, Swiss Chard & Aioli', price: 11, diet: [], season: ['spring', 'fall', 'winter'], subcategory: 'Meats' },
      { id: 'r-rack-lamb', name: 'Herb Crusted Rack of Lamb with Lemon Zest & Au Jus', price: 12, diet: [], season: ['spring', 'fall'], subcategory: 'Meats' },
      { id: 'r-whole-pig', name: 'Whole Roasted Pig with Grilled Peaches & Thyme or Grilled Plums, Apples & Rosemary', price: 22, diet: [], season: ['summer', 'fall'], subcategory: 'Meats' },
      // Fish
      { id: 'r-salmon', name: 'Seared Salmon with Lemongrass & Champagne Beurre Blanc or Orange Beurre Blanc', price: 0, diet: [], season: [], subcategory: 'Fish' },
      { id: 'r-cod-oreganata', name: 'Alaskan Cod with Lemon Oreganata', price: 0, diet: [], season: [], subcategory: 'Fish' },
      { id: 'r-cod-fennel', name: 'Alaskan Cod with Fennel & Blood Orange', price: 0, diet: [], season: ['winter', 'spring'], subcategory: 'Fish' },
      { id: 'r-ahi-tuna', name: 'Seared Ahi Tuna with Maple Balsamic Reduction & Thyme', price: 3, diet: [], season: [], subcategory: 'Fish' },
      { id: 'r-red-snapper', name: 'Crunchy Pan Fried Red Snapper with Chili Lime Butter', price: 7, diet: [], season: ['spring', 'summer'], subcategory: 'Fish' },
      { id: 'r-sea-bass', name: 'Grilled Sea Bass with Grape Salsa', price: 8, diet: [], season: ['spring', 'summer', 'fall'], subcategory: 'Fish' },
      { id: 'r-halibut', name: 'Braised Halibut Stuffed with Spinach, Peppers, Pine Nuts & Raisins', price: 14, diet: [], season: ['fall', 'winter'], subcategory: 'Fish' },
    ],
  },
  {
    id: 'vegetables-starches',
    label: 'VEGETABLES & STARCHES',
    included: 2,
    extraPrice: 8,
    extraLabel: '+$8pp for 3rd side',
    items: [
      { id: 'r-roast-potatoes', name: 'Oven Roasted New Potatoes with Caramelized Garlic & Thyme', price: 0, diet: [], season: [] },
      { id: 'r-haricot-vert', name: 'Sautéed Haricot Vert with Caramelized Shallots', price: 0, diet: [], season: [] },
      { id: 'r-broccoli', name: 'Caramelized Broccoli with Garlic', price: 0, diet: [], season: [] },
      { id: 'r-bok-choy', name: 'Grilled Baby Bok Choy with Miso Butter', price: 0, diet: [], season: [] },
      { id: 'r-bok-choy-trio', name: 'Baby Bok Choy, Haricot Vert & Broccoli with Citrus Shoyu', price: 0, diet: [], season: [] },
      { id: 'r-mashed', name: 'Creamy Garlic Mashed Potatoes', price: 0, diet: [], season: [] },
      { id: 'r-smashed-potatoes', name: 'Smashed Potatoes with Roasted Garlic Aioli', price: 0, diet: [], season: [] },
      { id: 'r-haricot-corn', name: 'Sautéed Haricot Vert with Grilled Summer Corn', price: 0, diet: [], season: ['summer'] },
      { id: 'r-sweet-potato-miso', name: 'Roasted Sweet Potatoes with Miso, Ginger & Scallions', price: 0, diet: [], season: ['fall', 'winter'] },
      { id: 'r-fingerling', name: 'Smashed Fingerling Potatoes with Sweet Onion & Garlic', price: 1, diet: [], season: [] },
      { id: 'r-peas-carrots', name: 'Organic Baby Sweet Peas & Rainbow Carrots Braised in White Wine & Shallots', price: 1, diet: [], season: ['spring'] },
      { id: 'r-root-veg', name: 'Roasted Root Vegetables with Citrus Wilted Kale', price: 1, diet: [], season: ['fall', 'winter'] },
      { id: 'r-farm-carrots', name: 'Grilled Farm Carrots with Pistachio Butter & Feta', price: 2, diet: [], season: ['summer', 'fall'] },
      { id: 'r-brussels', name: 'Caramelized Brussels Sprouts with Bacon & Brie', price: 2, diet: [], season: ['fall', 'winter'] },
      { id: 'r-portabella', name: 'Stuffed Portabella Mushroom with Roasted Vegetables, Goat Cheese & Fresh Herbs', price: 3, diet: [], season: [] },
      { id: 'r-asparagus', name: 'Asparagus Bundles in Champagne Butter', price: 4, diet: [], season: ['spring'] },
    ],
  },
];

// === RUNNING TOTAL CALCULATION ===

export interface LineItem {
  label: string;
  amount: number;
  section: string;
}

export interface TotalBreakdown {
  basePackage: number;
  rehearsalDinnerCost: number;
  lineItems: LineItem[];
  totalUpcharges: number;
  estimatedPerPerson: number;
}

export interface PricingData {
  getPrice: (itemKey: string) => number | null;
  getIncludedCount: (itemKey: string) => number | null;
}

const defaultPricing: PricingData = {
  getPrice: () => null,
  getIncludedCount: () => null,
};

export function calculateTotal(sel: BuilderSelections, pricing: PricingData = defaultPricing): TotalBreakdown {
  const lineItems: LineItem[] = [];
  let rehearsalDinnerCost = 0;

  // Rehearsal dinner
  if (sel.rehearsalDinner.themeId) {
    const theme = rehearsalThemes.find(t => t.id === sel.rehearsalDinner.themeId);
    if (theme) {
      rehearsalDinnerCost = pricing.getPrice(sel.rehearsalDinner.themeId) ?? theme.price;
      if (sel.rehearsalDinner.addOnSelected && theme.addOn) {
        const addonPrice = pricing.getPrice(`addon-${sel.rehearsalDinner.themeId}`) ?? theme.addOn.price;
        lineItems.push({ label: theme.addOn.name, amount: addonPrice, section: 'Rehearsal Dinner' });
      }
    }
  }

  // Welcome hour — extra non-alcoholic selections beyond 2 included
  const extraNonAlcPrice = pricing.getPrice('extra_nonalc_pp') ?? 2;
  const extraNonAlc = Math.max(0, sel.welcomeHour.nonAlcoholic.length - 2);
  if (extraNonAlc > 0) {
    lineItems.push({ label: `Extra Non-Alcoholic (×${extraNonAlc})`, amount: extraNonAlc * extraNonAlcPrice, section: 'Welcome Hour' });
  }

  // Welcome hour — extra spritzers beyond 1 included
  const extraSpritzerPrice = pricing.getPrice('extra_spritzer_pp') ?? 2;
  const extraSpritzers = Math.max(0, sel.welcomeHour.spritzers.length - 1);
  if (extraSpritzers > 0) {
    lineItems.push({ label: `Extra Spritzer (×${extraSpritzers})`, amount: extraSpritzers * extraSpritzerPrice, section: 'Welcome Hour' });
  }

  // Welcome hour upgrades
  if (sel.welcomeHour.passedServiceUpgrade) {
    const passedPrice = pricing.getPrice('passed_service_upgrade') ?? 8;
    lineItems.push({ label: 'Passed Service Upgrade', amount: passedPrice, section: 'Welcome Hour' });
  }
  if (sel.welcomeHour.champagneUpgrade) {
    const champPrice = pricing.getPrice('champagne_upgrade') ?? 5;
    lineItems.push({ label: 'Champagne Welcome Station', amount: champPrice, section: 'Welcome Hour' });
  }

  // Cocktail hour — new pricing: included items pay premium only, extras pay full price
  const cocktailIncluded = pricing.getIncludedCount('cocktail_included_count') ?? COCKTAIL_INCLUDED_COUNT;
  const cocktailBaseValue = pricing.getPrice('cocktail_base_value') ?? 6;
  sel.cocktailHour.forEach((id, idx) => {
    const item = cocktailHourItems.find(i => i.id === id);
    if (!item) return;
    const itemPrice = pricing.getPrice(id) ?? item.price;
    if (idx < cocktailIncluded) {
      // Within included: only charge premium above base value
      const premium = Math.max(0, itemPrice - cocktailBaseValue);
      if (premium > 0) {
        lineItems.push({ label: `${item.name} (premium)`, amount: premium, section: 'Cocktail Hour' });
      }
    } else {
      // Beyond included: full price
      lineItems.push({ label: item.name, amount: itemPrice, section: 'Cocktail Hour' });
    }
  });

  // Reception — unified pricing: within included = premium only, additional = extra charge + premium
  const receptionPricingKeys: Record<string, { included: string; extra: string }> = {
    'salads': { included: 'salads_included', extra: 'salads_extra_pp' },
    'pastas-grains': { included: 'pastas_included', extra: 'pastas_extra_pp' },
    'proteins': { included: 'proteins_included', extra: 'proteins_extra_pp' },
    'vegetables-starches': { included: 'sides_included', extra: 'sides_extra_pp' },
  };

  for (const cat of receptionCategories) {
    const key = cat.id === 'salads' ? 'salads'
      : cat.id === 'pastas-grains' ? 'pastasGrains'
      : cat.id === 'proteins' ? 'proteins'
      : 'vegetablesStarches';
    const selectedIds = sel.reception[key as keyof typeof sel.reception];
    const pKeys = receptionPricingKeys[cat.id];
    const includedCount = pricing.getIncludedCount(pKeys.included) ?? cat.included;
    const extraCharge = pricing.getPrice(pKeys.extra) ?? cat.extraPrice;

    selectedIds.forEach((id, idx) => {
      const item = cat.items.find(i => i.id === id);
      if (!item) return;
      const premium = pricing.getPrice(id) ?? item.price;

      if (idx < includedCount) {
        // Within included: only premium
        if (premium > 0) {
          lineItems.push({ label: `${item.name} (premium)`, amount: premium, section: 'Reception' });
        }
      } else {
        // Additional: extra charge + premium
        const total = extraCharge + premium;
        lineItems.push({ label: item.name, amount: total, section: 'Reception' });
      }
    });
  }

  // Meal inclusions
  if (sel.mealInclusions.mimosaBar) {
    const price = pricing.getPrice('mimosa_bar') ?? 20;
    lineItems.push({ label: 'Mimosa Bar', amount: price, section: 'Meal Inclusions' });
  }
  if (sel.mealInclusions.bloodyMaryBar) {
    const price = pricing.getPrice('bloody_mary_bar') ?? 20;
    lineItems.push({ label: 'Bloody Mary Bar', amount: price, section: 'Meal Inclusions' });
  }

  const basePackage = pricing.getPrice('base_reception_pp') ?? 105;
  const totalUpcharges = lineItems.reduce((sum, li) => sum + li.amount, 0);

  return {
    basePackage,
    rehearsalDinnerCost,
    lineItems,
    totalUpcharges,
    estimatedPerPerson: basePackage + rehearsalDinnerCost + totalUpcharges,
  };
}
