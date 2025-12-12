import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, Target, Clock, Trophy, Gamepad2, 
  Wine, Sparkles, Award, Users, Zap 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Games | CRAVBarrels',
  description: 'Test your spirits knowledge with fun games and earn proof points',
};

const games = [
  {
    id: 'trivia',
    title: 'Spirit Trivia',
    description: 'Test your knowledge across bourbon, scotch, tequila, and more',
    icon: Brain,
    color: 'bg-amber-500',
    badge: 'Popular',
    href: '/games/trivia',
    players: '10K+',
  },
  {
    id: 'blind-tasting',
    title: 'Blind Tasting Challenge',
    description: 'Identify spirits based on tasting notes and descriptions',
    icon: Wine,
    color: 'bg-purple-500',
    badge: 'New',
    href: '/games/blind-tasting',
    players: '5K+',
  },
  {
    id: 'price-guess',
    title: 'Price is Right',
    description: 'Guess the retail price of rare and collectible bottles',
    icon: Target,
    color: 'bg-green-500',
    href: '/games/price-guess',
    players: '8K+',
  },
  {
    id: 'speed-round',
    title: 'Speed Round',
    description: '60 seconds to answer as many questions as possible',
    icon: Clock,
    color: 'bg-red-500',
    badge: 'Challenge',
    href: '/games/speed-round',
    players: '7K+',
  },
  {
    id: 'daily-challenge',
    title: 'Daily Challenge',
    description: 'New questions every day with bonus proof rewards',
    icon: Sparkles,
    color: 'bg-blue-500',
    badge: 'Daily',
    href: '/games/daily',
    players: '15K+',
  },
  {
    id: 'multiplayer',
    title: 'Head to Head',
    description: 'Challenge friends or random opponents in real-time',
    icon: Users,
    color: 'bg-orange-500',
    badge: 'Coming Soon',
    href: '#',
    players: 'Soon',
  },
];

const categories = [
  { name: 'Bourbon', count: 85, href: '/games/trivia?category=bourbon' },
  { name: 'Scotch', count: 72, href: '/games/trivia?category=scotch' },
  { name: 'Tequila', count: 45, href: '/games/trivia?category=tequila' },
  { name: 'Rum', count: 38, href: '/games/trivia?category=rum' },
  { name: 'Gin', count: 32, href: '/games/trivia?category=gin' },
  { name: 'Cognac', count: 28, href: '/games/trivia?category=cognac' },
];

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gamepad2 className="h-10 w-10 text-amber-500" />
          <h1 className="text-4xl font-bold">Game Center</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Test your spirits knowledge, compete with friends, and earn proof points
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <div className="text-2xl font-bold">392</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">91</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">50K+</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">1M+</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid */}
      <h2 className="text-2xl font-bold mb-6">Choose Your Game</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {games.map((game) => (
          <Link key={game.id} href={game.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${game.color}`}>
                    <game.icon className="h-6 w-6 text-white" />
                  </div>
                  {game.badge && (
                    <Badge variant={game.badge === 'Coming Soon' ? 'secondary' : 'default'}>
                      {game.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-amber-600 transition-colors">
                  {game.title}
                </CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{game.players} players</span>
                  <Button variant="ghost" size="sm" className="group-hover:text-amber-600">
                    Play Now →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Category Quick Links */}
      <h2 className="text-2xl font-bold mb-6">Play by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link key={cat.name} href={cat.href}>
            <Card className="hover:border-amber-500 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="font-semibold">{cat.name}</div>
                <div className="text-sm text-muted-foreground">{cat.count} questions</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
