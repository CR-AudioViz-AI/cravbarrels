'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TastingNote {
  id: string
  spiritId: string
  spiritName: string
  spiritBrand: string
  date: string
  rating: number
  nose: string[]
  palate: string[]
  finish: string[]
  overallNotes: string
  mood: string
  setting: string
  photo?: string
  isPublic: boolean
  likes: number
  comments: number
}

interface FlavorCategory {
  name: string
  color: string
  flavors: string[]
}

const flavorWheel: FlavorCategory[] = [
  { name: 'Fruity', color: 'bg-red-500', flavors: ['Apple', 'Cherry', 'Citrus', 'Dried Fruit', 'Berry', 'Peach', 'Pear', 'Tropical'] },
  { name: 'Floral', color: 'bg-pink-500', flavors: ['Rose', 'Lavender', 'Violet', 'Jasmine', 'Honeysuckle', 'Orange Blossom'] },
  { name: 'Spicy', color: 'bg-orange-500', flavors: ['Cinnamon', 'Pepper', 'Clove', 'Nutmeg', 'Ginger', 'Allspice', 'Anise'] },
  { name: 'Sweet', color: 'bg-amber-500', flavors: ['Honey', 'Caramel', 'Vanilla', 'Brown Sugar', 'Maple', 'Toffee', 'Butterscotch'] },
  { name: 'Woody', color: 'bg-yellow-700', flavors: ['Oak', 'Cedar', 'Pine', 'Sandalwood', 'Tobacco', 'Leather'] },
  { name: 'Nutty', color: 'bg-yellow-600', flavors: ['Almond', 'Walnut', 'Hazelnut', 'Pecan', 'Peanut', 'Marzipan'] },
  { name: 'Grain', color: 'bg-yellow-500', flavors: ['Corn', 'Wheat', 'Rye', 'Barley', 'Bread', 'Biscuit'] },
  { name: 'Smoky', color: 'bg-gray-600', flavors: ['Peat', 'Charcoal', 'Campfire', 'Ash', 'BBQ', 'Bacon'] },
]

const moods = ['Celebratory 🎉', 'Relaxed 😌', 'Contemplative 🤔', 'Social 👥', 'Adventurous 🚀', 'Cozy 🏠']
const settings = ['Home Bar', 'Restaurant', 'Distillery Visit', 'Tasting Event', 'Friend\'s Place', 'Special Occasion']

const sampleNotes: TastingNote[] = [
  {
    id: '1',
    spiritId: 'bt-001',
    spiritName: 'Buffalo Trace Kentucky Straight',
    spiritBrand: 'Buffalo Trace',
    date: '2024-12-01',
    rating: 88,
    nose: ['Caramel', 'Vanilla', 'Brown Sugar', 'Oak'],
    palate: ['Honey', 'Toffee', 'Cinnamon', 'Dried Fruit'],
    finish: ['Oak', 'Pepper', 'Caramel'],
    overallNotes: 'A quintessential bourbon experience. Perfect balance of sweetness and spice with a medium finish that invites another sip.',
    mood: 'Relaxed 😌',
    setting: 'Home Bar',
    isPublic: true,
    likes: 24,
    comments: 5,
  },
  {
    id: '2',
    spiritId: 'wt-101',
    spiritName: 'Wild Turkey 101',
    spiritBrand: 'Wild Turkey',
    date: '2024-11-28',
    rating: 85,
    nose: ['Vanilla', 'Caramel', 'Rye Spice', 'Oak'],
    palate: ['Honey', 'Pepper', 'Cinnamon', 'Citrus'],
    finish: ['Long', 'Spicy', 'Oak'],
    overallNotes: 'Bold and unapologetic. The higher proof delivers intense flavors without being harsh. Great value bourbon.',
    mood: 'Social 👥',
    setting: 'Friend\'s Place',
    isPublic: true,
    likes: 18,
    comments: 3,
  },
]

export default function JournalPage() {
  const [notes, setNotes] = useState<TastingNote[]>(sampleNotes)
  const [isCreating, setIsCreating] = useState(false)
  const [activeFlavorTab, setActiveFlavorTab] = useState<'nose' | 'palate' | 'finish'>('nose')
  const [selectedFlavors, setSelectedFlavors] = useState<{ nose: string[], palate: string[], finish: string[] }>({
    nose: [], palate: [], finish: []
  })
  const [newNote, setNewNote] = useState({
    spiritName: '',
    spiritBrand: '',
    rating: 85,
    overallNotes: '',
    mood: '',
    setting: '',
    isPublic: true,
  })
  const [viewingNote, setViewingNote] = useState<TastingNote | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev => ({
      ...prev,
      [activeFlavorTab]: prev[activeFlavorTab].includes(flavor)
        ? prev[activeFlavorTab].filter(f => f !== flavor)
        : [...prev[activeFlavorTab], flavor]
    }))
  }

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    const suggestions = [
      `Based on your ${selectedFlavors.nose.join(', ')} nose notes, this spirit shows classic bourbon character with excellent complexity.`,
      `The ${selectedFlavors.palate.join(', ')} palate suggests a well-aged spirit with good barrel influence.`,
      `Consider pairing with dark chocolate or a mild cigar to complement the ${selectedFlavors.finish.join(', ')} finish.`,
      `Similar spirits you might enjoy: Elijah Craig Small Batch, Four Roses Single Barrel, Woodford Reserve.`,
    ]
    setAiSuggestions(suggestions)
    setIsGeneratingAI(false)
  }

  const saveNote = () => {
    const note: TastingNote = {
      id: Date.now().toString(),
      spiritId: 'new-' + Date.now(),
      spiritName: newNote.spiritName,
      spiritBrand: newNote.spiritBrand,
      date: new Date().toISOString().split('T')[0],
      rating: newNote.rating,
      nose: selectedFlavors.nose,
      palate: selectedFlavors.palate,
      finish: selectedFlavors.finish,
      overallNotes: newNote.overallNotes,
      mood: newNote.mood,
      setting: newNote.setting,
      isPublic: newNote.isPublic,
      likes: 0,
      comments: 0,
    }
    setNotes([note, ...notes])
    setIsCreating(false)
    setSelectedFlavors({ nose: [], palate: [], finish: [] })
    setNewNote({ spiritName: '', spiritBrand: '', rating: 85, overallNotes: '', mood: '', setting: '', isPublic: true })
    setAiSuggestions([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-6">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/profile" className="hover:text-amber-400 transition-colors">Profile</Link>
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📝 Tasting Journal</h1>
            <p className="text-gray-400">Document your whiskey journey with AI-powered insights</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>✨</span> New Tasting Note
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Notes', value: notes.length, icon: '📝' },
            { label: 'Spirits Rated', value: notes.length, icon: '🥃' },
            { label: 'Avg Rating', value: Math.round(notes.reduce((a, n) => a + n.rating, 0) / notes.length) || 0, icon: '⭐' },
            { label: 'This Month', value: notes.filter(n => new Date(n.date).getMonth() === new Date().getMonth()).length, icon: '📅' },
          ].map((stat, i) => (
            <div key={i} className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create New Note Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-amber-900/30 flex justify-between items-center sticky top-0 bg-stone-900 z-10">
                <h2 className="text-2xl font-bold">✨ New Tasting Note</h2>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="p-6 space-y-6">
                {/* Spirit Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Spirit Name *</label>
                    <input
                      type="text"
                      value={newNote.spiritName}
                      onChange={(e) => setNewNote({ ...newNote, spiritName: e.target.value })}
                      className="w-full bg-stone-800 border border-amber-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                      placeholder="e.g., Buffalo Trace Kentucky Straight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand</label>
                    <input
                      type="text"
                      value={newNote.spiritBrand}
                      onChange={(e) => setNewNote({ ...newNote, spiritBrand: e.target.value })}
                      className="w-full bg-stone-800 border border-amber-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                      placeholder="e.g., Buffalo Trace"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rating: {newNote.rating}/100</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newNote.rating}
                    onChange={(e) => setNewNote({ ...newNote, rating: parseInt(e.target.value) })}
                    className="w-full h-3 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Good</span>
                    <span>Excellent</span>
                    <span>Outstanding</span>
                  </div>
                </div>

                {/* Flavor Wheel */}
                <div>
                  <label className="block text-sm font-medium mb-4">Flavor Profile</label>
                  <div className="flex gap-2 mb-4">
                    {(['nose', 'palate', 'finish'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveFlavorTab(tab)}
                        className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                          activeFlavorTab === tab ? 'bg-amber-600' : 'bg-stone-800 hover:bg-stone-700'
                        }`}
                      >
                        {tab === 'nose' ? '👃' : tab === 'palate' ? '👅' : '🔚'} {tab}
                        {selectedFlavors[tab].length > 0 && (
                          <span className="ml-2 bg-amber-800 px-2 py-0.5 rounded-full text-xs">
                            {selectedFlavors[tab].length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-900/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {flavorWheel.map((category) => (
                        <div key={category.name}>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${category.color}`} />
                            {category.name}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {category.flavors.map((flavor) => (
                              <button
                                key={flavor}
                                onClick={() => toggleFlavor(flavor)}
                                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                  selectedFlavors[activeFlavorTab].includes(flavor)
                                    ? `${category.color} text-white`
                                    : 'bg-stone-700 hover:bg-stone-600'
                                }`}
                              >
                                {flavor}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected Flavors Preview */}
                    <div className="mt-4 pt-4 border-t border-amber-900/30">
                      <p className="text-sm text-gray-400 mb-2">Selected for {activeFlavorTab}:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFlavors[activeFlavorTab].length > 0 ? (
                          selectedFlavors[activeFlavorTab].map((flavor) => (
                            <span key={flavor} className="bg-amber-600 px-3 py-1 rounded-full text-sm">
                              {flavor} ×
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">Click flavors above to add</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div>
                  <button
                    onClick={generateAISuggestions}
                    disabled={isGeneratingAI || selectedFlavors.nose.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingAI ? (
                      <>🔄 Generating...</>
                    ) : (
                      <>🤖 Get AI Insights</>
                    )}
                  </button>
                  
                  {aiSuggestions.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🤖</span> AI Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {aiSuggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-gray-300 flex gap-2">
                            <span className="text-purple-400">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Overall Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Overall Notes</label>
                  <textarea
                    value={newNote.overallNotes}
                    onChange={(e) => setNewNote({ ...newNote, overallNotes: e.target.value })}
                    rows={4}
                    className="w-full bg-stone-800 border border-amber-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Describe your overall impressions, what stood out, food pairings, etc..."
                  />
                </div>

                {/* Mood & Setting */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setNewNote({ ...newNote, mood })}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            newNote.mood === mood ? 'bg-amber-600' : 'bg-stone-800 hover:bg-stone-700'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Setting</label>
                    <select
                      value={newNote.setting}
                      onChange={(e) => setNewNote({ ...newNote, setting: e.target.value })}
                      className="w-full bg-stone-800 border border-amber-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select setting...</option>
                      {settings.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visibility */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNote.isPublic}
                      onChange={(e) => setNewNote({ ...newNote, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded accent-amber-500"
                    />
                    <span>Share publicly on community feed</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-amber-900/30">
                  <button
                    onClick={saveNote}
                    disabled={!newNote.spiritName}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    💾 Save Tasting Note
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3 rounded-lg font-semibold bg-stone-700 hover:bg-stone-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Note Modal */}
        {viewingNote && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-amber-900/30 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{viewingNote.spiritName}</h2>
                  <p className="text-gray-400">{viewingNote.spiritBrand}</p>
                </div>
                <button onClick={() => setViewingNote(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-amber-400">{viewingNote.rating}<span className="text-lg text-gray-400">/100</span></div>
                  <div className="text-gray-400">{new Date(viewingNote.date).toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-stone-800/50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold mb-2">👃 Nose</h4>
                    <div className="flex flex-wrap gap-1">
                      {viewingNote.nose.map((f) => (
                        <span key={f} className="bg-amber-900/50 px-2 py-1 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold mb-2">👅 Palate</h4>
                    <div className="flex flex-wrap gap-1">
                      {viewingNote.palate.map((f) => (
                        <span key={f} className="bg-amber-900/50 px-2 py-1 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-stone-800/50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold mb-2">🔚 Finish</h4>
                    <div className="flex flex-wrap gap-1">
                      {viewingNote.finish.map((f) => (
                        <span key={f} className="bg-amber-900/50 px-2 py-1 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-stone-800/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-300">{viewingNote.overallNotes}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>{viewingNote.mood}</span>
                  <span>📍 {viewingNote.setting}</span>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-amber-900/30">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-amber-400">
                    ❤️ {viewingNote.likes}
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-amber-400">
                    💬 {viewingNote.comments}
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-amber-400">
                    📤 Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setViewingNote(note)}
              className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20 hover:border-amber-600/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold group-hover:text-amber-400 transition-colors">{note.spiritName}</h3>
                  <p className="text-sm text-gray-400">{note.spiritBrand}</p>
                </div>
                <div className="text-2xl font-bold text-amber-400">{note.rating}</div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {[...note.nose.slice(0, 3), ...note.palate.slice(0, 2)].map((flavor) => (
                  <span key={flavor} className="bg-amber-900/30 px-2 py-1 rounded text-xs">{flavor}</span>
                ))}
                {note.nose.length + note.palate.length > 5 && (
                  <span className="text-xs text-gray-500">+{note.nose.length + note.palate.length - 5} more</span>
                )}
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 mb-4">{note.overallNotes}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(note.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  <span>❤️ {note.likes}</span>
                  <span>💬 {note.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">No tasting notes yet</h3>
            <p className="text-gray-400 mb-6">Start documenting your whiskey journey!</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your First Note
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
