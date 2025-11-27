import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BarrelVerse | The Ultimate Spirits Platform',
  description: 'The Ultimate Spirits Knowledge & Collection Platform - A CR AudioViz AI Production | Powered by Javari AI',
  keywords: ['bourbon', 'whiskey', 'spirits', 'collection', 'trivia', 'games'],
}

// Navigation component
function Navigation() {
  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/collection', label: 'Collection', icon: '🗄️' },
    { href: '/explore', label: 'Explore', icon: '🔍' },
    { href: '/academy', label: 'Academy', icon: '📚' },
    { href: '/community', label: 'Community', icon: '👥' },
    { href: '/docs', label: 'Docs', icon: '📖' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🥃</span>
            <span className="text-xl font-bold gradient-text">BarrelVerse</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-barrel-100 hover:text-barrel-600 transition-colors"
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-whiskey-400 text-black text-sm font-bold rounded-full">
              0 $PROOF
            </span>
            <button className="px-4 py-2 bg-barrel-500 text-white rounded-lg hover:bg-barrel-600 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center text-xs text-gray-600 hover:text-barrel-500"
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

// Footer component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🥃</span>
              <span className="text-xl font-bold">BarrelVerse</span>
            </div>
            <p className="text-gray-400 text-sm">
              The Ultimate Spirits Knowledge & Collection Platform
            </p>
            <p className="text-gray-500 text-xs mt-2">
              A CR AudioViz AI Production<br/>
              Powered by Javari AI
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/games" className="hover:text-white">Games</Link></li>
              <li><Link href="/collection" className="hover:text-white">Collection</Link></li>
              <li><Link href="/academy" className="hover:text-white">Academy</Link></li>
              <li><Link href="/community" className="hover:text-white">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              <li><Link href="/docs/api" className="hover:text-white">API Reference</Link></li>
              <li><a href="https://github.com/cravai/barrelverse" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/responsible-drinking" className="hover:text-white">Drink Responsibly</Link></li>
            </ul>
            <p className="text-yellow-500 text-xs mt-4">
              🔞 Must be 21+ to use this platform
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CR AudioViz AI, LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="pt-24 md:pt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
