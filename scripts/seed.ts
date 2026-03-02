/**
 * Seed script for Cardlab development data.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> pnpm seed
 *
 * Or set the env var in .env.local and run:
 *   pnpm seed
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env and .env.local
for (const file of [".env", ".env.local"]) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // file doesn't exist, skip
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  // Get the first user to attach projects to
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (usersError || !users?.length) {
    console.error("No users found. Sign up first, then run the seed script.");
    process.exit(1);
  }

  const userId = users[0].id;
  console.log(`Seeding data for user: ${userId}`);

  // ── Project 1: Fantasy Battle ──────────────────────────────────
  const { data: p1 } = await supabase
    .from("projects")
    .insert({ user_id: userId, name: "Fantasy Battle", description: "A tactical card battle game with fantasy creatures" })
    .select()
    .single();

  const p1Id = p1!.id;

  const p1Props = [
    { project_id: p1Id, name: "Name", slug: "name", type: "text" as const, sort_order: 0 },
    { project_id: p1Id, name: "Attack", slug: "attack", type: "number" as const, sort_order: 1 },
    { project_id: p1Id, name: "Defense", slug: "defense", type: "number" as const, sort_order: 2 },
    { project_id: p1Id, name: "Rarity", slug: "rarity", type: "select" as const, sort_order: 3, options: ["Common", "Uncommon", "Rare", "Legendary"] },
    { project_id: p1Id, name: "Artwork", slug: "artwork", type: "image" as const, sort_order: 4 },
    { project_id: p1Id, name: "Is Legendary", slug: "is-legendary", type: "boolean" as const, sort_order: 5 },
    { project_id: p1Id, name: "Border Color", slug: "border-color", type: "color" as const, sort_order: 6 },
  ];

  await supabase.from("properties").insert(p1Props);

  const p1Cards = [
    { project_id: p1Id, data: { name: "Goblin Scout", attack: 2, defense: 1, rarity: "Common", "is-legendary": false, "border-color": "#4a7c3f" } },
    { project_id: p1Id, data: { name: "Shadow Knight", attack: 5, defense: 4, rarity: "Rare", "is-legendary": false, "border-color": "#2d2d3d" } },
    { project_id: p1Id, data: { name: "Phoenix Lord", attack: 7, defense: 3, rarity: "Legendary", "is-legendary": true, "border-color": "#ff6b35" } },
    { project_id: p1Id, data: { name: "Forest Sprite", attack: 1, defense: 3, rarity: "Common", "is-legendary": false, "border-color": "#6db33f" } },
    { project_id: p1Id, data: { name: "Dragon Whelp", attack: 4, defense: 2, rarity: "Uncommon", "is-legendary": false, "border-color": "#c41e3a" } },
    { project_id: p1Id, data: { name: "Iron Golem", attack: 3, defense: 8, rarity: "Rare", "is-legendary": false, "border-color": "#7c7c7c" } },
    { project_id: p1Id, data: { name: "Elven Archer", attack: 4, defense: 2, rarity: "Uncommon", "is-legendary": false, "border-color": "#3cb371" } },
    { project_id: p1Id, data: { name: "Dark Mage", attack: 6, defense: 2, rarity: "Rare", "is-legendary": false, "border-color": "#6a0dad" } },
    { project_id: p1Id, data: { name: "Stone Troll", attack: 3, defense: 5, rarity: "Common", "is-legendary": false, "border-color": "#8b7355" } },
    { project_id: p1Id, data: { name: "Celestial Dragon", attack: 9, defense: 7, rarity: "Legendary", "is-legendary": true, "border-color": "#ffd700" } },
    { project_id: p1Id, data: { name: "Water Elemental", attack: 4, defense: 4, rarity: "Uncommon", "is-legendary": false, "border-color": "#4169e1" } },
    { project_id: p1Id, data: { name: "Skeleton Warrior", attack: 3, defense: 1, rarity: "Common", "is-legendary": false, "border-color": "#d3d3d3" } },
    { project_id: p1Id, data: { name: "Flame Imp", attack: 3, defense: 1, rarity: "Common", "is-legendary": false, "border-color": "#ff4500" } },
    { project_id: p1Id, data: { name: "Crystal Golem", attack: 2, defense: 6, rarity: "Uncommon", "is-legendary": false, "border-color": "#00ced1" } },
    { project_id: p1Id, data: { name: "Ancient Wyrm", attack: 8, defense: 6, rarity: "Legendary", "is-legendary": true, "border-color": "#8b0000" } },
  ];

  await supabase.from("cards").insert(p1Cards);
  console.log(`  Created "Fantasy Battle" with ${p1Props.length} properties and ${p1Cards.length} cards`);

  // ── Project 2: Space Traders ───────────────────────────────────
  const { data: p2 } = await supabase
    .from("projects")
    .insert({ user_id: userId, name: "Space Traders", description: "A resource trading game set in the cosmos" })
    .select()
    .single();

  const p2Id = p2!.id;

  const p2Props = [
    { project_id: p2Id, name: "Name", slug: "name", type: "text" as const, sort_order: 0 },
    { project_id: p2Id, name: "Cost", slug: "cost", type: "number" as const, sort_order: 1 },
    { project_id: p2Id, name: "Resource Type", slug: "resource-type", type: "select" as const, sort_order: 2, options: ["Fuel", "Metal", "Crystal", "Food", "Tech"] },
    { project_id: p2Id, name: "Tradeable", slug: "tradeable", type: "boolean" as const, sort_order: 3 },
    { project_id: p2Id, name: "Card Color", slug: "card-color", type: "color" as const, sort_order: 4 },
    { project_id: p2Id, name: "Description", slug: "description", type: "text" as const, sort_order: 5 },
  ];

  await supabase.from("properties").insert(p2Props);

  const p2Cards = [
    { project_id: p2Id, data: { name: "Fuel Depot", cost: 3, "resource-type": "Fuel", tradeable: true, "card-color": "#ff8c00", description: "Produces 2 fuel per turn" } },
    { project_id: p2Id, data: { name: "Mining Station", cost: 5, "resource-type": "Metal", tradeable: true, "card-color": "#708090", description: "Extracts rare metals from asteroids" } },
    { project_id: p2Id, data: { name: "Crystal Cave", cost: 7, "resource-type": "Crystal", tradeable: false, "card-color": "#9370db", description: "Harvests precious crystals" } },
    { project_id: p2Id, data: { name: "Hydro Farm", cost: 2, "resource-type": "Food", tradeable: true, "card-color": "#32cd32", description: "Feeds your crew" } },
    { project_id: p2Id, data: { name: "Research Lab", cost: 8, "resource-type": "Tech", tradeable: false, "card-color": "#00bfff", description: "Unlocks advanced technologies" } },
    { project_id: p2Id, data: { name: "Trade Beacon", cost: 4, "resource-type": "Tech", tradeable: true, "card-color": "#ffd700", description: "Attracts merchant ships" } },
    { project_id: p2Id, data: { name: "Cargo Hold", cost: 1, "resource-type": "Metal", tradeable: true, "card-color": "#696969", description: "Stores additional resources" } },
    { project_id: p2Id, data: { name: "Solar Array", cost: 6, "resource-type": "Fuel", tradeable: true, "card-color": "#ffa500", description: "Converts sunlight to fuel" } },
    { project_id: p2Id, data: { name: "Bio Dome", cost: 4, "resource-type": "Food", tradeable: true, "card-color": "#228b22", description: "Self-sustaining food source" } },
    { project_id: p2Id, data: { name: "Quantum Core", cost: 10, "resource-type": "Crystal", tradeable: false, "card-color": "#e0b0ff", description: "Powers the hyperdrive" } },
    { project_id: p2Id, data: { name: "Scrap Yard", cost: 2, "resource-type": "Metal", tradeable: true, "card-color": "#8b4513", description: "Recycles old ship parts" } },
    { project_id: p2Id, data: { name: "Nebula Refinery", cost: 6, "resource-type": "Fuel", tradeable: true, "card-color": "#ff6347", description: "Extracts fuel from nebulae" } },
  ];

  await supabase.from("cards").insert(p2Cards);
  console.log(`  Created "Space Traders" with ${p2Props.length} properties and ${p2Cards.length} cards`);

  // ── Project 3: Quiz Night ──────────────────────────────────────
  const { data: p3 } = await supabase
    .from("projects")
    .insert({ user_id: userId, name: "Quiz Night", description: "A trivia card game for parties" })
    .select()
    .single();

  const p3Id = p3!.id;

  const p3Props = [
    { project_id: p3Id, name: "Question", slug: "question", type: "text" as const, sort_order: 0 },
    { project_id: p3Id, name: "Answer", slug: "answer", type: "text" as const, sort_order: 1 },
    { project_id: p3Id, name: "Category", slug: "category", type: "select" as const, sort_order: 2, options: ["Science", "History", "Geography", "Entertainment", "Sports"] },
    { project_id: p3Id, name: "Difficulty", slug: "difficulty", type: "number" as const, sort_order: 3 },
    { project_id: p3Id, name: "Is Bonus", slug: "is-bonus", type: "boolean" as const, sort_order: 4 },
  ];

  await supabase.from("properties").insert(p3Props);

  const p3Cards = [
    { project_id: p3Id, data: { question: "What planet is known as the Red Planet?", answer: "Mars", category: "Science", difficulty: 1, "is-bonus": false } },
    { project_id: p3Id, data: { question: "In what year did World War II end?", answer: "1945", category: "History", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "What is the capital of Australia?", answer: "Canberra", category: "Geography", difficulty: 3, "is-bonus": false } },
    { project_id: p3Id, data: { question: "Who directed Jurassic Park?", answer: "Steven Spielberg", category: "Entertainment", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "How many players are on a soccer team?", answer: "11", category: "Sports", difficulty: 1, "is-bonus": false } },
    { project_id: p3Id, data: { question: "What is the chemical symbol for gold?", answer: "Au", category: "Science", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci", category: "Entertainment", difficulty: 1, "is-bonus": false } },
    { project_id: p3Id, data: { question: "What is the longest river in the world?", answer: "Nile", category: "Geography", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "What element has the atomic number 1?", answer: "Hydrogen", category: "Science", difficulty: 1, "is-bonus": false } },
    { project_id: p3Id, data: { question: "Who was the first person on the moon?", answer: "Neil Armstrong", category: "History", difficulty: 1, "is-bonus": true } },
    { project_id: p3Id, data: { question: "What sport uses a shuttlecock?", answer: "Badminton", category: "Sports", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "What is the smallest country in the world?", answer: "Vatican City", category: "Geography", difficulty: 3, "is-bonus": true } },
    { project_id: p3Id, data: { question: "What year was the first iPhone released?", answer: "2007", category: "Entertainment", difficulty: 2, "is-bonus": false } },
    { project_id: p3Id, data: { question: "Who discovered penicillin?", answer: "Alexander Fleming", category: "Science", difficulty: 3, "is-bonus": true } },
    { project_id: p3Id, data: { question: "In which city were the 2016 Olympics held?", answer: "Rio de Janeiro", category: "Sports", difficulty: 2, "is-bonus": false } },
  ];

  await supabase.from("cards").insert(p3Cards);
  console.log(`  Created "Quiz Night" with ${p3Props.length} properties and ${p3Cards.length} cards`);

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
