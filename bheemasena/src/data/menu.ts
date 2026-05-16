export type MenuTag = 'Spicy' | 'New' | 'Chef' | 'Popular' | 'Vegan'

export type MenuCategory =
  | 'Starters' | 'Soups' | 'Mains' | 'Breads' | 'Desserts' | 'Drinks'

export type MenuItem = {
  id: string
  name: string
  price: number
  description: string
  category: MenuCategory
  tag?: MenuTag
  image?: string
}

export const MENU_CATEGORIES: MenuCategory[] = [
  'Starters', 'Soups', 'Mains', 'Breads', 'Desserts', 'Drinks',
]

export const MENU: MenuItem[] = [
  // ───── Starters ─────
  { id: 'st-01', category: 'Starters', name: "Bheema's Champaran Mutton Bites", price: 480, tag: 'Chef',
    description: 'Slow-cooked mutton chunks finished on the grill — smoke, mustard oil, and warm Bihari spice.' },
  { id: 'st-02', category: 'Starters', name: 'Kurukshetra Kebabs', price: 420, tag: 'Spicy',
    description: 'Twin skewers of minced lamb and chicken, charred over coals with green chilli and pepper.' },
  { id: 'st-03', category: 'Starters', name: "Drona's Dahi Vada", price: 220, tag: 'Popular',
    description: 'Pillowy lentil dumplings soaked in sweet yoghurt, tamarind, and roasted cumin.' },
  { id: 'st-04', category: 'Starters', name: "Arjuna's Avocado Chaat", price: 310, tag: 'New',
    description: 'Avocado and pomegranate over crisp papdi with date-tamarind drizzle and microgreens.' },
  { id: 'st-05', category: 'Starters', name: 'Hastinapur Hara Bhara Kebab', price: 280, tag: 'Vegan',
    description: 'Spinach, peas, and millet patties pan-seared with ginger and green chilli.' },
  { id: 'st-06', category: 'Starters', name: 'Gada Masala Wings', price: 360, tag: 'Spicy',
    description: 'Mace-spiced chicken wings glazed with a fiery red-chilli reduction.' },
  { id: 'st-07', category: 'Starters', name: "Yudhishthira's Yam Chips", price: 240,
    description: 'Twice-fried yam, dusted with chaat masala and curry-leaf salt.' },
  { id: 'st-08', category: 'Starters', name: "Bhima's Pulled Paneer Tikka", price: 340,
    description: 'Hand-pulled paneer marinated in yoghurt and Kashmiri chilli, finished in the tandoor.' },

  // ───── Soups ─────
  { id: 'sp-01', category: 'Soups', name: 'Royal Tomato Shorba', price: 180, tag: 'Popular',
    description: 'Roasted tomato broth with toasted cumin, ghee tempering, and a swirl of cream.' },
  { id: 'sp-02', category: 'Soups', name: 'Spiced Lentil Broth', price: 170,
    description: 'Yellow lentils, asafoetida, and curry leaves — a clear, restorative soup.' },
  { id: 'sp-03', category: 'Soups', name: 'Coconut & Curry Leaf', price: 200, tag: 'Vegan',
    description: 'Coconut milk simmered with curry leaves, ginger, and toasted mustard seeds.' },
  { id: 'sp-04', category: 'Soups', name: "Warrior's Bone Broth", price: 260, tag: 'Chef',
    description: 'Twelve-hour lamb-bone broth, pepper, and ginger — strength in a cup.' },
  { id: 'sp-05', category: 'Soups', name: 'Sweet Corn Saagwala', price: 190,
    description: 'Sweet corn and spinach with a hint of garam masala and cracked pepper.' },
  { id: 'sp-06', category: 'Soups', name: 'Tamarind & Tomato Rasam', price: 180, tag: 'Spicy',
    description: 'Bright, peppery, and tangy — South India in a bowl.' },
  { id: 'sp-07', category: 'Soups', name: 'Pumpkin Coriander', price: 200,
    description: 'Roasted pumpkin pureed with coriander stems and a touch of palm sugar.' },
  { id: 'sp-08', category: 'Soups', name: 'Kashmiri Yakhni', price: 240,
    description: 'Fennel- and cardamom-scented mutton yakhni, finished with saffron threads.' },

  // ───── Mains ─────
  { id: 'mn-01', category: 'Mains', name: "Bheema's Champaran Mutton", price: 620, tag: 'Chef',
    description: 'Mutton sealed and slow-cooked with mustard oil, garlic, and whole spices in a clay handi.' },
  { id: 'mn-02', category: 'Mains', name: 'Indraprastha Butter Chicken', price: 480, tag: 'Popular',
    description: 'Tandoor-charred chicken in a velvety tomato-fenugreek gravy, finished with butter.' },
  { id: 'mn-03', category: 'Mains', name: "Drona's Dal Makhani", price: 360, tag: 'Popular',
    description: 'Black urad slow-simmered overnight with cream, butter, and a whisper of smoke.' },
  { id: 'mn-04', category: 'Mains', name: 'Hastinapur Hyderabadi Biryani', price: 540, tag: 'Spicy',
    description: 'Long-grain basmati layered with marinated meat, mint, fried onion, and saffron.' },
  { id: 'mn-05', category: 'Mains', name: 'Royal Rogan Josh', price: 580,
    description: 'Kashmiri lamb braised in fennel, ginger, and red chilli — fragrant and deep.' },
  { id: 'mn-06', category: 'Mains', name: 'Coastal Konkan Curry', price: 460,
    description: 'Prawns simmered in coconut, kokum, and roasted spice — a Konkan classic.' },
  { id: 'mn-07', category: 'Mains', name: 'Palak Paneer Royale', price: 380, tag: 'Vegan',
    description: 'Cottage cheese in spinach, mustard greens, and methi — finished with smoked ghee.' },
  { id: 'mn-08', category: 'Mains', name: 'Mahabharat Mixed Grill', price: 650, tag: 'Chef',
    description: "A tasting platter from the tandoor — kebab, tikka, malai, paneer, and warrior's chutney." },

  // ───── Breads ─────
  { id: 'br-01', category: 'Breads', name: 'Gada Garlic Naan', price: 120,
    description: 'Soft naan brushed with garlic, butter, and fresh coriander.' },
  { id: 'br-02', category: 'Breads', name: 'Khandav Forest Roti', price: 90,
    description: 'Whole-wheat tandoor roti, brushed with ghee.' },
  { id: 'br-03', category: 'Breads', name: 'Tandoori Laccha Paratha', price: 140,
    description: 'Layered paratha pulled and crisped in the tandoor.' },
  { id: 'br-04', category: 'Breads', name: 'Stuffed Kulcha', price: 160,
    description: 'Spiced potato or paneer filling, toasted on stone with onion-seed crust.' },
  { id: 'br-05', category: 'Breads', name: 'Missi Roti', price: 110,
    description: 'Gram flour and wheat with carom seeds and chopped onion — rustic and warming.' },
  { id: 'br-06', category: 'Breads', name: 'Butter Naan', price: 110,
    description: 'A classic — soft, blistered, brushed with cultured butter.' },
  { id: 'br-07', category: 'Breads', name: 'Roomali Roti', price: 100,
    description: 'Paper-thin handkerchief bread, draped warm at the table.' },
  { id: 'br-08', category: 'Breads', name: 'Cheese Garlic Kulcha', price: 180, tag: 'New',
    description: 'Aged cheddar, mozzarella, and roasted garlic baked in stone.' },

  // ───── Desserts ─────
  { id: 'ds-01', category: 'Desserts', name: 'Hastinapur Halwa', price: 220, tag: 'Chef',
    description: 'Semolina halwa with raisins, cashews, and warm cardamom — served gently glistening.' },
  { id: 'ds-02', category: 'Desserts', name: 'Royal Rabri Kulfi', price: 240, tag: 'Popular',
    description: 'Reduced-milk kulfi with rabri, pistachio, and a thread of saffron.' },
  { id: 'ds-03', category: 'Desserts', name: 'Saffron Phirni', price: 200,
    description: 'Rice and milk pudding chilled in clay, perfumed with saffron and rose.' },
  { id: 'ds-04', category: 'Desserts', name: 'Gulab Jamun Trio', price: 220,
    description: 'Three warm jamun — classic, kala jamun, and stuffed pistachio — in cardamom syrup.' },
  { id: 'ds-05', category: 'Desserts', name: 'Mango Shrikhand', price: 240, tag: 'New',
    description: 'Strained yoghurt whipped with Alphonso mango and toasted almond.' },
  { id: 'ds-06', category: 'Desserts', name: 'Rose & Pistachio Falooda', price: 260,
    description: 'Layered rose syrup, basil seeds, vermicelli, ice cream, and crushed pistachio.' },
  { id: 'ds-07', category: 'Desserts', name: 'Coconut Payasam', price: 220,
    description: 'Coconut milk, jaggery, and rice — a soft, southern finish.' },
  { id: 'ds-08', category: 'Desserts', name: 'Jaggery Gajar Ka Halwa', price: 240,
    description: 'Slow-cooked carrot with palm jaggery, ghee, and toasted nuts.' },

  // ───── Drinks ─────
  { id: 'dr-01', category: 'Drinks', name: 'Cardamom Masala Chai', price: 120,
    description: 'Black tea, ginger, cardamom, and a long simmer — the way it should be.' },
  { id: 'dr-02', category: 'Drinks', name: 'Saffron Badam Milk', price: 160,
    description: 'Almond and milk infused with saffron — served chilled or warm.' },
  { id: 'dr-03', category: 'Drinks', name: 'Royal Rose Lassi', price: 180, tag: 'Popular',
    description: 'Thick yoghurt blended with rose syrup, candied fennel, and pistachio crumble.' },
  { id: 'dr-04', category: 'Drinks', name: 'Tamarind Cooler', price: 150, tag: 'New',
    description: 'Tamarind, jaggery, mint, and lime — bright, sour, and refreshing.' },
  { id: 'dr-05', category: 'Drinks', name: 'Aam Panna', price: 150,
    description: 'Green-mango cooler with roasted cumin and a hint of black salt.' },
  { id: 'dr-06', category: 'Drinks', name: 'Jaljeera Spritz', price: 160,
    description: 'Cumin, mint, and lime, lengthened with sparkling water.' },
  { id: 'dr-07', category: 'Drinks', name: 'Filter Coffee', price: 130,
    description: 'Madras-style filter coffee, brewed strong and frothed with hot milk.' },
  { id: 'dr-08', category: 'Drinks', name: 'Spiced Buttermilk', price: 120,
    description: 'Chaas with curry leaves, green chilli, and a pinch of asafoetida.' },
]
