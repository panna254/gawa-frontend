import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Award, Mail, Phone, TrendingUp, User } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getCreditRating = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 700) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 600) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  const rating = getCreditRating(user.credit_score);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>Member since {new Date(user.created_at).toLocaleDateString()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span>{user.phone_number}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Credit Score
              </CardTitle>
              <CardDescription>Based on your payment history and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-primary mb-2">{user.credit_score}</p>
                <p className={`text-xl font-semibold ${rating.color}`}>{rating.label}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score Progress</span>
                  <span className="font-medium">{user.credit_score}/850</span>
                </div>
                <Progress value={(user.credit_score / 850) * 100} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Payment History
                  </p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Groups</p>
                  <p className="text-2xl font-bold">
                    {JSON.parse(localStorage.getItem('gawa_groups') || '[]').filter((g: any) => g.members.includes(user.id)).length}
                  </p>
                </div>
              </div>

              <div className="bg-accent/50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">How to improve your score</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Pay your share on time</li>
                  <li>• Settle balances regularly</li>
                  <li>• Maintain consistent payment patterns</li>
                  <li>• Participate in group expenses</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Edit Profile</Button>
            <Button variant="destructive" onClick={logout}>Logout</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
