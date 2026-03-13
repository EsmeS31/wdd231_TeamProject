import { fetchBaseDecks } from "./api.js";
import { loadUserDecks, loadBaseOverrides, loadDeletedDeckIds } from "./storage.js";

export async function loadDecks() {
  try {
    // Try API first (replace with real API URL if available)
    const response = await fetch('https://api.example.com/decks'); // Example API endpoint
    if (response.ok) {
      const data = await response.json();
      return data.decks || [];
    }
  } catch (e) {
    console.warn('API fetch failed, falling back to local JSON:', e);
  }
  
  const response = await fetch('./data/decks.json');
  const data = await response.json();
  return data.decks || [];
}

export async function getAllDecks() {
  const base = await fetchBaseDecks();
  const user = loadUserDecks();
  const overrides = loadBaseOverrides();
  const deleted = new Set(loadDeletedDeckIds());

  const baseFiltered = base.filter((d) => !deleted.has(d.id)).map((d) => {
    return overrides[d.id] ? overrides[d.id] : d;
  });

  const userFiltered = user.filter((d) => !deleted.has(d.id));

  const merged = [...userFiltered];

  for (const d of baseFiltered) {
    if (!merged.some((x) => x.id === d.id)) merged.push(d);
  }

  return merged;
}

export async function getDeckById(deckId) {
  const decks = await getAllDecks();
  return decks.find((d) => d.id === deckId) || null;
}

export async function isBaseDeck(deckId) {
  const base = await fetchBaseDecks();
  return base.some((d) => d.id === deckId);
}

