import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-5xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to <span>Lax</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern chat platform powered by AI. Connect, collaborate, and communicate with ease.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/sign-up">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/sign-in">
              Sign In
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 text-center">
            <CardHeader>
              <CardTitle>Smart Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI-powered chat features help you communicate more effectively
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize discussions by channels, direct messages, and threads
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardHeader>
              <CardTitle>Seamless Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with your favorite tools and workflows
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
