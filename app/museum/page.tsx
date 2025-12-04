'use client'

import { useState } from 'react'
import Link from 'next/link'

// Museum Wing Types - All properly typed
interface HistoricalFigure {
  name: string
  years: string
  role: string
  contribution: string
  image?: string
  quote?: string
}

interface BottleEvolution {
  era: string
  year: string
  description: string
  changes: string[]
  rarity: 'common' | 'rare' | 'legendary'
}

interface HistoricalEvent {
  year: number
  title: string
  description: string
  impact: string
  type: 'founding' | 'disaster' | 'law' | 'innovation' | 'milestone'
}

interface LegendaryBottle {
  name: string
  distillery: string
  year: string
  value: string
  story: string
  rarity: 'rare' | 'legendary' | 'mythical'
  lastSeen?: string
}

interface MuseumExhibit {
  id: string
  title: string
  icon: string
  description: string
}

interface MuseumWing {
  name: string
  icon: string
  tagline: string
  color: string
  entranceDescription: string
  timeline: HistoricalEvent[]
  pioneers: HistoricalFigure[]
  bottles: BottleEvolution[]
  legendary: LegendaryBottle[]
  exhibits: MuseumExhibit[]
}

// Complete Museum Data
const MUSEUM_WINGS: Record<string, MuseumWing> = {
  bourbon: {
    name: 'Bourbon Heritage Wing',
    icon: '🥃',
    tagline: 'America\'s Native Spirit',
    color: 'amber',
    entranceDescription: 'You enter through towering oak doors into a hall bathed in warm amber light. The scent of charred oak and vanilla fills the air...',
    
    timeline: [
      { year: 1789, title: 'Birth of Bourbon', description: 'Baptist minister Elijah Craig is credited with aging corn whiskey in charred oak barrels in Georgetown, Kentucky', impact: 'Created the distinctive flavor profile that defines bourbon', type: 'founding' as const },
      { year: 1791, title: 'Whiskey Rebellion', description: 'Alexander Hamilton\'s whiskey tax sparks violent protests in Pennsylvania', impact: 'Many distillers flee west to Kentucky, establishing the bourbon heartland', type: 'law' as const },
      { year: 1821, title: 'Bourbon County Naming', description: 'The spirit from Bourbon County, Kentucky gains its name', impact: 'Bourbon becomes recognized as a distinct category', type: 'milestone' as const },
      { year: 1870, title: 'E.H. Taylor Jr. Era', description: 'Colonel Edmund Haynes Taylor Jr. modernizes bourbon production', impact: 'Introduced standards for aging and bottling that persist today', type: 'innovation' as const },
      { year: 1897, title: 'Bottled-in-Bond Act', description: 'First consumer protection law guarantees bourbon authenticity', impact: 'Established 100 proof, 4+ year age, single distillery requirements', type: 'law' as const },
      { year: 1920, title: 'Prohibition Begins', description: 'The 18th Amendment devastates the bourbon industry', impact: 'Only 6 distilleries survive with medicinal permits', type: 'disaster' as const },
      { year: 1933, title: 'Prohibition Ends', description: 'The 21st Amendment restores legal bourbon production', impact: 'Surviving distilleries emerge as industry giants', type: 'milestone' as const },
      { year: 1964, title: 'Congress Declares Bourbon "America\'s Native Spirit"', description: 'Official recognition as a distinctly American product', impact: 'Protected bourbon as a regulated product category', type: 'law' as const },
      { year: 1984, title: 'Single Barrel Era Begins', description: 'Blanton\'s releases the first single barrel bourbon', impact: 'Created the premium bourbon category', type: 'innovation' as const },
      { year: 2000, title: 'Bourbon Boom Begins', description: 'Global demand for bourbon explodes', impact: 'Prices and production surge, age statements disappear', type: 'milestone' as const },
      { year: 2019, title: 'Kentucky Bourbon Trail Surpasses 1.5M Visitors', description: 'Tourism becomes major industry driver', impact: 'Distilleries invest heavily in visitor experiences', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'Elijah Craig', years: '1738-1808', role: 'Father of Bourbon', contribution: 'First to age whiskey in charred oak barrels, creating bourbon\'s signature flavor', quote: 'The char brings out the sweetness of the oak.' },
      { name: 'Jacob Beam', years: '1760-1834', role: 'Beam Family Patriarch', contribution: 'Started the Jim Beam dynasty in 1795, now 8 generations of distillers', quote: 'Family first, whiskey second.' },
      { name: 'Edmund Haynes Taylor Jr.', years: '1830-1923', role: 'The Architect of Bourbon', contribution: 'Modernized production, advocated for Bottled-in-Bond Act, built Castle & Key', quote: 'Bourbon should reflect the honor of its maker.' },
      { name: 'Julian "Pappy" Van Winkle Sr.', years: '1874-1965', role: 'Legend of Wheated Bourbon', contribution: 'Created the most sought-after bourbon in history, Pappy Van Winkle', quote: 'We make fine bourbon. At a profit if we can, at a loss if we must, but always fine bourbon.' },
      { name: 'Booker Noe', years: '1929-2004', role: 'Father of Small Batch', contribution: 'Created Booker\'s, Baker\'s, Basil Hayden\'s, and Knob Creek - the Small Batch Collection', quote: 'There\'s no way you can make bad bourbon and have good bourbon.' },
      { name: 'Jimmy Russell', years: '1934-Present', role: 'Buddha of Bourbon', contribution: '60+ years at Wild Turkey, longest-tenured master distiller in history', quote: 'A good bourbon should taste like Kentucky.' }
    ],
    
    bottles: [
      { era: 'Pre-Prohibition', year: '1870-1919', description: 'Hand-blown glass, cork stoppers, paper labels', changes: ['Unique imperfections', 'Wax seals common', 'Embossed distillery names'], rarity: 'legendary' as const },
      { era: 'Prohibition Medical', year: '1920-1933', description: 'Only "medicinal" whiskey, pharmacy labels', changes: ['Prescription bottles', 'Government stamps', 'Limited branding'], rarity: 'legendary' as const },
      { era: 'Post-Prohibition', year: '1933-1950', description: 'Standardized glass, screw caps introduced', changes: ['Consistent shapes', 'Colorful labels', 'Tax stamps'], rarity: 'rare' as const },
      { era: 'Mid-Century Modern', year: '1950-1980', description: 'Decanters, commemoratives, promotional bottles', changes: ['Creative shapes', 'Ceramic bottles', 'Gift sets'], rarity: 'rare' as const },
      { era: 'Craft Renaissance', year: '2000-Present', description: 'Return to heritage aesthetics, premium packaging', changes: ['Heavy glass', 'Cork closures', 'Numbered releases'], rarity: 'common' as const }
    ],
    
    legendary: [
      { name: 'Pappy Van Winkle 23 Year', distillery: 'Buffalo Trace', year: '2000-Present', value: '$3,000-$10,000+', story: 'The holy grail of bourbon. Aged in specially selected barrels for over two decades. Annual releases sell out in seconds.', rarity: 'mythical' as const, lastSeen: 'Annual lottery release' },
      { name: 'Old Fitzgerald Stitzel-Weller', distillery: 'Stitzel-Weller', year: '1950s', value: '$2,000-$8,000', story: 'The original wheated bourbon from the legendary Stitzel-Weller distillery, closed in 1992.', rarity: 'legendary' as const, lastSeen: 'Private collections' },
      { name: 'A.H. Hirsch 16 Year', distillery: 'Michter\'s', year: 'Distilled 1974', value: '$1,500-$5,000', story: 'Distilled at Michter\'s before it closed, accidentally aged 16 years when the owner died.', rarity: 'legendary' as const, lastSeen: 'Extremely rare at auction' },
      { name: 'George T. Stagg (Early Releases)', distillery: 'Buffalo Trace', year: '2002-2005', value: '$1,000-$3,000', story: 'The first releases of the annual Antique Collection before the bourbon boom.', rarity: 'legendary' as const },
      { name: 'Double Eagle Very Rare', distillery: 'Buffalo Trace', year: 'First release 2019', value: '$2,000-$4,000', story: '20-year aged bourbon in a crystal decanter with silver eagle stopper. Limited to 199 bottles.', rarity: 'mythical' as const }
    ],
    
    exhibits: [
      { id: 'barrel-room', title: 'The Barrel Aging Room', icon: '🛢️', description: 'Learn how charred oak transforms white dog into golden bourbon' },
      { id: 'mash-bill', title: 'Mash Bill Laboratory', icon: '🧪', description: 'Explore the grain recipes that create different bourbon styles' },
      { id: 'tasting-notes', title: 'Flavor Profile Gallery', icon: '👅', description: 'Interactive tasting wheel and flavor education' },
      { id: 'prohibition', title: 'Prohibition Vault', icon: '🚫', description: 'The dark years and the distilleries that survived' }
    ]
  },
  
  scotch: {
    name: 'Scotch Whisky Heritage Wing',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    tagline: 'The Water of Life',
    color: 'amber',
    entranceDescription: 'Entering through ancient stone archways, the scent of peat smoke and sea salt fills the air. Tartan banners hang from the rafters...',
    
    timeline: [
      { year: 1494, title: 'First Written Record', description: 'Friar John Cor ordered to make "aqua vitae" for King James IV', impact: 'Earliest documented evidence of Scotch whisky distillation', type: 'founding' as const },
      { year: 1644, title: 'First Whisky Tax', description: 'Scottish Parliament imposes tax on whisky', impact: 'Drives distillation underground, creates smuggling culture', type: 'law' as const },
      { year: 1823, title: 'Excise Act', description: 'Legal framework for licensed distilleries established', impact: 'Modern Scotch industry begins, illegal stills decline', type: 'law' as const },
      { year: 1831, title: 'Coffey Still Patent', description: 'Aeneas Coffey patents continuous still', impact: 'Enables grain whisky production, leads to blended Scotch', type: 'innovation' as const },
      { year: 1853, title: 'First Blended Scotch', description: 'Andrew Usher creates first commercial blend', impact: 'Makes Scotch accessible worldwide', type: 'innovation' as const },
      { year: 1880, title: 'Phylloxera Crisis', description: 'Vine disease destroys French wine and cognac industry', impact: 'Scotch fills the gap, becomes global spirit', type: 'milestone' as const },
      { year: 1920, title: 'Prohibition Opportunity', description: 'American Prohibition creates smuggling demand', impact: 'Scottish distilleries boom supplying bootleggers', type: 'milestone' as const },
      { year: 1988, title: 'Scotch Whisky Act', description: 'Legal definition of Scotch whisky established', impact: 'Protected geographical indication, quality standards', type: 'law' as const },
      { year: 2000, title: 'Single Malt Renaissance', description: 'Global demand for single malts explodes', impact: 'Premium Scotch becomes luxury investment', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'John Walker', years: '1805-1857', role: 'The Striding Man', contribution: 'Founded the brand that would become Johnnie Walker, world\'s best-selling Scotch', quote: 'Keep walking.' },
      { name: 'George Smith', years: '1792-1871', role: 'Father of The Glenlivet', contribution: 'First legal distillery in Speyside region in 1824', quote: 'The Glenlivet is the single malt by which all others are judged.' },
      { name: 'Aeneas Coffey', years: '1780-1852', role: 'The Engineer', contribution: 'Invented the continuous still that enabled mass production of grain whisky' },
      { name: 'Tommy Dewar', years: '1864-1930', role: 'The Ambassador', contribution: 'Traveled the world promoting Dewar\'s, pioneered modern spirits marketing' }
    ],
    
    bottles: [
      { era: 'Victorian Era', year: '1850-1900', description: 'Elegant decanters, crystal bottles, ornate labels', changes: ['Hand-blown glass', 'Gold lettering', 'Royal warrants displayed'], rarity: 'legendary' as const },
      { era: 'Edwardian Era', year: '1900-1920', description: 'Mass production begins, consistent branding', changes: ['Standard bottles', 'Printed labels', 'Export designs'], rarity: 'rare' as const },
      { era: 'Post-War', year: '1945-1970', description: 'Rebuilding era, focus on blends', changes: ['Cylindrical bottles', 'Metallic labels', 'Age statements introduced'], rarity: 'rare' as const },
      { era: 'Single Malt Era', year: '1970-2000', description: 'Rise of single malts, premium packaging', changes: ['Distinctive distillery shapes', 'Cork closures return', 'Gift packaging'], rarity: 'common' as const }
    ],
    
    legendary: [
      { name: 'The Macallan 1926 Fine & Rare', distillery: 'The Macallan', year: '1926', value: '$1.9 Million (Auction Record)', story: 'The most expensive bottle of whisky ever sold. Only 40 bottles from this cask, 12 with Valerio Adami labels.', rarity: 'mythical' as const, lastSeen: 'Private collection' },
      { name: 'Dalmore 62', distillery: 'Dalmore', year: '1942 Vintage', value: '$250,000+', story: 'Only 12 bottles ever released. One was drunk by the buyer at the hotel bar.', rarity: 'mythical' as const },
      { name: 'Port Ellen Annual Releases', distillery: 'Port Ellen (Closed 1983)', year: '1978-1982 distillates', value: '$1,000-$5,000+', story: 'From a closed Islay distillery. Each annual release becomes more valuable.', rarity: 'legendary' as const }
    ],
    
    exhibits: [
      { id: 'regions', title: 'The Five Regions', icon: '🗺️', description: 'Speyside, Highlands, Lowlands, Islay, Campbeltown' },
      { id: 'peat', title: 'The Peat Bogs', icon: '🔥', description: 'How peat smoke creates distinctive Islay character' },
      { id: 'casks', title: 'The Cask Collection', icon: '🛢️', description: 'Ex-bourbon, sherry, port, wine - the wood that shapes flavor' },
      { id: 'angels-share', title: 'The Angel\'s Share', icon: '👼', description: 'The whisky lost to evaporation during aging' }
    ]
  },
  
  wine: {
    name: 'Wine & Vineyard Gallery',
    icon: '🍷',
    tagline: '8,000 Years of Viticulture',
    color: 'purple',
    entranceDescription: 'You descend into a candlelit cellar, ancient oak barrels line the walls. The smell of fermenting grapes and aged oak surrounds you...',
    
    timeline: [
      { year: -6000, title: 'Earliest Wine Evidence', description: 'Chemical evidence of wine found in Georgia (country)', impact: 'Wine predates recorded history by millennia', type: 'founding' as const },
      { year: -3000, title: 'Egyptian Winemaking', description: 'Hieroglyphics depict wine production for pharaohs', impact: 'Wine becomes symbol of status and religion', type: 'milestone' as const },
      { year: 1855, title: 'Bordeaux Classification', description: 'Napoleon III orders ranking of Bordeaux wines', impact: 'Created the Grand Cru system still used today', type: 'law' as const },
      { year: 1863, title: 'Phylloxera Epidemic Begins', description: 'American vine louse devastates European vineyards', impact: 'Nearly destroyed European wine, grafting saved the industry', type: 'disaster' as const },
      { year: 1976, title: 'Judgment of Paris', description: 'California wines beat French in blind tasting', impact: 'Revolutionized global wine industry, legitimized New World wines', type: 'milestone' as const },
      { year: 2000, title: 'Natural Wine Movement', description: 'Return to minimal intervention winemaking', impact: 'Changed consumer expectations about wine production', type: 'innovation' as const }
    ],
    
    pioneers: [
      { name: 'Dom Pérignon', years: '1638-1715', role: 'Father of Champagne', contribution: 'Perfected the méthode champenoise, though he didn\'t invent champagne', quote: 'Come quickly, I am tasting the stars!' },
      { name: 'Louis Pasteur', years: '1822-1895', role: 'The Scientist', contribution: 'Discovered fermentation process and pasteurization, saved the wine industry', quote: 'A bottle of wine contains more philosophy than all the books in the world.' },
      { name: 'Robert Mondavi', years: '1913-2008', role: 'California Wine Pioneer', contribution: 'Made Napa Valley world-class, pioneered wine tourism and education' }
    ],
    
    bottles: [
      { era: 'Ancient Amphorae', year: '6000 BC-500 AD', description: 'Clay vessels sealed with resin and wax', changes: ['Two-handled design', 'Pointed bottoms for sand storage', 'Regional shapes for identification'], rarity: 'legendary' as const },
      { era: 'Medieval Era', year: '500-1600', description: 'Ceramic jugs, wood casks, early glass', changes: ['Barrel transport dominant', 'Glass becomes luxury item'], rarity: 'legendary' as const },
      { era: 'Birth of the Wine Bottle', year: '1600-1800', description: 'Coal furnaces enable consistent glass production', changes: ['Onion shape evolves to cylinder', 'Corks replace wooden bungs', 'Labels begin appearing'], rarity: 'rare' as const },
      { era: 'Modern Era', year: '1800-Present', description: 'Standardized bottles, regional shapes', changes: ['Burgundy: sloped shoulders', 'Bordeaux: high shoulders', 'Alsace: tall and slender'], rarity: 'common' as const }
    ],
    
    legendary: [
      { name: 'Château Margaux 1787', distillery: 'Château Margaux', year: '1787', value: '$500,000+', story: 'Believed to belong to Thomas Jefferson. Dropped and shattered in 1989, still the most expensive wine damage ever.', rarity: 'mythical' as const },
      { name: 'Romanée-Conti', distillery: 'Domaine de la Romanée-Conti', year: 'Any vintage', value: '$10,000-$500,000+', story: 'Only 450 cases produced per year from 4.5 acres. The most prestigious wine in Burgundy.', rarity: 'legendary' as const },
      { name: 'Screaming Eagle Cabernet', distillery: 'Screaming Eagle', year: '1992-Present', value: '$3,000-$10,000+', story: 'California cult wine that proved New World could rival Old World prices and prestige.', rarity: 'legendary' as const }
    ],
    
    exhibits: [
      { id: 'terroir', title: 'The Terroir Theater', icon: '🌍', description: 'How soil, climate, and geography create unique wines' },
      { id: 'varietals', title: 'Grape Variety Hall', icon: '🍇', description: '1,000+ grape varieties from around the world' },
      { id: 'cellars', title: 'Famous Cellars of the World', icon: '🏰', description: 'Virtual tours of legendary wine cellars' }
    ]
  },
  
  moonshine: {
    name: 'Moonshine & Prohibition Gallery',
    icon: '🏔️',
    tagline: 'The Outlaw Spirit',
    color: 'gray',
    entranceDescription: 'A hidden door behind a bookshelf leads to a dimly lit room. Mason jars glow in the lantern light, copper stills bubble in the shadows...',
    
    timeline: [
      { year: 1791, title: 'Whiskey Tax Imposed', description: 'Hamilton\'s excise tax triggers the Whiskey Rebellion', impact: 'Distillers flee to Appalachian mountains, moonshine culture born', type: 'law' as const },
      { year: 1794, title: 'Whiskey Rebellion Suppressed', description: 'President Washington leads 13,000 militia to crush rebellion', impact: 'Federal tax authority established, underground distilling becomes way of life', type: 'disaster' as const },
      { year: 1860, title: 'Civil War Moonshining', description: 'Both sides need whiskey for "medical purposes"', impact: 'Remote stills multiply, techniques improve', type: 'milestone' as const },
      { year: 1920, title: 'Prohibition Begins', description: 'National alcohol ban creates massive demand for moonshine', impact: 'Golden age of illegal distilling, organized crime involvement', type: 'law' as const },
      { year: 1933, title: 'Prohibition Ends', description: 'Legal alcohol returns, but moonshine tradition continues', impact: 'Mountain culture persists, NASCAR born from running shine', type: 'milestone' as const },
      { year: 2010, title: 'Legal Moonshine Era', description: 'Laws change to allow commercial "moonshine" production', impact: 'Ole Smoky, Midnight Moon and others commercialize the tradition', type: 'innovation' as const }
    ],
    
    pioneers: [
      { name: 'Marvin "Popcorn" Sutton', years: '1946-2009', role: 'Last Real Moonshiner', contribution: 'Legendary Appalachian moonshiner who documented traditional techniques', quote: 'I\'m a damn legend. I\'m the real deal.' },
      { name: 'Junior Johnson', years: '1931-2019', role: 'From Moonshine to NASCAR', contribution: 'Ran moonshine before becoming NASCAR legend, later launched Midnight Moon', quote: 'If it wasn\'t for whiskey, NASCAR wouldn\'t exist.' },
      { name: 'Joe & Jessi Baker', years: '2010-Present', role: 'Ole Smoky Founders', contribution: 'Created the first federally licensed distillery in Gatlinburg, TN' }
    ],
    
    bottles: [
      { era: 'Revolutionary Era', year: '1750-1800', description: 'Ceramic jugs, wooden barrels, anything available', changes: ['No labels', 'X marks quality', 'Hidden caches'], rarity: 'legendary' as const },
      { era: 'Mason Jar Era', year: '1858-Present', description: 'Mason jars become iconic moonshine container', changes: ['Easy to transport', 'Reusable', 'Clear to show quality'], rarity: 'common' as const },
      { era: 'Prohibition Innovation', year: '1920-1933', description: 'Creative concealment methods', changes: ['Hollow canes', 'False bottom wagons', 'Hip flasks'], rarity: 'rare' as const },
      { era: 'Legal Moonshine', year: '2010-Present', description: 'Commercial moonshine with authentic styling', changes: ['Mason jar aesthetic', 'Flavored varieties', 'Heritage branding'], rarity: 'common' as const }
    ],
    
    legendary: [
      { name: 'Popcorn Sutton\'s Original', distillery: 'Mountain Still', year: 'Pre-2009', value: 'Priceless (Illegal)', story: 'Any surviving jars from Popcorn\'s actual stills are treasured cultural artifacts.', rarity: 'mythical' as const },
      { name: 'Thunder Road White Lightning', distillery: 'Various', year: '1920-1960', value: 'Historical Interest', story: 'The moonshine that outran federal agents and birthed NASCAR.', rarity: 'legendary' as const }
    ],
    
    exhibits: [
      { id: 'still-types', title: 'The Still Gallery', icon: '⚗️', description: 'Pot stills, thumpers, worms, and submariners' },
      { id: 'running-shine', title: 'Running Shine', icon: '🚗', description: 'How moonshine runners became NASCAR legends' },
      { id: 'recipes', title: 'Traditional Recipes', icon: '📜', description: 'Corn whiskey, apple brandy, and fruit shine' },
      { id: 'revenuers', title: 'Revenuers vs. Moonshiners', icon: '👮', description: 'The cat-and-mouse game that lasted 200 years' }
    ]
  },
  
  beer: {
    name: 'Brewery & Beer Hall',
    icon: '🍺',
    tagline: 'Liquid Bread Since 10,000 BC',
    color: 'yellow',
    entranceDescription: 'Massive copper kettles gleam in the morning light. Sacks of grain line the walls. The yeasty smell of fermentation fills this cathedral to beer...',
    
    timeline: [
      { year: -10000, title: 'Earliest Beer Evidence', description: 'Stone-age beer residue found in Middle East', impact: 'Beer may have driven the agricultural revolution', type: 'founding' as const },
      { year: -1800, title: 'Hymn to Ninkasi', description: 'Sumerian poem doubles as beer recipe', impact: 'Oldest written beer recipe known to exist', type: 'milestone' as const },
      { year: 1516, title: 'German Purity Law', description: 'Reinheitsgebot restricts ingredients to water, barley, hops', impact: 'Defined beer for 500 years, still influences German brewing', type: 'law' as const },
      { year: 1842, title: 'First Pilsner', description: 'Josef Groll creates golden lager in Pilsen', impact: 'The most influential beer style ever created', type: 'innovation' as const },
      { year: 1876, title: 'Pasteurization of Beer', description: 'Pasteur\'s techniques applied to beer', impact: 'Beer can now be shipped worldwide without spoiling', type: 'innovation' as const },
      { year: 1978, title: 'Homebrewing Legalized', description: 'President Carter signs H.R. 1337', impact: 'Seeds the American craft beer revolution', type: 'law' as const },
      { year: 1980, title: 'American Craft Beer Born', description: 'Sierra Nevada, Anchor Steam, Samuel Adams emerge', impact: 'Changed beer from commodity to craft', type: 'milestone' as const },
      { year: 2020, title: 'Hazy IPA Dominance', description: 'New England IPA becomes most popular craft style', impact: 'Flavor profiles shift from bitter to fruity/hazy', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'Josef Groll', years: '1813-1887', role: 'Creator of Pilsner', contribution: 'Invented the golden lager that would become the world\'s most popular beer style' },
      { name: 'Fritz Maytag', years: '1937-2023', role: 'Father of Craft Beer', contribution: 'Saved Anchor Brewing in 1965, pioneered American craft brewing' },
      { name: 'Ken Grossman', years: '1954-Present', role: 'Sierra Nevada Founder', contribution: 'Created Sierra Nevada Pale Ale, defining American hop character' },
      { name: 'Jim Koch', years: '1949-Present', role: 'Boston Beer Founder', contribution: 'Made Samuel Adams a household name, proved craft could scale' }
    ],
    
    bottles: [
      { era: 'Ancient Vessels', year: '10000 BC-500 AD', description: 'Clay pots, gourds, animal skins', changes: ['Communal drinking', 'Straws used to filter', 'No carbonation'], rarity: 'legendary' as const },
      { era: 'Medieval Tankards', year: '500-1800', description: 'Pewter, wood, leather, early glass', changes: ['Individual portions', 'Pub culture emerges', 'Measures standardized'], rarity: 'rare' as const },
      { era: 'Industrial Era', year: '1800-1935', description: 'Mass production of glass bottles', changes: ['Crown cap invented 1892', 'Brown glass protects from light', 'Labels for branding'], rarity: 'rare' as const },
      { era: 'Can Age', year: '1935-Present', description: 'Aluminum cans join bottles', changes: ['First beer can 1935', 'Pull-tab 1962', 'Craft cans 2010s'], rarity: 'common' as const }
    ],
    
    legendary: [
      { name: 'Westvleteren 12', distillery: 'Sint-Sixtusabdij', year: 'Ongoing', value: '$15-30/bottle (when available)', story: 'Trappist monks brew limited quantities, must call ahead to reserve, no markups allowed.', rarity: 'rare' as const },
      { name: 'Pliny the Younger', distillery: 'Russian River', year: 'Annual Release', value: 'Priceless (Not Sold Retail)', story: 'Released once a year, lines form for days, started the modern hype beer culture.', rarity: 'legendary' as const },
      { name: 'Utopias', distillery: 'Samuel Adams', year: 'Biennial', value: '$200+/bottle', story: '28% ABV, aged in various spirit barrels, illegal in 15 states.', rarity: 'rare' as const }
    ],
    
    exhibits: [
      { id: 'styles', title: 'World Beer Styles', icon: '🌍', description: '100+ beer styles from lagers to wild ales' },
      { id: 'hops', title: 'The Hop Garden', icon: '🌿', description: 'Cascade to Citra - the flavors of hops' },
      { id: 'trappist', title: 'Trappist Brewery Chapel', icon: '⛪', description: 'The 14 authentic Trappist breweries' },
      { id: 'homebrew', title: 'Homebrewing Lab', icon: '🔬', description: 'How the craft revolution started in garages' }
    ]
  },
  
  rum: {
    name: 'Caribbean Rum Pavilion',
    icon: '🏴‍☠️',
    tagline: 'Spirit of the Caribbean',
    color: 'orange',
    entranceDescription: 'Palm trees sway, the scent of molasses and tropical fruit fills the air. A pirate ship\'s figurehead guards the entrance...',
    
    timeline: [
      { year: 1493, title: 'Sugar Cane Arrives', description: 'Columbus brings sugar cane to the Caribbean', impact: 'Sets the stage for rum production', type: 'founding' as const },
      { year: 1650, title: 'First Rum Distillation', description: 'Barbados plantation slaves discover molasses fermentation', impact: 'Rum industry born from sugar production waste', type: 'founding' as const },
      { year: 1655, title: 'British Navy Rum Ration', description: 'Royal Navy begins daily rum ration', impact: 'Rum becomes currency and culture for 315 years', type: 'milestone' as const },
      { year: 1730, title: 'Golden Age of Piracy', description: 'Pirates and privateers spread rum across the Atlantic', impact: 'Rum becomes symbol of rebellion and freedom', type: 'milestone' as const },
      { year: 1862, title: 'Bacardi Founded', description: 'Don Facundo Bacardí Massó creates smooth white rum', impact: 'Revolutionized rum production with charcoal filtration', type: 'innovation' as const },
      { year: 1970, title: 'Black Tot Day', description: 'Royal Navy ends 315-year rum ration tradition', impact: 'End of an era, remaining rations become collectible', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'Don Facundo Bacardí Massó', years: '1814-1886', role: 'Father of Modern Rum', contribution: 'Created smooth, mixable white rum with charcoal filtration', quote: 'Quality is not an act, it is a habit.' },
      { name: 'John D. Taylor', years: '1830-1900', role: 'Velvet Falernum Creator', contribution: 'Created the Caribbean liqueur essential to tiki drinks' },
      { name: 'Richard Seale', years: '1960-Present', role: 'Foursquare Master', contribution: 'Elevating Barbados rum to whisky-level complexity and collectibility' }
    ],
    
    legendary: [
      { name: 'Black Tot Last Consignment', distillery: 'Royal Navy Blend', year: '1970', value: '$1,000+/pour', story: 'The last rum ration, saved from Black Tot Day. Each pour is from 50+ year old naval stores.', rarity: 'mythical' as const },
      { name: 'Foursquare Exceptional Cask', distillery: 'Foursquare', year: 'Various', value: '$100-500+', story: 'Richard Seale\'s single cask releases that rival the finest whisky.', rarity: 'legendary' as const },
      { name: 'Appleton Estate 50 Year', distillery: 'Appleton Estate', year: 'Limited Release', value: '$5,000+', story: 'The oldest rum from Jamaica, half a century in tropical aging.', rarity: 'legendary' as const }
    ],
    
    exhibits: [
      { id: 'pirates', title: 'Pirates & Privateers', icon: '☠️', description: 'How rum fueled the Golden Age of Piracy' },
      { id: 'navy', title: 'The Navy Grog Room', icon: '⚓', description: '315 years of Royal Navy rum tradition' },
      { id: 'tiki', title: 'Tiki Temple', icon: '🗿', description: 'The mid-century rum cocktail renaissance' },
      { id: 'sugar', title: 'From Cane to Glass', icon: '🌴', description: 'The journey from sugar plantation to fine rum' }
    ]
  },
  
  tequila: {
    name: 'Mexican Agave Spirits Gallery',
    icon: '🌵',
    tagline: 'Spirit of Mexico',
    color: 'green',
    entranceDescription: 'The sun beats down on fields of blue agave stretching to the horizon. Adobe walls cool the hacienda entrance...',
    
    timeline: [
      { year: 1000, title: 'Pulque Origins', description: 'Aztecs ferment agave sap into pulque', impact: 'Sacred drink of Mesoamerica for millennia', type: 'founding' as const },
      { year: 1600, title: 'Spanish Distillation', description: 'Conquistadors bring distillation to Mexico', impact: 'Mezcal and tequila production begins', type: 'innovation' as const },
      { year: 1795, title: 'First Tequila License', description: 'José María Guadalupe de Cuervo receives first license', impact: 'Jose Cuervo becomes first official tequila producer', type: 'milestone' as const },
      { year: 1974, title: 'Denomination of Origin', description: 'Tequila gets geographical protection', impact: 'Only spirits from designated regions can be called tequila', type: 'law' as const },
      { year: 2003, title: 'Premium Tequila Boom', description: 'Patrón and celebrity brands drive high-end market', impact: 'Tequila transforms from shot to sipping spirit', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'José María Guadalupe de Cuervo', years: '1758-1812', role: 'First Licensed Producer', contribution: 'Received first tequila production license from Spanish Crown' },
      { name: 'Don Cenobio Sauza', years: '1842-1909', role: 'Blue Agave Pioneer', contribution: 'Identified Blue Weber agave as ideal for tequila, first to export to US' },
      { name: 'John DeJoria', years: '1944-Present', role: 'Patrón Co-Founder', contribution: 'Elevated tequila to luxury spirit status' }
    ],
    
    legendary: [
      { name: 'Clase Azul Ultra', distillery: 'Clase Azul', year: 'Ongoing', value: '$1,700+', story: 'Presented in hand-painted decanter with platinum, amber accents, and 24k gold label.', rarity: 'rare' as const },
      { name: 'Ley .925 Pasión Azteca', distillery: 'Ley .925', year: '2006', value: '$225,000', story: 'Most expensive tequila ever sold. Platinum and white gold bottle by Fernando Altamirano.', rarity: 'mythical' as const },
      { name: 'Fortaleza Winter Blend', distillery: 'Fortaleza', year: 'Limited Release', value: '$100-200', story: 'Small-batch traditional production, highly allocated.', rarity: 'legendary' as const }
    ],
    
    exhibits: [
      { id: 'agave', title: 'The Agave Fields', icon: '🌱', description: '7-8 years to harvest a single plant' },
      { id: 'mezcal', title: 'Mezcal: The Mother Spirit', icon: '🔥', description: 'All tequila is mezcal, not all mezcal is tequila' },
      { id: 'jimador', title: 'The Jimador\'s Art', icon: '🔪', description: 'The skilled harvesters of agave' },
      { id: 'cocktails', title: 'Margarita & Beyond', icon: '🍹', description: 'Classic and modern tequila cocktails' }
    ]
  },
  
  vodka: {
    name: 'Eastern European Vodka Hall',
    icon: '🇷🇺',
    tagline: 'Water of Life',
    color: 'blue',
    entranceDescription: 'Snow falls gently past frosted windows. Crystal decanters catch the light. The room is minimalist, pure, like vodka itself...',
    
    timeline: [
      { year: 1405, title: 'First Written Record', description: 'Polish court documents mention "wódka"', impact: 'Earliest documented use of the word vodka', type: 'founding' as const },
      { year: 1863, title: 'Column Still Adoption', description: 'Russian distillers adopt continuous distillation', impact: 'Created the clean, neutral vodka profile', type: 'innovation' as const },
      { year: 1917, title: 'Russian Revolution', description: 'Bolsheviks seize vodka production', impact: 'Vodka becomes state monopoly, recipes flee west', type: 'disaster' as const },
      { year: 1933, title: 'Smirnoff Arrives in USA', description: 'Emigrant Rudolph Kunett brings Smirnoff to America', impact: 'Vodka enters Western consciousness', type: 'milestone' as const },
      { year: 1981, title: 'Absolut Campaign', description: 'Absolut\'s iconic print campaign launches', impact: 'Made vodka fashionable and marketing-driven', type: 'milestone' as const },
      { year: 2000, title: 'Super Premium Era', description: 'Grey Goose, Belvedere create luxury vodka category', impact: 'Vodka becomes status symbol', type: 'milestone' as const }
    ],
    
    pioneers: [
      { name: 'Pyotr Smirnov', years: '1831-1898', role: 'Smirnoff Founder', contribution: 'Built the world\'s largest vodka empire before the Revolution' },
      { name: 'Lars Olsson Smith', years: '1836-1913', role: 'King of Vodka', contribution: 'Invented continuous distillation for vodka, founded Absolut\'s predecessor' },
      { name: 'Sidney Frank', years: '1919-2006', role: 'Grey Goose Creator', contribution: 'Created the super-premium vodka category from nothing' }
    ],
    
    legendary: [
      { name: 'Billionaire Vodka', distillery: 'Leon Verres', year: 'Special Order', value: '$3.7 Million', story: 'Filtered through diamonds, Nordic birch charcoal, and sand from crushed gems.', rarity: 'mythical' as const },
      { name: 'Russo-Baltique Vodka', distillery: 'Russo-Baltique', year: '2015', value: '$1.3 Million', story: 'Bottle made from bulletproof glass, gold, and diamond-encrusted cap.', rarity: 'mythical' as const },
      { name: 'Stolichnaya Elit', distillery: 'Stolichnaya', year: 'Ongoing', value: '$60-100', story: 'Freeze-filtered at -18°C for ultimate purity.', rarity: 'rare' as const }
    ],
    
    exhibits: [
      { id: 'purity', title: 'The Pursuit of Purity', icon: '💎', description: 'Filtration methods from charcoal to diamonds' },
      { id: 'poland-russia', title: 'The Eternal Debate', icon: '⚔️', description: 'Poland vs. Russia: Where was vodka born?' },
      { id: 'ingredients', title: 'Beyond Potatoes', icon: '🌾', description: 'Wheat, rye, grapes, and unexpected bases' },
      { id: 'cocktails', title: 'The Martini Lounge', icon: '🍸', description: 'Vodka\'s role in cocktail culture' }
    ]
  }
}

export default function MuseumPage() {
  const [selectedWing, setSelectedWing] = useState<string>('bourbon')
  const [currentExhibit, setCurrentExhibit] = useState<string>('timeline')
  const [visitedWings, setVisitedWings] = useState<string[]>(['bourbon'])
  const [showTimeline, setShowTimeline] = useState(true)
  
  const wing = MUSEUM_WINGS[selectedWing as keyof typeof MUSEUM_WINGS]
  
  const selectWing = (wingId: string) => {
    setSelectedWing(wingId)
    if (!visitedWings.includes(wingId)) {
      setVisitedWings([...visitedWings, wingId])
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <div className="flex items-center gap-4">
            <Link href="/tour" className="hover:text-amber-400 transition-colors">Virtual Tours</Link>
            <Link href="/academy" className="hover:text-amber-400 transition-colors">Academy</Link>
            <span className="bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full text-sm">
              🏛️ {visitedWings.length}/{Object.keys(MUSEUM_WINGS).length} Wings Visited
            </span>
          </div>
        </div>
      </header>
      
      {/* Museum Hero */}
      <div className="relative bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 py-16 border-b border-amber-900/30">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4">🏛️ The Spirits History Museum</h1>
          <p className="text-xl text-gray-400 mb-6">Walk through 10,000 years of alcohol history</p>
          <p className="text-gray-500 max-w-3xl mx-auto">
            Explore galleries dedicated to bourbon, scotch, wine, moonshine, beer, rum, tequila, vodka, and more.
            Discover the pioneers, legendary bottles, historical timelines, and fascinating stories behind the world&apos;s spirits.
          </p>
        </div>
      </div>
      
      {/* Wing Selector */}
      <div className="bg-stone-800/50 border-b border-stone-700/50 py-4 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-gray-400 whitespace-nowrap">Select Gallery:</span>
            {Object.entries(MUSEUM_WINGS).map(([id, w]) => (
              <button
                key={id}
                onClick={() => selectWing(id)}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedWing === id
                    ? 'bg-amber-600 scale-105'
                    : visitedWings.includes(id)
                      ? 'bg-green-900/50 hover:bg-green-800/50'
                      : 'bg-stone-700 hover:bg-stone-600'
                }`}
              >
                <span>{w.icon}</span>
                <span className="hidden sm:inline">{w.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {wing && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Wing Header */}
          <div className="bg-gradient-to-br from-amber-900/30 via-stone-800/50 to-amber-950/30 rounded-3xl p-8 border border-amber-500/30 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="text-6xl mb-4">{wing.icon}</div>
              <h2 className="text-4xl font-bold mb-2">{wing.name}</h2>
              <p className="text-2xl text-amber-400 mb-4">{wing.tagline}</p>
              <p className="text-gray-300 italic">{wing.entranceDescription}</p>
            </div>
          </div>
          
          {/* Exhibit Navigation */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setCurrentExhibit('timeline')}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                currentExhibit === 'timeline' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              <span>📅</span> Historical Timeline
            </button>
            <button
              onClick={() => setCurrentExhibit('pioneers')}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                currentExhibit === 'pioneers' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              <span>👤</span> Pioneers &amp; Legends
            </button>
            <button
              onClick={() => setCurrentExhibit('bottles')}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                currentExhibit === 'bottles' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              <span>🍾</span> Bottle Evolution
            </button>
            <button
              onClick={() => setCurrentExhibit('legendary')}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                currentExhibit === 'legendary' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              <span>💎</span> Legendary Bottles
            </button>
            <button
              onClick={() => setCurrentExhibit('exhibits')}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                currentExhibit === 'exhibits' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              <span>🎭</span> Special Exhibits
            </button>
          </div>
          
          {/* Timeline Exhibit */}
          {currentExhibit === 'timeline' && wing.timeline && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>📅</span> Historical Timeline
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700" />
                
                <div className="space-y-6">
                  {wing.timeline.map((event, i) => (
                    <div key={i} className="relative pl-20">
                      {/* Timeline dot */}
                      <div className={`absolute left-6 w-5 h-5 rounded-full border-2 ${
                        event.type === 'founding' ? 'bg-green-500 border-green-400' :
                        event.type === 'disaster' ? 'bg-red-500 border-red-400' :
                        event.type === 'law' ? 'bg-blue-500 border-blue-400' :
                        event.type === 'innovation' ? 'bg-purple-500 border-purple-400' :
                        'bg-amber-500 border-amber-400'
                      }`} />
                      
                      <div className="bg-stone-700/50 rounded-xl p-5 border border-stone-600/50 hover:border-amber-500/50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl font-bold text-amber-400">
                            {event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            event.type === 'founding' ? 'bg-green-900/50 text-green-400' :
                            event.type === 'disaster' ? 'bg-red-900/50 text-red-400' :
                            event.type === 'law' ? 'bg-blue-900/50 text-blue-400' :
                            event.type === 'innovation' ? 'bg-purple-900/50 text-purple-400' :
                            'bg-amber-900/50 text-amber-400'
                          }`}>
                            {event.type.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                        <p className="text-gray-400 mb-3">{event.description}</p>
                        <p className="text-sm text-amber-400/80 flex items-center gap-2">
                          <span>💡</span> Impact: {event.impact}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Pioneers Exhibit */}
          {currentExhibit === 'pioneers' && wing.pioneers && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>👤</span> Pioneers &amp; Legends
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {wing.pioneers.map((pioneer, i) => (
                  <div key={i} className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 rounded-xl p-6 border border-stone-600/50">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-amber-900/50 rounded-full flex items-center justify-center text-4xl">
                        👤
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">{pioneer.name}</h4>
                        <p className="text-amber-400 text-sm">{pioneer.years}</p>
                        <p className="text-gray-500 text-sm italic">{pioneer.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mt-4">{pioneer.contribution}</p>
                    {pioneer.quote && (
                      <blockquote className="mt-4 pl-4 border-l-2 border-amber-500 text-gray-400 italic">
                        &quot;{pioneer.quote}&quot;
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Bottle Evolution Exhibit */}
          {currentExhibit === 'bottles' && wing.bottles && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>🍾</span> Bottle Evolution Through the Ages
              </h3>
              <div className="space-y-6">
                {wing.bottles.map((era, i) => (
                  <div key={i} className="bg-stone-700/50 rounded-xl p-6 border border-stone-600/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold">{era.era}</h4>
                        <p className="text-amber-400">{era.year}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        era.rarity === 'legendary' ? 'bg-yellow-900/50 text-yellow-400' :
                        era.rarity === 'rare' ? 'bg-purple-900/50 text-purple-400' :
                        'bg-stone-600 text-gray-400'
                      }`}>
                        {era.rarity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{era.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {era.changes.map((change, j) => (
                        <span key={j} className="bg-stone-600/50 px-3 py-1 rounded-full text-sm text-gray-400">
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legendary Bottles Exhibit */}
          {currentExhibit === 'legendary' && wing.legendary && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>💎</span> Legendary &amp; Mythical Bottles
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {wing.legendary.map((bottle, i) => (
                  <div key={i} className={`rounded-xl p-6 border ${
                    bottle.rarity === 'mythical' 
                      ? 'bg-gradient-to-br from-yellow-900/30 via-amber-900/30 to-orange-900/30 border-yellow-500/50'
                      : 'bg-gradient-to-br from-purple-900/30 via-stone-800/50 to-amber-900/30 border-purple-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">
                        {bottle.rarity === 'mythical' ? '🏆' : '💎'}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        bottle.rarity === 'mythical' 
                          ? 'bg-yellow-600 text-black'
                          : 'bg-purple-600 text-white'
                      }`}>
                        {bottle.rarity.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold mb-1">{bottle.name}</h4>
                    <p className="text-amber-400 text-sm mb-1">{bottle.distillery}</p>
                    <p className="text-gray-500 text-sm mb-3">{bottle.year}</p>
                    <p className="text-2xl font-bold text-green-400 mb-3">{bottle.value}</p>
                    <p className="text-gray-300 mb-3">{bottle.story}</p>
                    {bottle.lastSeen && (
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-600">Last Known:</span> {bottle.lastSeen}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Special Exhibits */}
          {currentExhibit === 'exhibits' && wing.exhibits && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>🎭</span> Special Exhibits
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {wing.exhibits.map((exhibit, i) => (
                  <button
                    key={i}
                    className="bg-gradient-to-br from-stone-700/50 to-stone-800/50 rounded-xl p-6 border border-stone-600/50 hover:border-amber-500/50 transition-all text-left group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{exhibit.icon}</div>
                    <h4 className="text-xl font-bold mb-2">{exhibit.title}</h4>
                    <p className="text-gray-400">{exhibit.description}</p>
                    <div className="mt-4 text-amber-400 text-sm flex items-center gap-2">
                      <span>Explore Exhibit</span>
                      <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Museum Stats */}
          <div className="mt-12 bg-gradient-to-r from-amber-900/30 via-stone-800/50 to-amber-900/30 rounded-2xl p-8 border border-amber-500/30">
            <h3 className="text-xl font-bold mb-6 text-center">🏛️ Your Museum Journey</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">{visitedWings.length}</div>
                <div className="text-gray-500 text-sm">Wings Visited</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">{Object.keys(MUSEUM_WINGS).length}</div>
                <div className="text-gray-500 text-sm">Total Wings</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {Math.round((visitedWings.length / Object.keys(MUSEUM_WINGS).length) * 100)}%
                </div>
                <div className="text-gray-500 text-sm">Complete</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {visitedWings.length >= Object.keys(MUSEUM_WINGS).length ? '🏆' : '🎯'}
                </div>
                <div className="text-gray-500 text-sm">
                  {visitedWings.length >= Object.keys(MUSEUM_WINGS).length ? 'Master Curator!' : 'Keep Exploring'}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Footer CTA */}
      <div className="bg-stone-900/50 border-t border-stone-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Test Your Knowledge?</h3>
          <p className="text-gray-400 mb-6">Everything you&apos;ve learned in the museum can help you in our trivia games!</p>
          <div className="flex justify-center gap-4">
            <Link href="/games" className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-xl font-bold transition-colors">
              🎮 Play Trivia
            </Link>
            <Link href="/academy" className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-xl font-bold transition-colors">
              📚 Take Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
