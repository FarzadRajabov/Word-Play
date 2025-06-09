"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Gamepad2,
  Plus,
  Github,
  Instagram,
} from "lucide-react";
import { WordLookupDemo } from "@/components/word-lookup-demo";
import { supabase } from "@/lib/supabase";
import { UserPoints } from "@/components/user-points";

function GameCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full">Play Now</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setLoading(false);
    setTimeout(() => setShowContent(true), 50);
    // Fetch Supabase user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  const handleSignIn = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-6"></div>
        <h1 className="text-3xl font-bold text-primary flex items-baseline gap-2">
          WordPlay
          <span className="text-xs text-muted-foreground font-normal mt-1">
            by Farzad
          </span>
        </h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <UserPoints />
      {/* Gradient background at the top */}
      <div className="gradient-bg" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8 flex flex-col items-center justify-between">
          <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-2 text-center flex items-baseline gap-2">
              WordPlay
              <span className="text-xs text-muted-foreground font-normal mt-1">
                by Farzad
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-4">
              Learn vocabulary with fun games
            </p>
          </div>
          <div className="w-full flex justify-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-white">{user.email}</span>
                <Button
                  onClick={handleSignOut}
                  className="bg-black text-white border-pink-500 border-[1.5px] hover:bg-pink-500 hover:text-black transition-colors"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSignIn("github")}
                  className="bg-black text-white border-blue-500 border-[1.5px] hover:bg-blue-500 hover:text-black transition-colors flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  Sign in with GitHub
                </Button>
                <Button
                  onClick={() => handleSignIn("google")}
                  className="bg-black text-white border-red-500 border-[1.5px] hover:bg-red-500 hover:text-black transition-colors flex items-center gap-2"
                >
                  <img
                    src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                    alt="Google logo"
                    className="h-5 w-5"
                  />
                  Sign in with Google
                </Button>
              </div>
            )}
          </div>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Game Modes</h2>
            <Link href="/words/manage">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Manage Words</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard
              title="Definition Match"
              description="Match words to their correct definitions"
              icon={<BookOpen className="h-6 w-6" />}
              href="/games/definition-match"
            />
            <GameCard
              title="Synonym Picker"
              description="Choose the closest synonym to a given word"
              icon={<Brain className="h-6 w-6" />}
              href="/games/synonym-picker"
            />
            <GameCard
              title="Antonym Challenge"
              description="Identify the opposite meaning of words"
              icon={<Gamepad2 className="h-6 w-6" />}
              href="/games/antonym-challenge"
            />
            <GameCard
              title="Fill in the Blank"
              description="Complete sentences with the correct word"
              icon={<BookOpen className="h-6 w-6" />}
              href="/games/fill-blank"
            />
            <GameCard
              title="Guess by Example"
              description="Guess words based on example usage"
              icon={<Brain className="h-6 w-6" />}
              href="/games/guess-example"
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            See It In Action
          </h2>
          <WordLookupDemo />
        </section>

        <footer className="mt-16 border-t pt-6 flex flex-col items-center gap-2 text-muted-foreground">
          <span>My Links :3</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/FarzadRajabov"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6 hover:text-primary transition-colors" />
            </a>
            <a
              href="https://www.instagram.com/farzad.04.12/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6 hover:text-primary transition-colors" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
