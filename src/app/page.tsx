import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Camera, Type, ArrowDown } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="relative w-full bg-background text-foreground">
        <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16 text-center md:py-24">
          <div>
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Seamless Sharing,
              <br />
              <span className="text-primary">Instantly.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              QuickPaste is your go-to solution for fast and secure text and file sharing across devices. No sign-ups, no hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#features">Start Sharing Now</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-10">
            <Link href="#features" aria-label="Scroll to features">
              <ArrowDown className="h-6 w-6 animate-slow-bounce text-muted-foreground opacity-75 transition-all hover:text-foreground hover:opacity-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-background py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl font-bold">A Better Way to Share</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need for quick device-to-device transfers, and more.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Link href="/transfer" className="block rounded-lg transition-all hover:scale-105 hover:bg-accent/25">
              <Card className="h-full border-0 bg-transparent text-center shadow-none">
                <CardHeader className="flex items-center justify-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Type className="h-10 w-10" />
                  </div>
                  <CardTitle>Text Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Instantly send snippets of text, links, or notes between your devices using a simple, secure code.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/transfer" className="block rounded-lg transition-all hover:scale-105 hover:bg-accent/25">
              <Card className="h-full border-0 bg-transparent text-center shadow-none">
                <CardHeader className="flex items-center justify-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Camera className="h-10 w-10" />
                  </div>
                  <CardTitle>Photo Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Seamlessly transfer photos from your phone to your computer or vice-versa.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-background py-8">
        <div className="container mx-auto border-t px-4 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QuickPaste. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
