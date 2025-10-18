import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Award, Mail, Phone, TrendingUp, User, CreditCard, Calendar, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { getUserById, calculateGroupBalances } from '@/lib/mockData';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getCreditRating = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 700) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 600) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const rating = getCreditRating(user.credit_score);

  // Mock data for charts
  const creditHistory = [
    { month: 'Jan', score: 720 },
    { month: 'Feb', score: 735 },
    { month: 'Mar', score: 750 },
    { month: 'Apr', score: 765 },
    { month: 'May', score: 780 },
    { month: 'Jun', score: 795 },
    { month: 'Jul', score: 820 },
  ];

  const expenseCategories = [
    { name: 'Food', value: 45, color: '#8884d8' },
    { name: 'Transport', value: 25, color: '#82ca9d' },
    { name: 'Entertainment', value: 15, color: '#ffc658' },
    { name: 'Other', value: 15, color: '#ff7300' },
  ];

  const monthlyExpenses = [
    { month: 'Jan', amount: 2500 },
    { month: 'Feb', amount: 3200 },
    { month: 'Mar', amount: 2800 },
    { month: 'Apr', amount: 4100 },
    { month: 'May', amount: 3600 },
    { month: 'Jun', amount: 2900 },
    { month: 'Jul', amount: 3800 },
  ];

  // Calculate user's group balances
  const allGroups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
  const userGroups = allGroups.filter((g: any) => g.members.includes(user.id));
  const totalOwed = userGroups.reduce((sum: number, group: any) => {
    const balances = calculateGroupBalances(group.id);
    const userBalance = balances[user.id] || 0;
    return sum + (userBalance > 0 ? userBalance : 0);
  }, 0);
  const totalOwing = userGroups.reduce((sum: number, group: any) => {
    const balances = calculateGroupBalances(group.id);
    const userBalance = balances[user.id] || 0;
    return sum + (userBalance < 0 ? Math.abs(userBalance) : 0);
  }, 0);

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <Badge className={`${rating.bgColor} ${rating.color} border-0`}>
                      {rating.label}
                    </Badge>
                  </div>
                  <CardDescription>Member since {new Date(user.created_at).toLocaleDateString()}</CardDescription>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone_number}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{user.credit_score}</p>
                  <p className="text-sm text-muted-foreground">Credit Score</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">You're Owed</p>
                    <p className="text-xl font-bold text-green-600">KES {totalOwed.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">You Owe</p>
                    <p className="text-xl font-bold text-red-600">KES {totalOwing.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment History</p>
                    <p className="text-xl font-bold text-blue-600">{user.payment_history}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Groups</p>
                    <p className="text-xl font-bold text-purple-600">{userGroups.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed views */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Score Trend</CardTitle>
                    <CardDescription>Your credit score over the last 7 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={creditHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[600, 850]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Breakdown of your spending by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="credit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    Credit Score Details
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
                      <p className="text-2xl font-bold text-green-600">{user.payment_history}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Active Groups</p>
                      <p className="text-2xl font-bold">{userGroups.length}</p>
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
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>Your spending pattern over the last 7 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyExpenses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userGroups.slice(0, 3).map((group: any) => (
                      <div key={group.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{group.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Last activity: {new Date(group.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{group.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
