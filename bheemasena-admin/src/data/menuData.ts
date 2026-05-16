export type MenuTag = 'Spicy' | 'New' | 'Chef' | 'Popular' | 'Vegan'

export type MenuItem = {
  id: string
  name: string
  price: number
  description: string
  category: string
  tag?: MenuTag
  veg?: boolean
}

export type MenuCategoryBlock = {
  key: string
  label: string
  defaultHeading: { prefix: string; italic: string }
  items: MenuItem[]
}

export const MENU_DATA: Record<string, MenuCategoryBlock> = {
  starters: {
    key: 'starters',
    label: 'Starters',
    defaultHeading: { prefix: 'Begin with', italic: 'fire.' },
    items: [
      { id: 'st-01', category: 'starters', veg: false, name: "Bheema's Champaran Mutton Bites", price: 480, tag: 'Chef',
        description: 'Slow-cooked mutton chunks finished on the grill — smoke, mustard oil, and warm Bihari spice.' },
      { id: 'st-02', category: 'starters', veg: false, name: 'Kurukshetra Kebabs', price: 420, tag: 'Spicy',
        description: 'Twin skewers of minced lamb and chicken, charred over coals with green chilli and pepper.' },
      { id: 'st-03', category: 'starters', veg: true,  name: "Drona's Dahi Vada", price: 220, tag: 'Popular',
        description: 'Pillowy lentil dumplings soaked in sweet yoghurt, tamarind, and roasted cumin.' },
      { id: 'st-04', category: 'starters', veg: true,  name: "Arjuna's Avocado Chaat", price: 310, tag: 'New',
        description: 'Avocado and pomegranate over crisp papdi with date-tamarind drizzle and microgreens.' },
      { id: 'st-05', category: 'starters', veg: true,  name: 'Hastinapur Hara Bhara Kebab', price: 280, tag: 'Vegan',
        description: 'Spinach, peas, and millet patties pan-seared with ginger and green chilli.' },
      { id: 'st-06', category: 'starters', veg: false, name: 'Gada Masala Wings', price: 360, tag: 'Spicy',
        description: 'Mace-spiced chicken wings glazed with a fiery red-chilli reduction.' },
      { id: 'st-07', category: 'starters', veg: true,  name: "Yudhishthira's Yam Chips", price: 240,
        description: 'Twice-fried yam, dusted with chaat masala and curry-leaf salt.' },
      { id: 'st-08', category: 'starters', veg: true,  name: "Bhima's Pulled Paneer Tikka", price: 340,
        description: 'Hand-pulled paneer marinated in yoghurt and Kashmiri chilli, finished in the tandoor.' },
    ],
  },
  soups: {
    key: 'soups',
    label: 'Soups',
    defaultHeading: { prefix: 'Warm', italic: 'the soul.' },
    items: [
      { id: 'sp-01', category: 'soups', veg: true,  name: 'Royal Tomato Shorba', price: 180, tag: 'Popular',
        description: 'Roasted tomato broth with toasted cumin, ghee tempering, and a swirl of cream.' },
      { id: 'sp-02', category: 'soups', veg: true,  name: 'Spiced Lentil Broth', price: 170,
        description: 'Yellow lentils, asafoetida, and curry leaves — a clear, restorative soup.' },
      { id: 'sp-03', category: 'soups', veg: true,  name: 'Coconut & Curry Leaf', price: 200, tag: 'Vegan',
        description: 'Coconut milk simmered with curry leaves, ginger, and toasted mustard seeds.' },
      { id: 'sp-04', category: 'soups', veg: false, name: "Warrior's Bone Broth", price: 260, tag: 'Chef',
        description: 'Twelve-hour lamb-bone broth, pepper, and ginger — strength in a cup.' },
      { id: 'sp-05', category: 'soups', veg: true,  name: 'Sweet Corn Saagwala', price: 190,
        description: 'Sweet corn and spinach with a hint of garam masala and cracked pepper.' },
      { id: 'sp-06', category: 'soups', veg: true,  name: 'Tamarind & Tomato Rasam', price: 180, tag: 'Spicy',
        description: 'Bright, peppery, and tangy — South India in a bowl.' },
      { id: 'sp-07', category: 'soups', veg: true,  name: 'Pumpkin Coriander', price: 200,
        description: 'Roasted pumpkin pureed with coriander stems and a touch of palm sugar.' },
      { id: 'sp-08', category: 'soups', veg: false, name: 'Kashmiri Yakhni', price: 240,
        description: 'Fennel- and cardamom-scented mutton yakhni, finished with saffron threads.' },
    ],
  },
  mains: {
    key: 'mains',
    label: 'Mains',
    defaultHeading: { prefix: 'Begin with', italic: 'biryani.' },
    items: [
      { id: 'mn-01', category: 'mains', veg: false, name: "Bheema's Champaran Mutton", price: 620, tag: 'Chef',
        description: 'Mutton sealed and slow-cooked with mustard oil, garlic, and whole spices in a clay handi.' },
      { id: 'mn-02', category: 'mains', veg: false, name: 'Indraprastha Butter Chicken', price: 480, tag: 'Popular',
        description: 'Tandoor-charred chicken in a velvety tomato-fenugreek gravy, finished with butter.' },
      { id: 'mn-03', category: 'mains', veg: true,  name: "Drona's Dal Makhani", price: 360, tag: 'Popular',
        description: 'Black urad slow-simmered overnight with cream, butter, and a whisper of smoke.' },
      { id: 'mn-04', category: 'mains', veg: false, name: 'Hastinapur Hyderabadi Biryani', price: 540, tag: 'Spicy',
        description: 'Long-grain basmati layered with marinated meat, mint, fried onion, and saffron.' },
      { id: 'mn-05', category: 'mains', veg: false, name: 'Royal Rogan Josh', price: 580,
        description: 'Kashmiri lamb braised in fennel, ginger, and red chilli — fragrant and deep.' },
      { id: 'mn-06', category: 'mains', veg: false, name: 'Coastal Konkan Curry', price: 460,
        description: 'Prawns simmered in coconut, kokum, and roasted spice — a Konkan classic.' },
      { id: 'mn-07', category: 'mains', veg: true,  name: 'Palak Paneer Royale', price: 380, tag: 'Vegan',
        description: 'Cottage cheese in spinach, mustard greens, and methi — finished with smoked ghee.' },
      { id: 'mn-08', category: 'mains', veg: false, name: 'Mahabharat Mixed Grill', price: 650, tag: 'Chef',
        description: "A tasting platter from the tandoor — kebab, tikka, malai, paneer, and warrior's chutney." },
    ],
  },
  breads: {
    key: 'breads',
    label: 'Breads',
    defaultHeading: { prefix: 'Hot from', italic: 'the tandoor.' },
    items: [
      { id: 'br-01', category: 'breads', veg: true, name: 'Gada Garlic Naan', price: 120,
        description: 'Soft naan brushed with garlic, butter, and fresh coriander.' },
      { id: 'br-02', category: 'breads', veg: true, name: 'Khandav Forest Roti', price: 90,
        description: 'Whole-wheat tandoor roti, brushed with ghee.' },
      { id: 'br-03', category: 'breads', veg: true, name: 'Tandoori Laccha Paratha', price: 140,
        description: 'Layered paratha pulled and crisped in the tandoor.' },
      { id: 'br-04', category: 'breads', veg: true, name: 'Stuffed Kulcha', price: 160,
        description: 'Spiced potato or paneer filling, toasted on stone with onion-seed crust.' },
      { id: 'br-05', category: 'breads', veg: true, name: 'Missi Roti', price: 110,
        description: 'Gram flour and wheat with carom seeds and chopped onion — rustic and warming.' },
      { id: 'br-06', category: 'breads', veg: true, name: 'Butter Naan', price: 110,
        description: 'A classic — soft, blistered, brushed with cultured butter.' },
      { id: 'br-07', category: 'breads', veg: true, name: 'Roomali Roti', price: 100,
        description: 'Paper-thin handkerchief bread, draped warm at the table.' },
      { id: 'br-08', category: 'breads', veg: true, name: 'Cheese Garlic Kulcha', price: 180, tag: 'New',
        description: 'Aged cheddar, mozzarella, and roasted garlic baked in stone.' },
    ],
  },
  desserts: {
    key: 'desserts',
    label: 'Desserts',
    defaultHeading: { prefix: 'End on', italic: 'a sweet note.' },
    items: [
      { id: 'ds-01', category: 'desserts', veg: true, name: 'Hastinapur Halwa', price: 220, tag: 'Chef',
        description: 'Semolina halwa with raisins, cashews, and warm cardamom — served gently glistening.' },
      { id: 'ds-02', category: 'desserts', veg: true, name: 'Royal Rabri Kulfi', price: 240, tag: 'Popular',
        description: 'Reduced-milk kulfi with rabri, pistachio, and a thread of saffron.' },
      { id: 'ds-03', category: 'desserts', veg: true, name: 'Saffron Phirni', price: 200,
        description: 'Rice and milk pudding chilled in clay, perfumed with saffron and rose.' },
      { id: 'ds-04', category: 'desserts', veg: true, name: 'Gulab Jamun Trio', price: 220,
        description: 'Three warm jamun — classic, kala jamun, and stuffed pistachio — in cardamom syrup.' },
      { id: 'ds-05', category: 'desserts', veg: true, name: 'Mango Shrikhand', price: 240, tag: 'New',
        description: 'Strained yoghurt whipped with Alphonso mango and toasted almond.' },
      { id: 'ds-06', category: 'desserts', veg: true, name: 'Rose & Pistachio Falooda', price: 260,
        description: 'Layered rose syrup, basil seeds, vermicelli, ice cream, and crushed pistachio.' },
      { id: 'ds-07', category: 'desserts', veg: true, name: 'Coconut Payasam', price: 220,
        description: 'Coconut milk, jaggery, and rice — a soft, southern finish.' },
      { id: 'ds-08', category: 'desserts', veg: true, name: 'Jaggery Gajar Ka Halwa', price: 240,
        description: 'Slow-cooked carrot with palm jaggery, ghee, and toasted nuts.' },
    ],
  },
  drinks: {
    key: 'drinks',
    label: 'Drinks',
    defaultHeading: { prefix: 'A toast to', italic: 'the feast.' },
    items: [
      { id: 'dr-01', category: 'drinks', veg: true, name: 'Cardamom Masala Chai', price: 120,
        description: 'Black tea, ginger, cardamom, and a long simmer — the way it should be.' },
      { id: 'dr-02', category: 'drinks', veg: true, name: 'Saffron Badam Milk', price: 160,
        description: 'Almond and milk infused with saffron — served chilled or warm.' },
      { id: 'dr-03', category: 'drinks', veg: true, name: 'Royal Rose Lassi', price: 180, tag: 'Popular',
        description: 'Thick yoghurt blended with rose syrup, candied fennel, and pistachio crumble.' },
      { id: 'dr-04', category: 'drinks', veg: true, name: 'Tamarind Cooler', price: 150, tag: 'New',
        description: 'Tamarind, jaggery, mint, and lime — bright, sour, and refreshing.' },
      { id: 'dr-05', category: 'drinks', veg: true, name: 'Aam Panna', price: 150,
        description: 'Green-mango cooler with roasted cumin and a hint of black salt.' },
      { id: 'dr-06', category: 'drinks', veg: true, name: 'Jaljeera Spritz', price: 160,
        description: 'Cumin, mint, and lime, lengthened with sparkling water.' },
      { id: 'dr-07', category: 'drinks', veg: true, name: 'Filter Coffee', price: 130,
        description: 'Madras-style filter coffee, brewed strong and frothed with hot milk.' },
      { id: 'dr-08', category: 'drinks', veg: true, name: 'Spiced Buttermilk', price: 120,
        description: 'Chaas with curry leaves, green chilli, and a pinch of asafoetida.' },
    ],
  },
}

export const MENU_CATEGORY_KEYS = Object.keys(MENU_DATA)

export const MENU_SUGGESTIONS: MenuItem[] = Object.values(MENU_DATA)
  .flatMap(c => c.items)

export function lookupItemByName(name: string): MenuItem | undefined {
  const lc = name.trim().toLowerCase()
  return MENU_SUGGESTIONS.find(i => i.name.toLowerCase() === lc)
}

export function priceByName(name: string, fallback = 0): number {
  return lookupItemByName(name)?.price ?? fallback
}
