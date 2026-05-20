export type AccessoryCategoryId =
  | "letters"
  | "numbers"
  | "animals"
  | "characters"
  | "holiday"
  | "nature"
  | "food"
  | "objects"
  | "other";

export type AccessoryCategoryDefinition = {
  id: AccessoryCategoryId;
  label: string;
  keywords: readonly string[];
};

export const ACCESSORY_CATEGORY_DEFINITIONS: readonly AccessoryCategoryDefinition[] = [
  {
    id: "letters",
    label: "Letters",
    keywords: ["letter"],
  },
  {
    id: "numbers",
    label: "Numbers",
    keywords: ["no", "number", "num", "digit"],
  },
  {
    id: "animals",
    label: "Animals",
    keywords: [
      "animal",
      "bear",
      "beagle",
      "bichon",
      "bulldog",
      "bunny",
      "cat",
      "chihuahua",
      "corgi",
      "cow",
      "doberman",
      "dog",
      "fish",
      "hedgehog",
      "poodle",
      "pomeranian",
      "pug",
      "rabbit",
      "retriever",
      "samoyed",
      "schnauzer",
      "shiba",
      "shih",
      "spaniel",
      "tzu",
      "zebra",
    ],
  },
  {
    id: "characters",
    label: "Characters",
    keywords: [
      "cartoon",
      "character",
      "ghost",
      "hello",
      "kitty",
      "kawaii",
      "pac",
      "pacman",
      "pikachu",
      "pompompurin",
      "superhero",
    ],
  },
  {
    id: "holiday",
    label: "Holiday",
    keywords: [
      "christmas",
      "claus",
      "gingerbread",
      "gift",
      "reindeer",
      "santa",
      "snowman",
      "stocking",
      "wreath",
    ],
  },
  {
    id: "nature",
    label: "Nature",
    keywords: ["blossom", "flower", "leaf", "plant", "rose", "sunflower"],
  },
  {
    id: "food",
    label: "Food",
    keywords: [
      "bao",
      "burger",
      "cherry",
      "dumpling",
      "egg",
      "ice",
      "pudding",
      "sundae",
      "sushi",
      "tea",
    ],
  },
  {
    id: "objects",
    label: "Objects",
    keywords: ["box", "hat", "house", "pouch"],
  },
  {
    id: "other",
    label: "Other",
    keywords: [],
  },
] as const;

const CATEGORY_BY_ID = new Map(
  ACCESSORY_CATEGORY_DEFINITIONS.map((category) => [category.id, category])
);

const PATCH_FILLER_WORDS = new Set([
  "patch",
  "face",
  "with",
  "without",
  "headband",
  "up",
  "down",
  "white",
  "black",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
  "orange",
  "golden",
  "grey",
  "gray",
  "brown",
  "tan",
  "small",
  "chubby",
]);

function tokenizeProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/no\./g, "no")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function isSingleLetterPatch(tokens: string[]) {
  const meaningfulTokens = tokens.filter((token) => !PATCH_FILLER_WORDS.has(token));
  return (
    tokens.includes("letter") ||
    meaningfulTokens.some((token) => /^[a-z]$/.test(token))
  );
}

function isNumberPatch(tokens: string[]) {
  const meaningfulTokens = tokens.filter((token) => !PATCH_FILLER_WORDS.has(token));

  return (
    tokens.includes("number") ||
    tokens.includes("num") ||
    tokens.includes("digit") ||
    (tokens.includes("no") && tokens.some((token) => /^\d+$/.test(token))) ||
    (meaningfulTokens.length > 0 &&
      meaningfulTokens.every((token) => /^\d+$/.test(token)))
  );
}

export function inferAccessoryCategoryId(name: string): AccessoryCategoryId {
  const tokens = tokenizeProductName(name);
  const tokenSet = new Set(tokens);

  if (isSingleLetterPatch(tokens)) return "letters";
  if (isNumberPatch(tokens)) return "numbers";

  for (const category of ACCESSORY_CATEGORY_DEFINITIONS) {
    if (category.id === "letters" || category.id === "numbers" || category.id === "other") {
      continue;
    }

    if (category.keywords.some((keyword) => tokenSet.has(keyword))) {
      return category.id;
    }
  }

  return "other";
}

export function getAccessoryCategoryLabel(categoryId: AccessoryCategoryId) {
  return CATEGORY_BY_ID.get(categoryId)?.label ?? CATEGORY_BY_ID.get("other")!.label;
}
