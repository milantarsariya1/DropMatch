import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

const prisma = new PrismaClient();

// Niche metadata pool for programmatic generation
const niches = [
  {
    name: "Fitness & Activewear",
    categories: ["Fitness & Gym", "Eco-Friendly"],
    tags: ["yoga", "mats", "resistance-bands", "fitness", "activewear", "eco-friendly", "workout", "reusable"],
    shopTexts: [
      "Wholesale premium yoga mats, high-tensile resistance bands, and organic cotton gym towels. Customized branding and logo prints available.",
      "Eco-friendly fitness accessories, cork yoga blocks, natural rubber exercise mats, and steel hydration bottles. Great bulk prices.",
      "Heavy-duty resistance gear, smart gym jump ropes, foam rollers, and athletic travel bags. Designed for active retailers."
    ],
    intentTexts: [
      "Looking to source premium eco-friendly yoga mats, resistance bands, and workout gear for my boutique activewear brand.",
      "Sourcing high-quality athletic accessories, gym shakers, and foam rollers for an online fitness store targeting home workouts.",
      "Searching for zero-plastic sports bottles, natural cork fitness blocks, and gym towels with custom brand packaging."
    ],
    shopNames: ["Pulse Activewear", "Apex Gear", "IronFit Supply", "ZenMat Crafters", "VibeFit Labs", "FitFlow Wholesales"]
  },
  {
    name: "Smart Tech Accessories",
    categories: ["Electronics", "Accessories"],
    tags: ["wireless", "charger", "magsafe", "phone-cases", "gadgets", "usb-c", "travel", "cables"],
    shopTexts: [
      "Fast wireless charging pads, MagSafe compatible silicon phone cases, and nylon-braided USB-C cables. Retail-ready packaging.",
      "Premium travel charger adapters, electronic gadget organizers, magnetic dashboard mounts, and Bluetooth earbud cases.",
      "Sleek wooden wireless docking stations, leather phone cases, and high-speed multi-port adapters. Perfect for tech shops."
    ],
    intentTexts: [
      "Looking for tech gadgets, MagSafe phone cases, wireless charging stands, and fast charging cables for a dropshipping shop.",
      "Sourcing minimalist travel chargers, multi-port adapters, and dashboard phone mounts to sell on my tech accessories shop.",
      "Searching for high-quality leather phone covers, braided charging cables, and smart docking stations."
    ],
    shopNames: ["NexCharge Systems", "VoltCore Gadgets", "MagShield Tech", "UrbanWire Labs", "SyncTech Products", "PortaCharge Co."]
  },
  {
    name: "Zero-Waste Kitchen & Dining",
    categories: ["Eco-Friendly", "Drinkware & Kitchen"],
    tags: ["bamboo", "biodegradable", "zero-waste", "utensils", "reusable", "lunch-boxes", "compostable"],
    shopTexts: [
      "Biodegradable bamboo travel utensil sets, organic cotton grocery bags, and beeswax wraps. Zero-waste certified wholesale.",
      "Compostable paper lunch boxes, reusable silicone food bags, and natural coconut husk dish brushes. Eco kitchen supplies.",
      "Sustainable wooden cutting boards, bamboo fiber cups, and stainless steel straw sets. Ideal for zero-waste resellers."
    ],
    intentTexts: [
      "Looking to source biodegradable bamboo travel cutlery, reusable grocery bags, and zero-waste kitchen products.",
      "Sourcing organic kitchen wraps, compostable lunch boxes, and reusable silicone bags for eco-friendly lifestyle stores.",
      "Searching for zero-waste supplier offering bamboo cups, metal straws, and wooden kitchen brushes."
    ],
    shopNames: ["EcoKitchen Ware", "GreenLarder Co.", "Bambu Dining", "PureNatures Table", "CompostableLife Co.", "ZeroWaste Krafts"]
  },
  {
    name: "Organic Beauty & Skincare",
    categories: ["Beauty & Skincare", "Eco-Friendly"],
    tags: ["organic", "vegan", "skincare", "serums", "cruelty-free", "essential-oils", "bamboo", "moisturizer"],
    shopTexts: [
      "Organic anti-aging face serums, vegan moisturizing lotions, and organic rosewater sprays. Cruelty-free certified wholesale.",
      "Bamboo reusable makeup removal pads, natural loofah sponges, and lavender essential oils. Pure organic cosmetics.",
      "Handmade cold-pressed soap bars, vegan lip balms, and organic clay face masks. Sustainable beauty supply catalogs."
    ],
    intentTexts: [
      "Looking for organic face serums, cruelty-free skincare lotions, and vegan cosmetics to dropship on my beauty store.",
      "Sourcing reusable bamboo pads, essential oils, and organic soap bars for clean beauty brand targeting eco consumers.",
      "Searching for vegan clay masks, organic face oils, and sustainable bath accessories."
    ],
    shopNames: ["Aura Botanicals", "Luna Glow Organics", "Bloom Vegan Beauty", "Nectar Essential Oils", "Herb&Clay skincare", "Sora Cosmetics"]
  },
  {
    name: "Premium Pet Supplies",
    categories: ["Pet Supplies", "Accessories"],
    tags: ["pet-toys", "dog-bags", "organic", "biodegradable", "leather", "collars", "leashes", "grooming"],
    shopTexts: [
      "Biodegradable dog waste bags, organic hemp catnip toys, and premium leather pet collars. Sustainable pet wholesale supplies.",
      "Eco-friendly pet grooming shampoo bars, bamboo pet hair brushes, and stainless steel feeding bowls.",
      "Interactive wooden dog puzzles, durable cotton rope chew toys, and travel pet carrier beds. Perfect for pet catalog shops."
    ],
    intentTexts: [
      "Looking to source biodegradable poop bags, dog toys, and durable pet accessories for my Shopify boutique.",
      "Sourcing premium leather dog collars, travel bowls, and pet grooming kits for dropshipping.",
      "Searching for zero-waste cat toys, bamboo dog brushes, and organic pet items."
    ],
    shopNames: ["Bark & Tail Co.", "Pawsome Products", "SustainablePets Co.", "HempPet Crafts", "GreenPaw Supplies", "ElitePet Wholesalers"]
  },
  {
    name: "Coffee & Tea Accessories",
    categories: ["Drinkware & Kitchen"],
    tags: ["coffee", "tea", "french-press", "grinders", "mugs", "reusable", "stainless-steel", "wholesale"],
    shopTexts: [
      "Stainless steel double-walled French presses, manual ceramic coffee grinders, and reusable mesh tea infusers. Premium cafe accessories.",
      "Travel coffee mugs, bamboo lid glass tea tumblers, and pour-over coffee makers. Custom laser engraving available.",
      "Double-walled glass espresso cups, matcha tea whisks, and silicone coffee filters. High-grade coffee shop supplies."
    ],
    intentTexts: [
      "Looking for premium coffee gear, stainless steel French presses, and manual coffee bean grinders for my coffee niche store.",
      "Sourcing reusable tea infusers, glass tumblers with bamboo lids, and custom pour-over coffee brewers.",
      "Searching for glass espresso cups, double-walled travel mugs, and matcha whisk sets."
    ],
    shopNames: ["Roast & Brew Gear", "Barista Tools Inc.", "Infuse Tea Crafters", "Apex Coffee Ware", "BrewMaster Labs", "CoffeeSora Accessories"]
  },
  {
    name: "Outdoor & Travel Gear",
    categories: ["Outdoor & Travel", "Accessories"],
    tags: ["hammocks", "camping", "solar-chargers", "backpacks", "travel", "waterproof", "carabiners", "towels"],
    shopTexts: [
      "Ultra-light camping hammocks with tree straps, heavy-duty utility carabiners, and waterproof dry bags. Premium outdoor catalog.",
      "Solar power bank chargers, quick-dry microfiber travel towels, and security travel passport wallets.",
      "Collapsible camping lanterns, insulated travel backpacks, and pocket picnic blankets. B2B wholesale rates."
    ],
    intentTexts: [
      "Looking to source lightweight camping hammocks, utility carabiners, and dry bags for my travel gear storefront.",
      "Sourcing solar powered chargers, microfiber travel towels, and security wallets for travel dropshipping.",
      "Searching for collapsible camping lights, outdoor backpacks, and picnic blankets."
    ],
    shopNames: ["Summit Trails Co.", "CampOut Equipment", "DryBack Waterproofs", "SolarPack Travel", "MicroTowel Gears", "Wilderness Supply"]
  },
  {
    name: "Home Office & Stationery",
    categories: ["Accessories", "Home Office"],
    tags: ["cork", "bamboo-pens", "notebooks", "laptop-sleeves", "organizers", "minimalist", "recycled", "planners"],
    shopTexts: [
      "Recycled cork journal notebooks, bamboo casing ballpoint pens, and biodegradable felt laptop sleeves. Clean desk setup.",
      "Minimalist wooden desk organizers, modular pen holder trays, and recycled paper weekly planners.",
      "Ergonomic memory foam seat cushions, aluminum laptop stands, and felt desk writing pads. High-quality office gear."
    ],
    intentTexts: [
      "Looking for recycled cork notebooks, bamboo pens, and sustainable laptop sleeves to dropship to remote workers.",
      "Sourcing minimalist desk organizers, wooden pen trays, and recycled paper planners.",
      "Searching for aluminum laptop risers, felt desk pads, and ergonomic office cushions."
    ],
    shopNames: ["TerraOffice Goods", "DeskKraft Supplies", "EcoScribe stationery", "Cork&Co designs", "FeltComfort Office", "MinimalistDesk Co."]
  }
];

const cities = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Austin, TX",
  "Denver, CO", "Portland, OR", "Seattle, WA", "Boston, MA", "Miami, FL",
  "San Francisco, CA", "Atlanta, GA", "Dallas, TX", "Philadelphia, PA"
];

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson"];

// Helper to choose random item from array
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Starting database seeding with programmatically generated profiles...');

  // 1. Clean existing records
  await prisma.shopListing.deleteMany();
  await prisma.dropshipperIntent.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Purged existing database records.');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Programmatically generate 55 Shops
  console.log('🛒 Creating 55 shops...');
  for (let i = 1; i <= 55; i++) {
    const niche = rand(niches);
    const firstName = rand(firstNames);
    const lastName = rand(lastNames);
    const ownerName = `${firstName} ${lastName}`;
    const email = `shop${i}@example.com`;
    const shopName = `${rand(niche.shopNames)} ${rand(["Co", "Labs", "Supply", "Global", "Boutique"])} #${i}`;
    const location = rand(cities);
    const rawProductText = rand(niche.shopTexts);
    
    // Create User
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email,
        passwordHash,
        role: 'shop'
      }
    });

    // Create Shop Listing (using static category/tag mapping from the chosen niche)
    await prisma.shopListing.create({
      data: {
        userId: user.id,
        shopName,
        location,
        rawProductText,
        description: `A premier wholesale dealer offering curated products in our ${niche.name} line. Focused on high-quality manufacturing and retail support.`,
        categories: niche.categories,
        tags: niche.tags.slice(0, 5) // select first few tags
      }
    });
  }

  // 3. Programmatically generate 110 Dropshippers
  console.log('🤝 Creating 110 dropshippers...');
  for (let i = 1; i <= 110; i++) {
    const niche = rand(niches);
    const firstName = rand(firstNames);
    const lastName = rand(lastNames);
    const ownerName = `${firstName} ${lastName}`;
    const email = `dropshipper${i}@example.com`;
    const rawIntentText = rand(niche.intentTexts);

    // Create User
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email,
        passwordHash,
        role: 'dropshipper'
      }
    });

    // Create Intent
    await prisma.dropshipperIntent.create({
      data: {
        userId: user.id,
        rawIntentText,
        categories: niche.categories,
        tags: niche.tags.slice(2, 7) // select offset tags to guarantee overlap
      }
    });
  }

  console.log('🎉 Seeding successfully completed!');
  console.log(`Summary: Created 55 Shop profiles and 110 Dropshipper profiles on Neon DB.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
