'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BarrelConfig {
  spiritType: 'bourbon' | 'rye' | 'corn_whiskey' | 'malt_whiskey';
  barrelType: 'new_charred' | 'used_bourbon' | 'sherry' | 'port' | 'rum' | 'wine';
  charLevel: 1 | 2 | 3 | 4;
  barrelSize: 'quarter' | 'half' | 'standard' | 'double';
  warehouse: 'top_floor' | 'middle_floor' | 'ground_floor' | 'rickhouse_center';
  startDate: string;
}

interface AgingResult {
  currentAge: number;
  color: string;
  colorHex: string;
  angelShare: number;
  estimatedAbv: number;
  flavorProfile: {
    vanilla: number;
    caramel: number;
    oak: number;
    spice: number;
    fruit: number;
    smoke: number;
    sweetness: number;
    complexity: number;
  };
  tastingNotes: string[];
  maturityRating: number;
  optimalAge: { min: number; max: number };
  warnings: string[];
}

interface BarrelType {
  name: string;
  influence: number;
  vanillaBoost?: number;
  caramelBoost?: number;
  fruitBoost?: number;
  sweetBoost?: number;
  tropicalBoost?: number;
  tanninBoost?: number;
}

const SPIRIT_CONFIGS = {
  bourbon: { name: 'Bourbon', emoji: '🌽', baseAbv: 62.5, minAge: 24 },
  rye: { name: 'Rye Whiskey', emoji: '🌾', baseAbv: 62.5, minAge: 24 },
  corn_whiskey: { name: 'Corn Whiskey', emoji: '🌽', baseAbv: 62.5, minAge: 0 },
  malt_whiskey: { name: 'Malt Whiskey', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', baseAbv: 63.5, minAge: 36 }
};

const BARREL_CONFIGS: Record<string, BarrelType> = {
  new_charred: { name: 'New Charred Oak', influence: 1.0, vanillaBoost: 1.2, caramelBoost: 1.3 },
  used_bourbon: { name: 'Used Bourbon Barrel', influence: 0.6, vanillaBoost: 0.8, caramelBoost: 0.9 },
  sherry: { name: 'Sherry Cask', influence: 0.8, fruitBoost: 1.5, sweetBoost: 1.3 },
  port: { name: 'Port Cask', influence: 0.75, fruitBoost: 1.4, sweetBoost: 1.2 },
  rum: { name: 'Rum Barrel', influence: 0.7, sweetBoost: 1.4, tropicalBoost: 1.3 },
  wine: { name: 'Wine Barrel', influence: 0.65, fruitBoost: 1.2, tanninBoost: 1.1 }
};

const CHAR_LEVELS = {
  1: { name: 'Light Toast', oakInfluence: 0.7, vanillaBoost: 0.8, smokeBoost: 0.5 },
  2: { name: 'Medium Toast', oakInfluence: 0.85, vanillaBoost: 1.0, smokeBoost: 0.7 },
  3: { name: 'Heavy Char', oakInfluence: 1.0, vanillaBoost: 1.2, smokeBoost: 1.0 },
  4: { name: 'Alligator Char', oakInfluence: 1.15, vanillaBoost: 1.4, smokeBoost: 1.3 }
};

const WAREHOUSE_POSITIONS = {
  top_floor: { name: 'Top Floor (Hot)', tempVariation: 1.3, agingSpeed: 1.4, angelShare: 1.5 },
  middle_floor: { name: 'Middle Floor', tempVariation: 1.0, agingSpeed: 1.0, angelShare: 1.0 },
  ground_floor: { name: 'Ground Floor (Cool)', tempVariation: 0.7, agingSpeed: 0.75, angelShare: 0.7 },
  rickhouse_center: { name: 'Rickhouse Center', tempVariation: 0.9, agingSpeed: 0.9, angelShare: 0.85 }
};

const BARREL_SIZES = {
  quarter: { name: 'Quarter Cask (50L)', agingMultiplier: 2.0, angelShare: 1.5 },
  half: { name: 'Half Barrel (100L)', agingMultiplier: 1.4, angelShare: 1.2 },
  standard: { name: 'Standard (200L)', agingMultiplier: 1.0, angelShare: 1.0 },
  double: { name: 'Double Oak (400L)', agingMultiplier: 0.7, angelShare: 0.8 }
};

const COLOR_STAGES = [
  { age: 0, color: 'Clear/White Dog', hex: '#F5F5DC' },
  { age: 3, color: 'Pale Straw', hex: '#F5DEB3' },
  { age: 6, color: 'Light Gold', hex: '#FFD700' },
  { age: 12, color: 'Gold', hex: '#DAA520' },
  { age: 24, color: 'Amber', hex: '#FFBF00' },
  { age: 48, color: 'Deep Amber', hex: '#FF8C00' },
  { age: 72, color: 'Copper', hex: '#B87333' },
  { age: 120, color: 'Mahogany', hex: '#C04000' },
  { age: 180, color: 'Dark Mahogany', hex: '#8B4513' }
];

function calculateAging(config: BarrelConfig, monthsAged: number): AgingResult {
  const barrel = BARREL_CONFIGS[config.barrelType];
  const char = CHAR_LEVELS[config.charLevel];
  const warehouse = WAREHOUSE_POSITIONS[config.warehouse];
  const size = BARREL_SIZES[config.barrelSize];
  const spirit = SPIRIT_CONFIGS[config.spiritType];

  const effectiveAge = monthsAged * warehouse.agingSpeed * size.agingMultiplier * barrel.influence;
  
  let colorStage = COLOR_STAGES[0];
  for (const stage of COLOR_STAGES) {
    if (effectiveAge >= stage.age) colorStage = stage;
  }

  const yearsAged = monthsAged / 12;
  const baseAngelShare = 3;
  const angelShare = Math.min(40, yearsAged * baseAngelShare * warehouse.angelShare * size.angelShare);
  
  const estimatedAbv = Math.max(40, spirit.baseAbv - (yearsAged * 0.5 * warehouse.tempVariation));

  const flavorProfile = {
    vanilla: Math.min(100, 20 + (effectiveAge * 0.5 * char.vanillaBoost * (barrel.vanillaBoost || 1))),
    caramel: Math.min(100, 15 + (effectiveAge * 0.4 * char.oakInfluence * (barrel.caramelBoost || 1))),
    oak: Math.min(100, 10 + (effectiveAge * 0.6 * char.oakInfluence)),
    spice: Math.min(100, config.spiritType === 'rye' ? 40 + (effectiveAge * 0.3) : 20 + (effectiveAge * 0.2)),
    fruit: Math.min(100, 10 + (effectiveAge * 0.25 * (barrel.fruitBoost || 1))),
    smoke: Math.min(100, 5 + (effectiveAge * 0.15 * char.smokeBoost)),
    sweetness: Math.min(100, 30 + (effectiveAge * 0.35 * (barrel.sweetBoost || 1))),
    complexity: Math.min(100, effectiveAge * 0.8)
  };

  const tastingNotes: string[] = [];
  if (flavorProfile.vanilla > 50) tastingNotes.push('rich vanilla');
  if (flavorProfile.caramel > 50) tastingNotes.push('buttery caramel');
  if (flavorProfile.oak > 60) tastingNotes.push('toasted oak');
  if (flavorProfile.spice > 50) tastingNotes.push('warming spices');
  if (flavorProfile.fruit > 40) tastingNotes.push('dried fruit');
  if (flavorProfile.smoke > 30) tastingNotes.push('subtle smoke');
  if (flavorProfile.sweetness > 60) tastingNotes.push('honey sweetness');
  if (flavorProfile.complexity > 70) tastingNotes.push('layered complexity');
  if (effectiveAge > 60) tastingNotes.push('mature oak tannins');
  if (config.barrelType === 'sherry') tastingNotes.push('sherry influence');
  if (config.barrelType === 'port') tastingNotes.push('port wine notes');

  const optimalMin = spirit.minAge;
  const optimalMax = spirit.minAge + 96;
  let maturityRating = 0;
  if (monthsAged < optimalMin) {
    maturityRating = (monthsAged / optimalMin) * 70;
  } else if (monthsAged <= optimalMax) {
    maturityRating = 70 + ((monthsAged - optimalMin) / (optimalMax - optimalMin)) * 30;
  } else {
    maturityRating = Math.max(50, 100 - ((monthsAged - optimalMax) / 60) * 30);
  }

  const warnings: string[] = [];
  if (monthsAged < spirit.minAge) {
    warnings.push(`Not yet legal ${spirit.name} (requires ${spirit.minAge} months)`);
  }
  if (angelShare > 30) {
    warnings.push('Significant angel\'s share - consider bottling soon');
  }
  if (flavorProfile.oak > 85) {
    warnings.push('Risk of over-oaking - may become too tannic');
  }
  if (monthsAged > optimalMax + 48) {
    warnings.push('Past optimal aging window');
  }

  return {
    currentAge: monthsAged,
    color: colorStage.color,
    colorHex: colorStage.hex,
    angelShare,
    estimatedAbv,
    flavorProfile,
    tastingNotes,
    maturityRating,
    optimalAge: { min: optimalMin, max: optimalMax },
    warnings
  };
}

export default function BarrelAgingPage() {
  const [config, setConfig] = useState<BarrelConfig>({
    spiritType: 'bourbon',
    barrelType: 'new_charred',
    charLevel: 3,
    barrelSize: 'standard',
    warehouse: 'middle_floor',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [monthsAged, setMonthsAged] = useState(24);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<AgingResult | null>(null);

  useEffect(() => {
    setResult(calculateAging(config, monthsAged));
  }, [config, monthsAged]);

  const simulateAging = useCallback(() => {
    setIsSimulating(true);
    let currentMonth = 0;
    const interval = setInterval(() => {
      currentMonth += 1;
      setMonthsAged(currentMonth);
      if (currentMonth >= 120) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const FlavorBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-amber-200/70">{label}</span>
        <span className="text-amber-100">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/20 to-gray-900">
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-flex items-center gap-2">
            ← Back to BarrelVerse
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mt-4">
            🛢️ Virtual Barrel Aging
          </h1>
          <p className="text-amber-200/70 text-lg mt-2">
            Simulate the aging process and predict flavor development
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h2 className="text-xl font-bold text-amber-100 mb-4">⚙️ Barrel Configuration</h2>
              
              <div className="mb-4">
                <label className="text-amber-200/60 text-sm mb-2 block">Spirit Type</label>
                <select
                  value={config.spiritType}
                  onChange={(e) => setConfig({ ...config, spiritType: e.target.value as BarrelConfig['spiritType'] })}
                  className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                >
                  {Object.entries(SPIRIT_CONFIGS).map(([key, val]) => (
                    <option key={key} value={key}>{val.emoji} {val.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-amber-200/60 text-sm mb-2 block">Barrel Type</label>
                <select
                  value={config.barrelType}
                  onChange={(e) => setConfig({ ...config, barrelType: e.target.value as BarrelConfig['barrelType'] })}
                  className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                >
                  {Object.entries(BARREL_CONFIGS).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-amber-200/60 text-sm mb-2 block">Char Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setConfig({ ...config, charLevel: level })}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        config.charLevel === level
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 text-amber-200/70 hover:bg-gray-600'
                      }`}
                    >
                      #{level}
                    </button>
                  ))}
                </div>
                <p className="text-amber-200/40 text-xs mt-1">{CHAR_LEVELS[config.charLevel].name}</p>
              </div>

              <div className="mb-4">
                <label className="text-amber-200/60 text-sm mb-2 block">Barrel Size</label>
                <select
                  value={config.barrelSize}
                  onChange={(e) => setConfig({ ...config, barrelSize: e.target.value as BarrelConfig['barrelSize'] })}
                  className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                >
                  {Object.entries(BARREL_SIZES).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-amber-200/60 text-sm mb-2 block">Warehouse Position</label>
                <select
                  value={config.warehouse}
                  onChange={(e) => setConfig({ ...config, warehouse: e.target.value as BarrelConfig['warehouse'] })}
                  className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100"
                >
                  {Object.entries(WAREHOUSE_POSITIONS).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h2 className="text-xl font-bold text-amber-100 mb-4">⏱️ Aging Time</h2>
              
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-amber-400">
                  {Math.floor(monthsAged / 12)}
                  <span className="text-2xl text-amber-200/60">y</span>
                  {' '}
                  {monthsAged % 12}
                  <span className="text-2xl text-amber-200/60">m</span>
                </div>
                <p className="text-amber-200/50 text-sm mt-1">{monthsAged} months total</p>
              </div>

              <input
                type="range"
                min="0"
                max="240"
                value={monthsAged}
                onChange={(e) => setMonthsAged(parseInt(e.target.value))}
                className="w-full accent-amber-500 mb-4"
                disabled={isSimulating}
              />

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[6, 24, 48, 120].map(months => (
                  <button
                    key={months}
                    onClick={() => setMonthsAged(months)}
                    className="px-2 py-1 bg-gray-700 text-amber-200/70 rounded text-sm hover:bg-gray-600"
                    disabled={isSimulating}
                  >
                    {months < 12 ? `${months}m` : `${months/12}y`}
                  </button>
                ))}
              </div>

              <button
                onClick={simulateAging}
                disabled={isSimulating}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSimulating ? '🔄 Simulating...' : '▶️ Simulate 10 Years'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {result && (
              <>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-amber-100">🥃 Current State</h2>
                    <div 
                      className="w-12 h-12 rounded-full border-4 border-amber-500/30"
                      style={{ backgroundColor: result.colorHex }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                      <div className="text-2xl font-bold" style={{ color: result.colorHex }}>{result.color}</div>
                      <div className="text-amber-200/50 text-sm">Color</div>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400">{result.estimatedAbv.toFixed(1)}%</div>
                      <div className="text-amber-200/50 text-sm">Est. ABV</div>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{result.angelShare.toFixed(1)}%</div>
                      <div className="text-amber-200/50 text-sm">Angel&apos;s Share</div>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{Math.round(result.maturityRating)}</div>
                      <div className="text-amber-200/50 text-sm">Maturity Score</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-200/70">Maturity Progress</span>
                      <span className="text-amber-100">
                        Optimal: {result.optimalAge.min/12}-{result.optimalAge.max/12} years
                      </span>
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${result.maturityRating}%` }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-px bg-green-400"
                        style={{ left: `${(result.optimalAge.min / 240) * 100}%` }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-px bg-green-400"
                        style={{ left: `${(result.optimalAge.max / 240) * 100}%` }}
                      />
                    </div>
                  </div>

                  {result.warnings.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      {result.warnings.map((warning, i) => (
                        <p key={i} className="text-yellow-400 text-sm flex items-center gap-2">
                          ⚠️ {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
                  <h2 className="text-xl font-bold text-amber-100 mb-4">📊 Flavor Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FlavorBar label="Vanilla" value={result.flavorProfile.vanilla} color="bg-yellow-400" />
                      <FlavorBar label="Caramel" value={result.flavorProfile.caramel} color="bg-amber-500" />
                      <FlavorBar label="Oak" value={result.flavorProfile.oak} color="bg-amber-700" />
                      <FlavorBar label="Spice" value={result.flavorProfile.spice} color="bg-red-500" />
                    </div>
                    <div>
                      <FlavorBar label="Fruit" value={result.flavorProfile.fruit} color="bg-purple-500" />
                      <FlavorBar label="Smoke" value={result.flavorProfile.smoke} color="bg-gray-500" />
                      <FlavorBar label="Sweetness" value={result.flavorProfile.sweetness} color="bg-pink-400" />
                      <FlavorBar label="Complexity" value={result.flavorProfile.complexity} color="bg-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
                  <h2 className="text-xl font-bold text-amber-100 mb-4">📝 Predicted Tasting Notes</h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {result.tastingNotes.map((note, i) => (
                      <span 
                        key={i}
                        className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-200 px-4 py-2 rounded-full border border-amber-500/30"
                      >
                        {note}
                      </span>
                    ))}
                    {result.tastingNotes.length === 0 && (
                      <p className="text-amber-200/50">Age longer to develop distinctive notes...</p>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl p-6 border ${
                  result.maturityRating >= 80 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : result.maturityRating >= 50 
                      ? 'bg-amber-900/20 border-amber-500/30'
                      : 'bg-gray-800/50 border-amber-500/10'
                }`}>
                  <h2 className="text-xl font-bold text-amber-100 mb-2">🍾 Bottling Recommendation</h2>
                  <p className="text-amber-200/80">
                    {result.maturityRating >= 90 
                      ? "🌟 Prime time to bottle! This whiskey has reached excellent maturity."
                      : result.maturityRating >= 80
                        ? "✅ Ready for bottling. Good complexity and flavor development."
                        : result.maturityRating >= 60
                          ? "⏳ Getting there. A few more months would add complexity."
                          : result.maturityRating >= 40
                            ? "🕐 Still young. Continue aging for better results."
                            : "🌱 Very young. Let it rest and develop character."
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
