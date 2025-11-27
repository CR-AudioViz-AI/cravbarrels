import Link from 'next/link'

const COURSES = [
  {
    id: 'bourbon-101',
    title: 'Bourbon 101',
    category: 'bourbon',
    icon: '🥃',
    level: 'Beginner',
    lessons: 8,
    duration: '2 hours',
    description: 'Learn the fundamentals of American bourbon whiskey.',
    topics: ['History', 'Production', 'Tasting', 'Key Producers'],
    reward: 200,
  },
  {
    id: 'scotch-regions',
    title: 'Scotch Regions Master',
    category: 'scotch',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    level: 'Intermediate',
    lessons: 10,
    duration: '3 hours',
    description: 'Explore all five Scottish whisky regions in depth.',
    topics: ['Speyside', 'Highland', 'Lowland', 'Islay', 'Campbeltown'],
    reward: 300,
  },
  {
    id: 'wine-fundamentals',
    title: 'Wine Fundamentals',
    category: 'wine',
    icon: '🍷',
    level: 'Beginner',
    lessons: 12,
    duration: '4 hours',
    description: 'From grapes to glass - understand wine completely.',
    topics: ['Grape Varieties', 'Regions', 'Tasting', 'Food Pairing'],
    reward: 250,
  },
  {
    id: 'craft-beer',
    title: 'Craft Beer Expert',
    category: 'beer',
    icon: '🍺',
    level: 'Intermediate',
    lessons: 10,
    duration: '3 hours',
    description: 'Navigate the world of craft beer like a pro.',
    topics: ['Styles', 'Brewing', 'Tasting', 'Pairings'],
    reward: 250,
  },
  {
    id: 'tequila-mezcal',
    title: 'Agave Spirits Deep Dive',
    category: 'tequila',
    icon: '🌵',
    level: 'Advanced',
    lessons: 8,
    duration: '2.5 hours',
    description: 'Master tequila and mezcal production and tasting.',
    topics: ['Agave', 'Production', 'Classifications', 'Tasting'],
    reward: 300,
  },
  {
    id: 'cocktail-craft',
    title: 'Cocktail Craft',
    category: 'mixed',
    icon: '🍸',
    level: 'Beginner',
    lessons: 15,
    duration: '4 hours',
    description: 'Learn classic cocktails and bartending techniques.',
    topics: ['Equipment', 'Techniques', 'Classic Recipes', 'Modern Twists'],
    reward: 350,
  },
]

const CERTIFICATIONS = [
  {
    name: 'Bourbon Enthusiast',
    icon: '🏅',
    requirements: 'Complete Bourbon 101 + pass exam',
    holders: 1250,
  },
  {
    name: 'Scotch Scholar',
    icon: '🎓',
    requirements: 'Complete 3 Scotch courses + pass exam',
    holders: 890,
  },
  {
    name: 'Wine Sommelier (Basic)',
    icon: '🍇',
    requirements: 'Complete Wine Fundamentals + pass exam',
    holders: 2100,
  },
  {
    name: 'Spirits Master',
    icon: '👑',
    requirements: 'Complete 10 courses across 5 categories',
    holders: 156,
  },
]

export default function AcademyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">📚 BarrelVerse Academy</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn from beginner to expert. Earn certifications. 
          Get rewarded with $PROOF for completing courses.
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-barrel-500">50+</p>
          <p className="text-gray-600">Courses</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-barrel-500">13</p>
          <p className="text-gray-600">Categories</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-barrel-500">25+</p>
          <p className="text-gray-600">Certifications</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-barrel-500">10K+</p>
          <p className="text-gray-600">Graduates</p>
        </div>
      </div>
      
      {/* Featured Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">📖 Featured Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{course.icon}</span>
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📖 {course.lessons} lessons</span>
                  <span>⏱️ {course.duration}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-whiskey-500 font-semibold">+{course.reward} $PROOF</span>
                  <button className="px-4 py-2 bg-barrel-500 text-white rounded-lg text-sm font-medium hover:bg-barrel-600 transition-colors">
                    Start Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/academy/all" className="text-barrel-500 hover:underline font-medium">
            View all 50+ courses →
          </Link>
        </div>
      </section>
      
      {/* Certifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🏆 Certifications</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert.name} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{cert.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.requirements}</p>
                  <p className="text-xs text-gray-500 mt-1">{cert.holders.toLocaleString()} holders</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Learning Path */}
      <section className="bg-gradient-to-br from-barrel-500 to-barrel-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🎯 Personalized Learning Path</h2>
        <p className="opacity-90 mb-6">
          Tell us your interests and experience level, and we'll create a custom learning path just for you.
        </p>
        <button className="px-6 py-3 bg-white text-barrel-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
          Start Assessment
        </button>
      </section>
    </div>
  )
}
