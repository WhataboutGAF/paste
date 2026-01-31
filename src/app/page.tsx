import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, File, Camera, Type } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full bg-background text-foreground">
        <div className="container relative z-10 mx-auto grid min-h-[70vh] items-center px-4 py-16 text-center lg:grid-cols-2 lg:text-left">
          <div>
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Seamless Sharing,
              <br />
              <span className="text-accent">Instantly.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              QuickPaste is your go-to solution for fast and secure text and file sharing across devices. No sign-ups, no hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button asChild size="lg">
                <Link href="/transfer">
                  Start Sharing Now <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={800}
                className="rounded-lg shadow-2xl"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-secondary py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-4xl font-bold">Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need for quick device-to-device transfers.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-md bg-primary p-3">
                  <Type className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Text Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instantly send snippets of text, links, or notes between your devices using a simple, secure code.
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent ring-2 ring-accent">
              <CardHeader className="flex flex-row items-center gap-4">
                 <div className="rounded-md bg-primary p-3">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Photo Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-accent">Coming Soon!</span> Seamlessly transfer photos from your phone to your computer or vice-versa.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                 <div className="rounded-md bg-primary p-3">
                  <File className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>File Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                <span className="font-semibold text-accent">Coming Soon!</span> Quickly share documents and other files without needing to email them to yourself.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

       {/* Footer */}
      <footer className="w-full bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QuickPaste. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
