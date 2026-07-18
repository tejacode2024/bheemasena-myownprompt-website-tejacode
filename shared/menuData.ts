// ════════════════════════════════════════════════════════
//  SHARED MENU DATA — single source of truth
// ════════════════════════════════════════════════════════
// Edit this file to update both the customer site and the admin
// dashboard. bheemasena/src/data/menu.ts and
// bheemasena-admin/src/data/menuData.ts both re-export from here.
// ════════════════════════════════════════════════════════

export type MenuTag = 'Spicy' | 'New' | 'Chef' | 'Popular' | 'Vegan'

export type MenuCategory =
  | 'Veg Starters'
  | 'Non-Veg Starters'
  | 'Veg Biryani'
  | 'Non-Veg Biryani'
  | 'Mini Biryani'
  | 'Breads'
  | 'Veg Curries'
  | 'Non-Veg Curries'

// Unified shape — has every optional field used by either project.
//   - `image?`  is read by the customer site's MenuCard / cart thumbnails.
//   - `veg?`   is read by the admin's VegDot indicator.
//   - `category`  is the human-readable label that doubles as the
//      grouping key. The admin's MENU_DATA below indexes by slugified
//      version of this label.
export type MenuItem = {
  id: string
  name: string
  price: number
  description: string
  category: MenuCategory
  tag?: MenuTag
  image?: string
  veg?: boolean
}

export const MENU_CATEGORIES: MenuCategory[] = [
  'Veg Starters',
  'Non-Veg Starters',
  'Veg Biryani',
  'Non-Veg Biryani',
  'Mini Biryani',
  'Breads',
  'Veg Curries',
  'Non-Veg Curries',
]

// Categories that imply `veg: true` unless an item overrides it.
const VEG_CATEGORIES = new Set<MenuCategory>([
  'Veg Starters', 'Veg Biryani', 'Mini Biryani', 'Breads', 'Veg Curries',
])

function withVeg(items: MenuItem[]): MenuItem[] {
  return items.map((it) => ({ ...it, veg: it.veg ?? VEG_CATEGORIES.has(it.category) }))
}

export const MENU: MenuItem[] = withVeg([
  // ───── Veg Starters ─────
  { id: 'vs-01', category: 'Veg Starters', name: 'Veg Manchuria',     price: 210,
    description: 'Crisp veg dumplings tossed in a tangy soy-garlic glaze.' },
  { id: 'vs-02', category: 'Veg Starters', name: 'Chilli Mushroom',   price: 230,
    description: 'Button mushrooms wok-tossed with bell pepper, onion, and green chilli.' },
  { id: 'vs-03', category: 'Veg Starters', name: 'Crispy Baby Corn',  price: 230,
    description: 'Battered baby corn fried golden and finished with curry-leaf salt.' },
  { id: 'vs-04', category: 'Veg Starters', name: 'Paneer 65',         price: 280,
    description: 'Cottage cheese cubes marinated South-Indian style, fried hot and spicy.' },
  { id: 'vs-05', category: 'Veg Starters', name: 'Paneer Majestic',   price: 290,
    description: 'Crisp paneer tossed with curry leaves, green chilli, and tangy masala.' },

  // ───── Non-Veg Starters ─────
  { id: 'ns-01', category: 'Non-Veg Starters', name: 'Chilli Chicken',     price: 290,
    description: 'Boneless chicken stir-fried with capsicum, onion, and dark soy.' },
  { id: 'ns-02', category: 'Non-Veg Starters', name: 'Chicken Manchuria',  price: 290,
    description: 'Crispy chicken bites in a sweet-spicy Indo-Chinese gravy.' },
  { id: 'ns-03', category: 'Non-Veg Starters', name: 'Chicken 65',         price: 290,
    description: 'Iconic Chettinad-style fried chicken with curry leaves and red chilli.' },
  { id: 'ns-04', category: 'Non-Veg Starters', name: 'Chicken Majestic',   price: 290,
    description: 'Telugu-style fried chicken with mint, ginger, and a curd marinade.' },

  // ───── Veg Biryani (sufficient for 2 people) ─────
  { id: 'vb-01', category: 'Veg Biryani', name: 'Special Paneer Biryani',    price: 290,
    description: 'Paneer biryani layered with mint, fried onion, and saffron. Sufficient for 2 people.' },
  { id: 'vb-02', category: 'Veg Biryani', name: 'Special Mushroom Biryani',  price: 290,
    description: 'Mushroom dum biryani fragrant with whole spices. Sufficient for 2 people.' },
  { id: 'vb-03', category: 'Veg Biryani', name: 'Special Veg Biryani',       price: 260,
    description: 'Mixed vegetables and basmati slow-cooked on dum. Sufficient for 2 people.' },
  { id: 'vb-04', category: 'Veg Biryani', name: 'Ulavacharu Biryani',        price: 270,
    description: 'Andhra horse-gram broth folded through long-grain rice. Sufficient for 2 people.' },
  { id: 'vb-05', category: 'Veg Biryani', name: 'Kaju Biryani',              price: 290,
    description: 'Cashew biryani with caramelised onion and warm garam masala. Sufficient for 2 people.' },
  { id: 'vb-06', category: 'Veg Biryani', name: 'Special Kaju Biryani',      price: 310,
    description: 'House cashew biryani enriched with ghee and saffron milk. Sufficient for 2 people.' },
  { id: 'vb-07', category: 'Veg Biryani', name: 'Veg Biryani',               price: 240,
    description: 'A classic dum biryani of seasonal vegetables. Sufficient for 2 people.' },

  // ───── Non-Veg Biryani (sufficient for 2 people) ─────
  { id: 'nb-01', category: 'Non-Veg Biryani', name: 'Special Egg Biryani',        price: 280,
    description: 'Two whole eggs layered into a dum biryani. Sufficient for 2 people.' },
  { id: 'nb-02', category: 'Non-Veg Biryani', name: 'Chicken Dum Biryani',        price: 270,
    description: 'Hyderabad-style chicken biryani sealed and cooked on dum. Sufficient for 2 people.' },
  { id: 'nb-03', category: 'Non-Veg Biryani', name: 'Kundan Biryani',             price: 360,
    description: 'House signature with marinated chicken, saffron, and ghee. Sufficient for 2 people.' },
  { id: 'nb-04', category: 'Non-Veg Biryani', name: 'Chicken Fry Biryani',        price: 280,
    description: 'Twice-cooked chicken folded through basmati. Sufficient for 2 people.' },
  { id: 'nb-05', category: 'Non-Veg Biryani', name: 'Special Chicken Biryani',    price: 300,
    description: 'Boneless chicken biryani with mint and fried onion. Sufficient for 2 people.' },
  { id: 'nb-06', category: 'Non-Veg Biryani', name: 'Joint Biryani',              price: 310,
    description: 'Bone-in chicken on the joint, slow-cooked over rice. Sufficient for 2 people.' },
  { id: 'nb-07', category: 'Non-Veg Biryani', name: 'Chicken Mughlai Biryani',    price: 310,
    description: 'Mughlai biryani perfumed with rose water and cardamom. Sufficient for 2 people.' },
  { id: 'nb-08', category: 'Non-Veg Biryani', name: 'Chicken Lollipop Biryani',   price: 330,
    description: 'Spiced lollipop drumsticks layered into a fragrant dum biryani. Sufficient for 2 people.' },
     { id: 'nb-09', category: 'Non-Veg Biryani', name: 'Chicken Gongura Biryani',   price: 330,
    description: 'Spiced lollipop drumsticks layered into a fragrant dum biryani. Sufficient for 2 people.' },


  // ───── Mini Biryani (sufficient for 1 person) ─────
  { id: 'mb-01', category: 'Mini Biryani', name: 'Mini Dum Biryani',             price: 170,
    description: 'A single-serve dum biryani. Sufficient for 1 person.' },
  { id: 'mb-02', category: 'Mini Biryani', name: 'Mini Fry Biryani',             price: 180,
    description: 'Twice-cooked chicken with rice, half-portion. Sufficient for 1 person.' },
  { id: 'mb-03', category: 'Mini Biryani', name: 'Mini Special Chicken Biryani', price: 210,
    description: 'House special chicken biryani in a solo portion. Sufficient for 1 person.' },
  { id: 'mb-04', category: 'Mini Biryani', name: 'Mini Paneer Biryani',          price: 190,
    description: 'Paneer biryani in a one-up serve. Sufficient for 1 person.' },
  { id: 'mb-05', category: 'Mini Biryani', name: 'Mini Mushroom Biryani',        price: 200,
    description: 'Mushroom dum biryani in a single portion. Sufficient for 1 person.' },
  { id: 'mb-06', category: 'Mini Biryani', name: 'Mini Mughlai Biryani',         price: 220,
    description: 'Mughlai biryani perfumed and plated solo. Sufficient for 1 person.' },
      { id: 'mb-07', category: 'Mini Biryani', name: 'Mini Gongura Chicken Biryani',         price: 220,
    description: 'Mughlai biryani perfumed and plated solo. Sufficient for 1 person.' },
  
 
  // ───── Breads ─────
  { id: 'br-01', category: 'Breads', name: 'Butter Naan', price: 45,
    description: 'Soft tandoor naan brushed with cultured butter.' },
  { id: 'br-02', category: 'Breads', name: 'Roti',        price: 25,
    description: 'Whole-wheat tandoor roti, brushed with ghee.' },

  // ───── Veg Curries ─────
  { id: 'vc-01', category: 'Veg Curries', name: 'Paneer Butter Masala',      price: 280,
    description: 'Cottage cheese in a silky tomato-fenugreek gravy.' },
  { id: 'vc-02', category: 'Veg Curries', name: 'Kaju Paneer Butter Masala', price: 300,
    description: 'Cashew-and-paneer in a rich, slow-cooked butter masala.' },

  // ───── Non-Veg Curries ─────
  { id: 'nc-01', category: 'Non-Veg Curries', name: 'Egg Burji',       price: 190,
    description: 'Scrambled eggs with onion, tomato, and pepper.' },
  { id: 'nc-02', category: 'Non-Veg Curries', name: 'Butter Chicken',  price: 290,
    description: 'Tandoor-charred chicken in a velvety butter-tomato sauce.' },
  { id: 'nc-03', category: 'Non-Veg Curries', name: 'Chicken Curry',   price: 270,
    description: 'Home-style chicken curry with onion, ginger, and warm spice.' },
])

// ────────────────────────────────────────────────────────
//  ADMIN DASHBOARD COMPATIBILITY EXPORTS
//  Derived from MENU above; no manual data to keep in sync.
// ────────────────────────────────────────────────────────

export type MenuCategoryBlock = {
  key: string
  label: string
  defaultHeading: { prefix: string; italic: string }
  items: MenuItem[]
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-')
}

export const MENU_DATA: Record<string, MenuCategoryBlock> = MENU_CATEGORIES.reduce((acc, label) => {
  const key = slugify(label)
  acc[key] = {
    key,
    label,
    defaultHeading: { prefix: 'Authentic', italic: 'flavor.' },
    items: MENU.filter((m) => m.category === label),
  }
  return acc
}, {} as Record<string, MenuCategoryBlock>)

export const MENU_CATEGORY_KEYS: string[] = MENU_CATEGORIES.map(slugify)

export const MENU_SUGGESTIONS: MenuItem[] = MENU

export function lookupItemByName(name: string): MenuItem | undefined {
  const lc = name.trim().toLowerCase()
  return MENU.find((i) => i.name.toLowerCase() === lc)
}

export function priceByName(name: string, fallback = 0): number {
  return lookupItemByName(name)?.price ?? fallback
}
