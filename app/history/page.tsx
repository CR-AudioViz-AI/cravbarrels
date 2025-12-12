import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, MapPin, Users, Landmark, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Spirit History & Museum | CRAVBarrels',
  description: 'Explore the rich history of distilled spirits from around the world',
};

const eras = [
  {
    period: 'Ancient Origins',
    years: '2000 BCE - 800 CE',
    description: 'The birth of distillation in ancient civilizations',
    topics: ['Mesopotamian brewing', 'Egyptian alcohol', 'Greek distillation', 'Roman wine culture'],
  },
  {
    period: 'Medieval Alchemy',
    years: '800 - 1500',
    description: 'Monks and alchemists refine distillation techniques',
    topics: ['Monastery distilleries', 'Aqua vitae', 'Medicinal spirits', 'Trade routes'],
  },
  {
    period: 'Age of Exploration',
    years: '1500 - 1700',
    description: 'Spirits spread across the globe with colonial expansion',
    topics: ['Caribbean rum', 'Dutch genever', 'Spanish brandy', 'New World distilling'],
  },
  {
    period: 'Industrial Revolution',
    years: '1700 - 1900',
    description: 'Mass production transforms the spirits industry',
    topics: ['Column stills', 'Bourbon birth', 'Scotch evolution', 'Phylloxera crisis'],
  },
  {
    period: 'Prohibition Era',
    years: '1920 - 1933',
    description: 'The great American experiment and its global impact',
    topics: ['Speakeasies', 'Bootlegging', 'Canadian whisky', 'Cocktail culture'],
  },
  {
    period: 'Modern Renaissance',
    years: '1980 - Present',
    description: 'Craft distilling and premiumization reshape the industry',
    topics: ['Craft movement', 'Japanese whisky', 'Mezcal revival', 'Collector culture'],
  },
];

const regions = [
  { name: 'Scotland', spirits: ['Single Malt', 'Blended Scotch'], icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Kentucky', spirits: ['Bourbon', 'Rye'], icon: '🇺🇸' },
  { name: 'Mexico', spirits: ['Tequila', 'Mezcal'], icon: '🇲🇽' },
  { name: 'Caribbean', spirits: ['Rum', 'Rhum Agricole'], icon: '🏝️' },
  { name: 'France', spirits: ['Cognac', 'Armagnac'], icon: '🇫🇷' },
  { name: 'Japan', spirits: ['Japanese Whisky', 'Shochu'], icon: '🇯🇵' },
];

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Landmark className="h-10 w-10 text-amber-600" />
          <h1 className="text-4xl font-bold">Spirit History Museum</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Journey through centuries of distillation, from ancient alchemy to modern craft
        </p>
      </div>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-500" />
          Historical Timeline
        </h2>
        <div className="space-y-6">
          {eras.map((era, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">{era.years}</Badge>
                    <CardTitle>{era.period}</CardTitle>
                    <CardDescription>{era.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {era.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-amber-500" />
          Spirit Regions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <Link key={region.name} href={`/explore?region=${region.name.toLowerCase()}`}>
              <Card className="hover:border-amber-500 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-3xl mb-2">{region.icon}</div>
                  <h3 className="font-semibold text-lg">{region.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {region.spirits.join(' • ')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Knowledge Base Link */}
      <section className="text-center">
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardContent className="p-8">
            <BookOpen className="h-12 w-12 mx-auto text-amber-600 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Explore Our Knowledge Base</h3>
            <p className="text-muted-foreground mb-4">
              80+ articles covering production methods, tasting techniques, and collecting guides
            </p>
            <Link href="/learn">
              <Badge className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-base cursor-pointer">
                Start Learning →
              </Badge>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
