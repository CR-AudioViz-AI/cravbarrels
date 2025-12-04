'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Historical events for each day - this would come from database in production
const HISTORY_EVENTS = [
  {
    date: '12-03',
    year: 1933,
    title: 'Prohibition Ends!',
    category: 'Bourbon',
    icon: '🎉',
    summary: 'The 21st Amendment is ratified, ending 13 years of Prohibition in the United States.',
    fullStory: 'On December 5, 1933 (just 2 days from now in history!), the 21st Amendment was ratified, marking the end of Prohibition. Utah became the 36th state to ratify, providing the necessary three-fourths majority. Americans could legally drink again, and the bourbon industry began its long road to recovery...',
    relatedSpirits: ['Old Forester', 'Medicinal Whiskey'],
    image: null,
    funFact: 'FDR reportedly celebrated with a dirty martini in the White House.'
  },
  {
    date: '12-03',
    year: 1789,
    title: 'First Bourbon Barrel',
    category: 'Bourbon',
    icon: '🥃',
    summary: 'Legend has it that Elijah Craig first charred oak barrels for aging whiskey.',
    fullStory: 'While historians debate the exact date and even who deserves credit, December 1789 is often cited as when Baptist minister Elijah Craig first aged corn whiskey in charred oak barrels in Georgetown, Kentucky. Whether true or not, the charred barrel would become bourbon\'s signature...',
    relatedSpirits: ['Elijah Craig', 'Heaven Hill'],
    funFact: 'The char level on bourbon barrels is graded 1-4, with most distilleries using #3 or #4.'
  },
  {
    date: '12-03',
    year: 1898,
    title: 'Johnnie Walker Goes Global',
    category: 'Scotch',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    summary: 'Johnnie Walker\'s sons expand the brand to 120 countries.',
    fullStory: 'By 1898, Alexander and George Walker had transformed their father\'s grocery store whisky into an international phenomenon. The distinctive square bottle and slanted label made it instantly recognizable worldwide...',
    relatedSpirits: ['Johnnie Walker Black', 'Johnnie Walker Blue'],
    funFact: 'The square bottle was designed to prevent breakage during shipping.'
  }
]

const THIS_WEEK = [
  { date: 'Dec 3', year: 1789, event: 'First charred barrel bourbon', category: 'Bourbon' },
  { date: 'Dec 4', year: 1872, event: 'Jack Daniel registers distillery', category: 'Tennessee' },
  { date: 'Dec 5', year: 1933, event: 'Prohibition officially ends', category: 'History' },
  { date: 'Dec 6', year: 1924, event: 'Last legal bourbon sold pre-Prohibition', category: 'Bourbon' },
  { date: 'Dec 7', year: 1941, event: 'Pearl Harbor changes distillery production', category: 'History' },
  { date: 'Dec 8', year: 1952, event: 'Maker\'s Mark first distilled', category: 'Bourbon' },
  { date: 'Dec 9', year: 2007, event: 'Pappy Van Winkle auction record', category: 'Bourbon' }
]

const QUOTES = [
  { text: 'Too much of anything is bad, but too much good whiskey is barely enough.', author: 'Mark Twain' },
  { text: 'Always carry a flagon of whiskey in case of snakebite and furthermore always carry a small snake.', author: 'W.C. Fields' },
  { text: 'Whiskey is liquid sunshine.', author: 'George Bernard Shaw' },
  { text: 'The water was not fit to drink. To make it palatable, we had to add whiskey. By diligent effort, I learned to like it.', author: 'Winston Churchill' }
]

export default function TodayInHistoryPage() {
  const [currentEvent, setCurrentEvent] = useState(0)
  const [showFullStory, setShowFullStory] = useState(false)
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0])

  useEffect(() => {
    // Random quote for the day
    const quoteIndex = new Date().getDate() % QUOTES.length
    setDailyQuote(QUOTES[quoteIndex])
  }, [])

  const todaysEvents = HISTORY_EVENTS.filter(e => e.date === '12-03')
  const event = todaysEvents[currentEvent] || HISTORY_EVENTS[0]

  const shareEvent = () => {
    const text = `On this day in ${event.year}: ${event.title} - ${event.summary} #BarrelVerse #WhiskeyHistory`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
            <Link href="/history" className="hover:text-amber-400 transition-colors">History</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Feature */}
        <div className="bg-gradient-to-br from-amber-900/50 via-stone-800/50 to-amber-950/50 rounded-3xl p-8 border border-amber-500/30 mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Date Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-600 rounded-xl p-4 text-center">
                  <div className="text-sm uppercase tracking-wide">Dec</div>
                  <div className="text-4xl font-bold">03</div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Today in Spirits History</h1>
                  <p className="text-gray-400">Discover what happened on this day</p>
                </div>
              </div>
              <button
                onClick={shareEvent}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span>🐦</span> Share
              </button>
            </div>

            {/* Event Selector (if multiple) */}
            {todaysEvents.length > 1 && (
              <div className="flex gap-2 mb-6">
                {todaysEvents.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentEvent(i); setShowFullStory(false) }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentEvent ? 'bg-amber-500' : 'bg-stone-600 hover:bg-stone-500'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Main Event */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-6xl">{event.icon}</span>
                  <div>
                    <span className="bg-amber-900/50 text-amber-400 px-3 py-1 rounded-full text-sm">{event.category}</span>
                    <h2 className="text-4xl font-bold mt-2">{event.title}</h2>
                    <p className="text-2xl text-amber-400">{event.year}</p>
                  </div>
                </div>
                
                <p className="text-xl text-gray-300 mb-4">{event.summary}</p>
                
                {showFullStory ? (
                  <div className="bg-black/30 rounded-xl p-6 mb-4">
                    <p className="text-gray-300 leading-relaxed">{event.fullStory}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFullStory(true)}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Read Full Story →
                  </button>
                )}

                {/* Fun Fact */}
                {event.funFact && (
                  <div className="bg-amber-900/30 rounded-xl p-4 mt-4 border border-amber-500/30">
                    <p className="text-sm text-amber-400 font-semibold mb-1">💡 Fun Fact</p>
                    <p className="text-gray-300">{event.funFact}</p>
                  </div>
                )}
              </div>

              {/* Related Spirits */}
              <div className="bg-stone-800/50 rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🥃</span> Related Spirits
                </h3>
                <div className="space-y-3">
                  {event.relatedSpirits.map((spirit, i) => (
                    <Link
                      key={i}
                      href={`/spirits?search=${encodeURIComponent(spirit)}`}
                      className="flex items-center gap-3 bg-stone-700/50 rounded-lg p-3 hover:bg-stone-600/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-amber-900/50 rounded flex items-center justify-center">🥃</div>
                      <span>{spirit}</span>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-700">
                  <Link
                    href="/museum"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-2"
                  >
                    <span>🏛️</span> Explore the Museum →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* This Week in History */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📅</span> This Week in Spirits History
            </h2>
            <div className="space-y-3">
              {THIS_WEEK.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer ${
                    item.date === 'Dec 3' 
                      ? 'bg-amber-900/40 border border-amber-500/30' 
                      : 'bg-stone-700/30 hover:bg-stone-600/30'
                  }`}
                >
                  <div className={`text-center w-16 ${item.date === 'Dec 3' ? 'text-amber-400' : 'text-gray-500'}`}>
                    <div className="text-sm font-bold">{item.date}</div>
                    <div className="text-xs">{item.year}</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.event}</p>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                  {item.date === 'Dec 3' && (
                    <span className="bg-amber-600 text-xs px-2 py-1 rounded-full">TODAY</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Quote */}
          <div className="bg-gradient-to-br from-stone-800/50 to-amber-900/30 rounded-2xl p-6 border border-amber-900/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> Daily Quote
            </h2>
            <div className="relative">
              <span className="text-6xl text-amber-500/30 absolute -top-2 -left-2">"</span>
              <blockquote className="relative z-10 text-xl text-gray-300 italic pl-8 mb-4">
                {dailyQuote.text}
              </blockquote>
              <p className="text-right text-amber-400 font-semibold">— {dailyQuote.author}</p>
            </div>
            
            <button
              onClick={() => {
                const text = `"${dailyQuote.text}" — ${dailyQuote.author} #BarrelVerse #WhiskeyQuotes`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
              }}
              className="w-full mt-6 bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm transition-colors"
            >
              Share This Quote 🐦
            </button>
          </div>
        </div>

        {/* Historical Timeline Teaser */}
        <div className="bg-gradient-to-r from-amber-900/30 via-stone-800/30 to-amber-900/30 rounded-2xl p-8 border border-amber-500/30 text-center">
          <h2 className="text-2xl font-bold mb-4">📜 Explore the Full Timeline</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Dive into centuries of spirits history. From ancient fermentation to modern craft distilling, 
            every era has a story to tell.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/museum" className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors">
              🏛️ Visit the Museum
            </Link>
            <Link href="/history" className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              📖 Browse All History
            </Link>
          </div>
        </div>

        {/* Did You Know */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            { icon: '🏺', fact: 'The oldest known alcoholic drink is mead, dating back to 7000 BC in China.' },
            { icon: '🥃', fact: 'Bourbon must be made in the USA and aged in new charred oak barrels.' },
            { icon: '🍷', fact: 'The world\'s oldest wine bar has been operating in Austria since 1447.' }
          ].map((item, i) => (
            <div key={i} className="bg-stone-800/30 rounded-xl p-6 border border-stone-700/50">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-amber-400 mb-2">Did You Know?</h3>
              <p className="text-gray-400 text-sm">{item.fact}</p>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-12 bg-stone-800/50 rounded-2xl p-8 border border-amber-900/30 text-center">
          <h2 className="text-2xl font-bold mb-2">📧 Get Daily History in Your Inbox</h2>
          <p className="text-gray-400 mb-6">Start each day with a fascinating piece of spirits history</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="bg-amber-600 hover:bg-amber-500 px-6 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
