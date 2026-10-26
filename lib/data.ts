export type Category = {
  id: string;
  title: string;
  short: string;
  intro: string;
  image: string;
  hero: string;
};

export type Product = {
  packCoverage?: number;
  availability?: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  textureImage: string;
  roomImage: string;
  badge: string;
  price: number;
  old: number;
  colour: string;
  finish: string;
  thickness: string;
  size: string;
  wear: string;
  install: string;
  warranty: string;
  rating: string;
  tags: string[];
  details: string;
};

const real = {
  bath: "/assets/real/bath-wood.jpg",
  dining: "/assets/real/dining-oak.jpg",
  hallway: "/assets/real/hallway-oak.jpg",
  kitchen: "/assets/real/kitchen-oak.jpg",
  living: "/assets/real/living-oak.jpg",
  livingWarm: "/assets/real/living-walnut.jpg",
  office: "/assets/real/office-oak.jpg",
};

function productAsset(
  slug: string,
  view: "plank" | "texture" | "room",
) {
  return `/assets/products/${slug}/${view}.webp`;
}

export const categories: Category[] = [
  {
    id: "engineered",
    title: "Engineered Wood Flooring",
    short: "Layered real wood in richer, less ordinary tones.",
    intro:
      "Premium oak, smoked timber and white-washed planks with real texture, stable construction and warm architectural colour.",
    image: "/assets/categories-generated/engineered.webp",
    hero: "Real wood floors with depth, movement and a considered finish.",
  },
  {
    id: "lvt",
    title: "Luxury Vinyl Tile",
    short: "Waterproof floors with bold wood and stone looks.",
    intro:
      "Practical LVT in warm oak, charcoal, clay and parquet effects for kitchens, bathrooms and busy family rooms.",
    image: "/assets/categories-generated/lvt.webp",
    hero: "Soft underfoot, wipe-clean and made for rooms that work hard.",
  },
  {
    id: "laminate",
    title: "Laminate Flooring",
    short: "Durable surfaces without the flat grey-store look.",
    intro:
      "Water-resistant and AC-rated laminate with misted oak, ash brown and modern brushed textures.",
    image: "/assets/categories-generated/laminate.webp",
    hero: "Smart-value flooring with texture, character and strong everyday wear.",
  },
  {
    id: "solid",
    title: "Solid Wood Flooring",
    short: "Full-depth timber with expressive natural grain.",
    intro:
      "Solid hardwood for rooms that deserve permanence: walnut, oak and heritage planks with refinishable depth.",
    image: "/assets/categories-generated/solid.webp",
    hero: "A long-life floor with real timber weight and traditional craft.",
  },
  {
    id: "herringbone",
    title: "Herringbone and Parquet",
    short: "Patterned floors with boutique detail.",
    intro:
      "Herringbone, chevron and parquet layouts in honey oak, old English oak and smoked grey finishes.",
    image: "/assets/categories-generated/herringbone.webp",
    hero: "Pattern floors that make the whole room feel designed.",
  },
  {
    id: "spc",
    title: "SPC Stone Effect Flooring",
    short: "Rigid waterproof tiles in mineral-inspired shades.",
    intro:
      "SPC flooring with limestone, pale concrete and mineral matt texture for bathrooms, kitchens and halls.",
    image: "/assets/categories-generated/spc.webp",
    hero: "Stone-look flooring with click fitting and everyday comfort.",
  },
];

export const products: Product[] = [
  {
    slug: "ashford-natural-oak-engineered",
    name: "Ashford Natural Oak Brushed Engineered Wood",
    category: "engineered",
    image: productAsset("ashford-natural-oak-engineered", "plank"),
    textureImage: productAsset("ashford-natural-oak-engineered", "texture"),
    roomImage: productAsset("ashford-natural-oak-engineered", "room"),
    badge: "Best seller",
    price: 44.99,
    old: 59.99,
    colour: "Natural oak",
    finish: "Brushed matt lacquer",
    thickness: "14 mm",
    size: "190 x 1900 mm",
    wear: "3 mm real oak",
    install: "Click or glue down",
    warranty: "25 years domestic",
    rating: "4.9",
    tags: ["oak", "click", "living", "sample"],
    details:
      "A calm natural oak engineered floor with visible grain, light knots and a smooth matt surface. Ideal for open-plan living, bedrooms and hallways where you want real wood with improved stability.",
  },
  {
    slug: "kensington-smoked-oak-engineered",
    name: "Kensington Smoked Oak Wide Plank Engineered Wood",
    category: "engineered",
    image: productAsset("kensington-smoked-oak-engineered", "plank"),
    textureImage: productAsset("kensington-smoked-oak-engineered", "texture"),
    roomImage: productAsset("kensington-smoked-oak-engineered", "room"),
    badge: "Wide plank",
    price: 52.95,
    old: 68.5,
    colour: "Smoked oak",
    finish: "UV oiled",
    thickness: "15 mm",
    size: "220 x 2200 mm",
    wear: "4 mm real oak",
    install: "Floating or glue down",
    warranty: "30 years domestic",
    rating: "4.8",
    tags: ["oak", "premium", "wide", "smoked"],
    details:
      "A richer smoked oak floor with wide boards, soft movement and premium oil character. It suits glass, stone, brass and warm neutral interiors without looking generic.",
  },
  {
    slug: "brooklyn-oak-lvt",
    name: "Brooklyn Warm Oak Click LVT",
    category: "lvt",
    image: productAsset("brooklyn-oak-lvt", "plank"),
    textureImage: productAsset("brooklyn-oak-lvt", "texture"),
    roomImage: productAsset("brooklyn-oak-lvt", "room"),
    badge: "Waterproof",
    price: 28.99,
    old: 36.99,
    colour: "Warm oak",
    finish: "Embossed wood texture",
    thickness: "5 mm",
    size: "180 x 1220 mm",
    wear: "0.55 mm wear layer",
    install: "Click",
    warranty: "20 years domestic",
    rating: "4.7",
    tags: ["oak", "waterproof", "click", "kitchen"],
    details:
      "Waterproof LVT with a realistic oak surface and quiet underfoot feel. A practical choice for kitchens, utility rooms, bathrooms and homes with pets.",
  },
  {
    slug: "chelsea-stone-spc",
    name: "Chelsea Pale Stone Rigid Core SPC",
    category: "spc",
    image: productAsset("chelsea-stone-spc", "plank"),
    textureImage: productAsset("chelsea-stone-spc", "texture"),
    roomImage: productAsset("chelsea-stone-spc", "room"),
    badge: "Rigid core",
    price: 31.95,
    old: 42.5,
    colour: "Pale stone",
    finish: "Mineral matt texture",
    thickness: "6.5 mm",
    size: "305 x 610 mm",
    wear: "0.55 mm wear layer",
    install: "Click",
    warranty: "20 years domestic",
    rating: "4.8",
    tags: ["waterproof", "click", "stone", "bathroom"],
    details:
      "A stone effect rigid core tile with soft limestone movement, built for wet rooms and high-traffic areas without cold ceramic installation.",
  },
  {
    slug: "mayfair-herringbone-oak",
    name: "Mayfair Honey Oak Click Herringbone",
    category: "herringbone",
    image: productAsset("mayfair-herringbone-oak", "plank"),
    textureImage: productAsset("mayfair-herringbone-oak", "texture"),
    roomImage: productAsset("mayfair-herringbone-oak", "room"),
    badge: "Designer look",
    price: 39.99,
    old: 54.99,
    colour: "Honey oak",
    finish: "Matt lacquer",
    thickness: "12 mm",
    size: "90 x 450 mm",
    wear: "Decorative oak layer",
    install: "Click herringbone",
    warranty: "25 years domestic",
    rating: "4.9",
    tags: ["oak", "click", "herringbone", "premium"],
    details:
      "A warm honey oak herringbone floor that brings boutique hotel detail into living rooms, dining spaces and entrance halls with quicker click installation.",
  },
  {
    slug: "nordic-grey-oak-laminate",
    name: "Nordic Grey Oak AC5 Laminate",
    category: "laminate",
    image: productAsset("nordic-grey-oak-laminate", "plank"),
    textureImage: productAsset("nordic-grey-oak-laminate", "texture"),
    roomImage: productAsset("nordic-grey-oak-laminate", "room"),
    badge: "AC5 rated",
    price: 18.99,
    old: 24.99,
    colour: "Grey oak",
    finish: "Textured matt",
    thickness: "12 mm",
    size: "193 x 1380 mm",
    wear: "AC5 abrasion class",
    install: "Click",
    warranty: "20 years domestic",
    rating: "4.6",
    tags: ["oak", "click", "grey", "durable"],
    details:
      "Hard-wearing laminate with cool grey oak tones and a textured surface. A strong value option for bedrooms, offices and rental refurbishments.",
  },
  {
    slug: "heritage-walnut-solid",
    name: "Heritage American Walnut Solid Wood",
    category: "solid",
    image: productAsset("heritage-walnut-solid", "plank"),
    textureImage: productAsset("heritage-walnut-solid", "texture"),
    roomImage: productAsset("heritage-walnut-solid", "room"),
    badge: "Premium timber",
    price: 73.5,
    old: 89.99,
    colour: "Dark walnut",
    finish: "Satin lacquer",
    thickness: "18 mm",
    size: "125 x random length",
    wear: "Solid hardwood",
    install: "Nail or glue down",
    warranty: "Lifetime structural",
    rating: "4.8",
    tags: ["premium", "walnut", "dark", "solid"],
    details:
      "A full-depth American walnut floor with deep chocolate tones and expressive grain. Best suited to dry living areas and statement rooms.",
  },
  {
    slug: "brighton-white-oak-engineered",
    name: "Brighton White Oak Matt Engineered Wood",
    category: "engineered",
    image: productAsset("brighton-white-oak-engineered", "plank"),
    textureImage: productAsset("brighton-white-oak-engineered", "texture"),
    roomImage: productAsset("brighton-white-oak-engineered", "room"),
    badge: "Light finish",
    price: 47.95,
    old: 61.5,
    colour: "White oak",
    finish: "White matt lacquer",
    thickness: "14 mm",
    size: "180 x 1900 mm",
    wear: "3 mm real oak",
    install: "Click or glue down",
    warranty: "25 years domestic",
    rating: "4.7",
    tags: ["oak", "click", "light", "engineered"],
    details:
      "A pale engineered oak floor designed to brighten compact spaces while keeping the real texture of natural timber.",
  },
  {
    slug: "camden-charcoal-lvt",
    name: "Camden Charcoal Oak Glue Down LVT",
    category: "lvt",
    image: productAsset("camden-charcoal-lvt", "plank"),
    textureImage: productAsset("camden-charcoal-lvt", "texture"),
    roomImage: productAsset("camden-charcoal-lvt", "room"),
    badge: "Contract grade",
    price: 23.5,
    old: 32.99,
    colour: "Charcoal oak",
    finish: "Registered emboss",
    thickness: "2.5 mm",
    size: "184 x 1219 mm",
    wear: "0.55 mm wear layer",
    install: "Glue down",
    warranty: "15 years commercial",
    rating: "4.7",
    tags: ["waterproof", "charcoal", "commercial", "oak"],
    details:
      "A slim glue-down LVT plank for busy homes, retail areas and offices where a low profile and a dramatic tone matter.",
  },
  {
    slug: "sloane-natural-chevron",
    name: "Sloane Natural Oak Chevron Parquet",
    category: "herringbone",
    image: productAsset("sloane-natural-chevron", "plank"),
    textureImage: productAsset("sloane-natural-chevron", "texture"),
    roomImage: productAsset("sloane-natural-chevron", "room"),
    badge: "Chevron",
    price: 58.99,
    old: 76.99,
    colour: "Natural oak",
    finish: "Brushed oil",
    thickness: "15 mm",
    size: "120 x 600 mm",
    wear: "4 mm real oak",
    install: "Glue down",
    warranty: "30 years domestic",
    rating: "4.9",
    tags: ["oak", "premium", "chevron", "parquet"],
    details:
      "A refined chevron parquet with clean angles and a natural brushed oak surface. Made for elegant dining rooms, lounges and boutique interiors.",
  },
  {
    slug: "harbour-mist-laminate",
    name: "Harbour Mist Oak Water-Resistant Laminate",
    category: "laminate",
    image: productAsset("harbour-mist-laminate", "plank"),
    textureImage: productAsset("harbour-mist-laminate", "texture"),
    roomImage: productAsset("harbour-mist-laminate", "room"),
    badge: "Water resistant",
    price: 21.95,
    old: 29.99,
    colour: "Mist oak",
    finish: "Authentic texture",
    thickness: "10 mm",
    size: "192 x 1285 mm",
    wear: "AC4 abrasion class",
    install: "Click",
    warranty: "18 years domestic",
    rating: "4.6",
    tags: ["oak", "click", "waterproof", "mist"],
    details:
      "A soft mist-toned laminate with sealed edges for improved everyday water resistance in kitchens, halls and family rooms.",
  },
  {
    slug: "bath-stone-spc",
    name: "Bath Limestone Beige SPC Tile",
    category: "spc",
    image: productAsset("bath-stone-spc", "plank"),
    textureImage: productAsset("bath-stone-spc", "texture"),
    roomImage: productAsset("bath-stone-spc", "room"),
    badge: "Bathroom ready",
    price: 34.95,
    old: 44.99,
    colour: "Limestone beige",
    finish: "Fine stone grain",
    thickness: "6 mm",
    size: "300 x 600 mm",
    wear: "0.5 mm wear layer",
    install: "Click",
    warranty: "20 years domestic",
    rating: "4.8",
    tags: ["waterproof", "click", "stone", "bathroom"],
    details:
      "A warm limestone-look SPC tile with a waterproof core, easy click fitting and comfortable feel underfoot.",
  },
];

export const rooms = [
  ["Living Room", "Smoked oak, walnut and pattern floors that turn the main room into a designed space.", "herringbone", "/assets/rooms-generated/room-living.webp"],
  ["Kitchen", "Waterproof LVT and SPC with wipe-clean surfaces, stable cores and realistic texture.", "spc", "/assets/rooms-generated/room-kitchen.webp"],
  ["Bedroom", "Soft white oak and mist laminate options with relaxed tones and quiet maintenance.", "engineered", "/assets/rooms-generated/room-bedroom.webp"],
  ["Bathroom", "Rigid waterproof tile looks that suit compact, humid and high-use spaces.", "spc", "/assets/rooms-generated/room-bathroom.webp"],
  ["Hallway", "Hard-wearing floors for entrances, shoes, pets and daily traffic.", "laminate", "/assets/rooms-generated/room-hallway.webp"],
  ["Commercial", "Contract-rated LVT, charcoal finishes and fast replacement options.", "lvt", "/assets/rooms-generated/room-commercial.webp"],
] as const;

export const guides = [
  ["Choose your floor type", "Compare engineered wood, solid wood, LVT, laminate and SPC by durability, water resistance, feel and budget."],
  ["Measure your room", "Measure length and width, add 10 percent waste for straight planks and 15 percent for herringbone or chevron."],
  ["Pick an installation method", "Click flooring is fast and DIY-friendly, glue-down feels firm, and solid wood often needs professional fitting."],
  ["Order free samples", "Check colour in morning and evening light, then place samples beside cabinets, sofas, rugs and wall paint."],
  ["Prepare your subfloor", "A clean, level and dry subfloor protects the finished floor and helps prevent movement, gaps and noise."],
  ["Choose trims and underlay", "Match profiles, door bars, scotia and underlay to the flooring type, room use and final floor height."],
] as const;

export function money(value: number) {
  return `£${value.toFixed(2)}`;
}

export function categoryById(id?: string) {
  return categories.find((category) => category.id === id) ?? categories[0];
}

export function productBySlug(slug?: string) {
  return products.find((product) => product.slug === slug) ?? products[0];
}

export function productsByCategory(id: string) {
  return products.filter((product) => product.category === id);
}
