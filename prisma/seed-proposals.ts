import type { ItemCategory } from "../src/lib/schemas/proposal";

type SeedItem = {
  category: ItemCategory;
  title: string;
  description: string;
  scheduledAt: Date;
  priceCents: number;
};

type SeedProposal = {
  id: string;
  reservationId: string;
  notes: string;
  items: SeedItem[];
};

function item(
  category: ItemCategory,
  date: string,
  time: string,
  title: string,
  description: string,
  priceUsd: number,
): SeedItem {
  return {
    category,
    title,
    description,
    scheduledAt: new Date(`${date}T${time}:00.000Z`),
    priceCents: priceUsd * 100,
  };
}

const jamesItems: SeedItem[] = [
  // Mar 15: arrival
  item(
    "transport",
    "2027-03-15",
    "13:00",
    "Private airport transfer from Puerto Vallarta",
    "Meet and greet at PVR, a chilled SUV stocked with cold towels, agua fresca and local snacks. About 50 minutes to the villa.",
    280,
  ),
  item(
    "dining",
    "2027-03-15",
    "15:30",
    "Welcome ceviche lunch on the terrace",
    "A light first lunch prepared by your villa chef: fresh-catch ceviche, grilled octopus tostadas and tropical fruit.",
    240,
  ),
  item(
    "experiences",
    "2027-03-15",
    "18:30",
    "Sunset mezcal flight on the beach",
    "A mezcalero guides a tasting of five small-batch Nayarit and Oaxaca mezcals at the water's edge as the sun goes down.",
    190,
  ),

  // Mar 16
  item(
    "wellness",
    "2027-03-16",
    "08:30",
    "Beachfront sunrise yoga",
    "Private vinyasa session on the sand with a resident instructor, followed by fresh coconut water.",
    150,
  ),
  item(
    "activities",
    "2027-03-16",
    "11:00",
    "Private surf lesson at Punta Mita",
    "Two hours with a local coach on a gentle break, boards and rash guards provided. Suitable for first-timers and returning surfers.",
    320,
  ),
  item(
    "dining",
    "2027-03-16",
    "19:30",
    "Private chef tasting dinner",
    "Five courses of modern Nayarit cuisine on the villa terrace, with a paired wine selection and candlelit tables.",
    1200,
  ),

  // Mar 17: full day
  item(
    "dining",
    "2027-03-17",
    "07:30",
    "Breakfast at the pool pavilion",
    "Chilaquiles, fresh pastries and cold-pressed juices served before the boat leaves.",
    90,
  ),
  item(
    "excursions",
    "2027-03-17",
    "09:00",
    "Marietas Islands private catamaran cruise",
    "Four hours on a private catamaran around the protected Marietas Islands with snorkeling stops, a guide and a deckhand.",
    1450,
  ),
  item(
    "dining",
    "2027-03-17",
    "14:00",
    "Fresh-catch lunch at a beach palapa",
    "A table reserved at a quiet palapa on Playa Destiladeras: grilled red snapper, shrimp aguachile and cold Pacifico.",
    260,
  ),
  item(
    "wellness",
    "2027-03-17",
    "16:30",
    "Garden pavilion massage",
    "A 90-minute deep-tissue massage by two therapists in a shaded pavilion at the villa.",
    420,
  ),
  item(
    "experiences",
    "2027-03-17",
    "18:30",
    "Tequila tasting with a master tequilero",
    "Reposado and añejo pairings with artisanal chocolate and cured meats, hosted poolside.",
    340,
  ),
  item(
    "dining",
    "2027-03-17",
    "20:30",
    "Chef's table at the villa",
    "An unhurried late dinner built around the day's catch, served family-style by your chef.",
    780,
  ),

  // Mar 18: rest day, intentionally empty

  // Mar 19
  item(
    "excursions",
    "2027-03-19",
    "08:00",
    "Humpback whale watching",
    "Three hours on a private panga with a marine biologist in Banderas Bay, close to the end of the season.",
    680,
  ),
  item(
    "wellness",
    "2027-03-19",
    "16:00",
    "Spa afternoon: facial and body ritual",
    "A 2.5-hour treatment at a nearby spa using local agave and aloe, with a private relaxation suite.",
    540,
  ),
  item(
    "dining",
    "2027-03-19",
    "20:00",
    "Dinner at a Sayulita courtyard restaurant",
    "A reserved corner table, a chef's tasting menu and a private driver there and back.",
    620,
  ),

  // Mar 20
  item(
    "activities",
    "2027-03-20",
    "08:00",
    "Tee time on the oceanfront course",
    "An 18-hole round including the famous island-green hole, with caddie, cart and clubs arranged in advance.",
    780,
  ),
  item(
    "excursions",
    "2027-03-20",
    "15:30",
    "Sayulita and San Pancho cultural tour",
    "Private guide and driver through two surf towns: galleries, artisan workshops and a stop for fresh paletas.",
    460,
  ),
  item(
    "experiences",
    "2027-03-20",
    "20:00",
    "Beach bonfire with live guitar and stargazing",
    "A fire on the sand, a trio playing boleros, a telescope for the southern sky and a mezcal cocktail bar.",
    890,
  ),

  // Mar 21
  item(
    "dining",
    "2027-03-21",
    "10:30",
    "Long Sunday brunch by the pool",
    "Eggs to order, fresh tortillas, tropical fruit and mimosas, served at your pace.",
    180,
  ),
  item(
    "activities",
    "2027-03-21",
    "15:30",
    "Horseback ride along the shore",
    "A guided 90-minute ride through palm groves and onto the beach at golden hour.",
    360,
  ),
  item(
    "dining",
    "2027-03-21",
    "19:30",
    "Farewell dinner with wine pairing",
    "A seven-course farewell menu on the terrace with a sommelier-selected pairing from Valle de Guadalupe.",
    1600,
  ),
  item(
    "experiences",
    "2027-03-21",
    "22:00",
    "Cigar and mezcal lounge",
    "A final nightcap in the villa's lounge with hand-rolled cigars and rare mezcal selected by the concierge.",
    280,
  ),

  // Mar 22: departure
  item(
    "dining",
    "2027-03-22",
    "08:00",
    "Farewell breakfast",
    "A relaxed last breakfast with cold-pressed juices and coffee, and a travel basket packed for the flight.",
    110,
  ),
  item(
    "wellness",
    "2027-03-22",
    "09:30",
    "Pre-flight recovery massage",
    "A 60-minute stretch and release massage at the villa before the journey home.",
    240,
  ),
  item(
    "transport",
    "2027-03-22",
    "11:30",
    "Private transfer to Puerto Vallarta airport",
    "Door-to-terminal transfer with luggage handling and fast-track check-in assistance.",
    280,
  ),
];

const ameliaItems: SeedItem[] = [
  item(
    "transport",
    "2027-04-05",
    "14:00",
    "Private transfer from Los Cabos airport",
    "Meet and greet at SJD with an air-conditioned SUV and cold drinks. About 40 minutes to the villa.",
    260,
  ),
  item(
    "experiences",
    "2027-04-05",
    "18:00",
    "Sunset cocktails on the terrace",
    "A mixologist prepares signature margaritas and smoked palomas as the Pacific turns orange.",
    210,
  ),
  item(
    "dining",
    "2027-04-05",
    "19:30",
    "Welcome dinner by the villa chef",
    "Grilled lobster, charred vegetables and a Baja wine pairing at the pool.",
    780,
  ),

  item(
    "wellness",
    "2027-04-06",
    "08:00",
    "Sunrise yoga",
    "A private class on the villa terrace overlooking the sea.",
    140,
  ),
  item(
    "excursions",
    "2027-04-06",
    "10:30",
    "Land's End and Santa Maria Bay by private boat",
    "Cruise past the Arch, snorkel in the clear water of Santa Maria Bay and enjoy a picnic on board.",
    950,
  ),
  item(
    "dining",
    "2027-04-06",
    "20:00",
    "Seafood dinner on the marina",
    "A reserved waterfront table with a raw bar and the day's catch.",
    520,
  ),

  item(
    "activities",
    "2027-04-07",
    "06:30",
    "Sport fishing charter",
    "A six-hour private charter for marlin and dorado with captain, crew, tackle and breakfast.",
    1200,
  ),
  item(
    "dining",
    "2027-04-07",
    "14:00",
    "Cook-your-catch lunch",
    "Your chef prepares the morning's fish three ways at the villa.",
    300,
  ),
  item(
    "wellness",
    "2027-04-07",
    "17:30",
    "Massage at the villa",
    "A 90-minute massage to unwind after a day on the water.",
    380,
  ),

  item(
    "excursions",
    "2027-04-08",
    "09:00",
    "Todos Santos day trip",
    "A private driver and guide to the artist town: galleries, the old mission and a courtyard coffee.",
    640,
  ),
  item(
    "dining",
    "2027-04-08",
    "13:30",
    "Farm-to-table lunch in Todos Santos",
    "A shaded garden table with organic produce, wood-fired dishes and local wine.",
    330,
  ),
  item(
    "experiences",
    "2027-04-08",
    "19:30",
    "Tequila tasting at the villa",
    "A guided tasting of rare añejos with chocolate and regional cheeses.",
    350,
  ),

  item(
    "activities",
    "2027-04-09",
    "09:30",
    "Desert ATV adventure",
    "Two hours through the Sierra foothills and dunes, with helmets, guide and a cold drink at the end.",
    420,
  ),
  item(
    "wellness",
    "2027-04-09",
    "15:00",
    "Spa afternoon",
    "A signature body wrap and facial at a nearby resort spa, with a private suite.",
    560,
  ),
  item(
    "dining",
    "2027-04-09",
    "20:00",
    "Rooftop chef's table",
    "A six-course tasting menu under the stars, hosted by a visiting guest chef.",
    1100,
  ),

  item(
    "activities",
    "2027-04-10",
    "10:00",
    "Stand-up paddle and kayak",
    "A guided paddle along the quiet coast with boards and a safety boat.",
    240,
  ),
  item(
    "excursions",
    "2027-04-10",
    "17:00",
    "Sunset catamaran cruise",
    "Champagne, canapés and a swim stop aboard a private catamaran.",
    820,
  ),
  item(
    "dining",
    "2027-04-10",
    "20:00",
    "Beach dinner by lantern light",
    "A private table on the sand with a three-course menu and a guitarist.",
    640,
  ),

  item(
    "wellness",
    "2027-04-11",
    "10:00",
    "Ocean-view spa morning",
    "A hot-stone massage and scalp ritual in a pavilion above the sea.",
    480,
  ),
  item(
    "experiences",
    "2027-04-11",
    "18:30",
    "Beach bonfire and s'mores",
    "A fire on the sand with blankets, mezcal hot chocolate and a storyteller.",
    380,
  ),
  item(
    "dining",
    "2027-04-11",
    "20:00",
    "Farewell dinner",
    "A seven-course farewell menu by your chef, with a Valle de Guadalupe wine pairing.",
    1250,
  ),

  item(
    "dining",
    "2027-04-12",
    "09:00",
    "Farewell breakfast",
    "A leisurely last breakfast with fresh juices and pastries.",
    95,
  ),
  item(
    "transport",
    "2027-04-12",
    "12:00",
    "Private transfer to Los Cabos airport",
    "Door-to-terminal service with luggage handling.",
    260,
  ),
];

const danielItems: SeedItem[] = [
  item(
    "transport",
    "2027-05-10",
    "13:30",
    "Private transfer from Cancún airport",
    "Meet and greet at CUN with a chauffeured SUV. About one hour south along the coast.",
    300,
  ),
  item(
    "experiences",
    "2027-05-10",
    "18:30",
    "Welcome mezcal tasting at dusk",
    "A mezcal sommelier presents five small-batch pours with fresh fruit and sal de gusano.",
    240,
  ),
  item(
    "dining",
    "2027-05-10",
    "20:00",
    "Welcome dinner by the villa chef",
    "A tasting menu of Caribbean seafood and Yucatecan flavors on the terrace.",
    820,
  ),

  item(
    "activities",
    "2027-05-11",
    "09:30",
    "Private cenote swim",
    "An early visit to an open-air cenote before the crowds, with a guide, snorkel gear and refreshments.",
    360,
  ),
  item(
    "wellness",
    "2027-05-11",
    "15:30",
    "Villa massage",
    "A 90-minute massage with herbal oils in a shaded garden pavilion.",
    400,
  ),
  item(
    "dining",
    "2027-05-11",
    "20:00",
    "Yucatecan tasting dinner",
    "Cochinita pibil, sopa de lima and handmade tortillas prepared by a regional cook.",
    540,
  ),

  item(
    "excursions",
    "2027-05-12",
    "08:00",
    "Tulum ruins private tour",
    "A first-entry visit to the clifftop site with an archaeologist guide, before the heat and crowds.",
    620,
  ),
  item(
    "dining",
    "2027-05-12",
    "13:00",
    "Lunch at a Tulum beach club",
    "A reserved daybed table with grilled fish, tacos and cold cocktails.",
    380,
  ),
  item(
    "wellness",
    "2027-05-12",
    "17:30",
    "Temazcal ceremony",
    "A traditional Mayan steam-lodge ritual led by a shaman, followed by herbal tea.",
    290,
  ),

  item(
    "excursions",
    "2027-05-13",
    "07:30",
    "Chichén Itzá private day trip",
    "A chauffeured journey with a private guide to the ancient city, including a cenote swim on the way back.",
    980,
  ),
  item(
    "dining",
    "2027-05-13",
    "14:30",
    "Hacienda lunch",
    "A long lunch in a restored hacienda garden with regional dishes.",
    420,
  ),
  item(
    "experiences",
    "2027-05-13",
    "21:00",
    "Beach stargazing",
    "An astronomer sets up telescopes on the sand for a guided tour of the night sky.",
    350,
  ),

  item(
    "activities",
    "2027-05-14",
    "09:00",
    "Snorkeling with sea turtles in Akumal",
    "A guided private swim in the bay where green turtles feed on the seagrass.",
    310,
  ),
  item(
    "dining",
    "2027-05-14",
    "12:30",
    "Beachside seafood lunch",
    "Grilled lobster and ceviche served at the water's edge.",
    340,
  ),
  item(
    "experiences",
    "2027-05-14",
    "18:30",
    "Tequila and chocolate pairing",
    "A tasting led by a local expert with Mexican single-origin cacao.",
    260,
  ),

  item(
    "excursions",
    "2027-05-15",
    "08:30",
    "Sian Ka'an biosphere boat tour",
    "A private boat through mangroves and lagoons in the UNESCO reserve, with a floating canal drift.",
    760,
  ),
  item(
    "wellness",
    "2027-05-15",
    "16:00",
    "Restorative yoga and sound bath",
    "A gentle class followed by a sound bath with singing bowls at the villa.",
    220,
  ),
  item(
    "dining",
    "2027-05-15",
    "20:00",
    "Chef's table with cenote views",
    "A candlelit multi-course dinner at a jungle cenote lodge, with transport.",
    1050,
  ),

  item(
    "wellness",
    "2027-05-16",
    "11:00",
    "Spa day",
    "A full day at a nearby spa with a Mayan-inspired circuit and a private lunch.",
    600,
  ),
  item(
    "experiences",
    "2027-05-16",
    "16:30",
    "Mayan cacao ceremony",
    "A guided ritual with a local healer, preparing and sharing ceremonial cacao.",
    190,
  ),
  item(
    "dining",
    "2027-05-16",
    "19:30",
    "Farewell dinner on the beach",
    "A private table on the sand with a seven-course menu and live music.",
    1180,
  ),

  item(
    "dining",
    "2027-05-17",
    "09:00",
    "Farewell breakfast",
    "A relaxed last breakfast with fresh fruit and Yucatecan specialties.",
    100,
  ),
  item(
    "transport",
    "2027-05-17",
    "12:00",
    "Private transfer to Cancún airport",
    "Door-to-terminal transfer with luggage handling.",
    300,
  ),
];

export const proposals: SeedProposal[] = [
  {
    id: "proposal_punta_mita_draft",
    reservationId: "reservation_punta_mita",
    notes:
      "James, we shaped this week around the Pacific: slow mornings, one full day on the water, a deliberate rest day on Thursday and a proper farewell. Happy to swap or soften anything.",
    items: jamesItems,
  },
  {
    id: "proposal_cabo_azul_draft",
    reservationId: "reservation_cabo_azul",
    notes:
      "Amelia, a week of sea, desert and long dinners in Cabo. Tell us what to trim or add.",
    items: ameliaItems,
  },
  {
    id: "proposal_maya_sol_draft",
    reservationId: "reservation_maya_sol",
    notes:
      "Daniel, cenotes, ruins and the Caribbean at an easy pace. Everything can be adjusted.",
    items: danielItems,
  },
];
