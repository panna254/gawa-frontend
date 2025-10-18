import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Users, TrendingUp, Shield } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Gawa</h1>
            </div>
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Split Payments, Build Trust
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            The easiest way to split expenses with friends, track balances, and build your credit reputation
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto">
            Start Splitting Now
          </Button>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Easy Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Create groups for trips, events, or shared expenses. Add members and start splitting instantly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Smart Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Automatically calculate who owes what. Split expenses equally or customize amounts per person.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Build Credit Score</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your payment behavior builds your Gawa credit score. Timely payments improve your reputation.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-card/50 py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to simplify group expenses?</h2>
            <p className="text-muted-foreground mb-8 text-base md:text-lg">
              Join Gawa today and never worry about who owes what again
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto">
              Create Free Account
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2025 Gawa. Making group payments simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
