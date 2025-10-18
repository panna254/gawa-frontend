import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, DollarSign, LogOut, User, TrendingUp, Receipt, Calendar, ArrowUpRight, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Group, getUserById, getGroupCategoryIcon, calculateGroupBalances } from '@/lib/mockData';

interface GroupStats {
  totalGroups: number;
  totalExpenses: number;
  totalOwed: number;
  totalOwing: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GroupStats>({
    totalGroups: 0,
    totalExpenses: 0,
    totalOwed: 0,
    totalOwing: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ 
    title: '', 
    description: '', 
    category: 'general' as 'trip' | 'house' | 'event' | 'general' 
  });
  const [groupMembers, setGroupMembers] = useState<Array<{ name: string; phone: string }>>([
    { name: '', phone: '' }
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadGroups();
  }, [user, navigate]);

  const loadGroups = () => {
    const allGroups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
    const userGroups = allGroups.filter((g: Group) => g.members.includes(user!.id));
    setGroups(userGroups);
    
    // Calculate stats
    const allExpenses = JSON.parse(localStorage.getItem('gawa_expenses') || '[]');
    const userExpenses = allExpenses.filter((e: any) => 
      userGroups.some(g => g.id === e.group_id)
    );
    
    let totalOwed = 0;
    let totalOwing = 0;
    
    userGroups.forEach(group => {
      const balances = calculateGroupBalances(group.id);
      const userBalance = balances[user!.id] || 0;
      if (userBalance > 0) {
        totalOwed += userBalance;
      } else if (userBalance < 0) {
        totalOwing += Math.abs(userBalance);
      }
    });
    
    setStats({
      totalGroups: userGroups.length,
      totalExpenses: userExpenses.length,
      totalOwed,
      totalOwing,
    });
  };

  const handleCreateGroup = () => {
    if (!newGroup.title.trim()) {
      toast({ title: 'Error', description: 'Group title is required', variant: 'destructive' });
      return;
    }

    // Validate members
    const validMembers = groupMembers.filter(m => m.name.trim() && m.phone.trim());
    if (validMembers.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one member with phone number', variant: 'destructive' });
      return;
    }

    // Validate phone numbers (basic check for 10-15 digits)
    const phoneRegex = /^\+?\d{10,15}$/;
    const invalidPhone = validMembers.find(m => !phoneRegex.test(m.phone.replace(/\s/g, '')));
    if (invalidPhone) {
      toast({ title: 'Error', description: 'Please enter valid phone numbers (10-15 digits)', variant: 'destructive' });
      return;
    }

    // Create or find user IDs for members
    const allUsers = JSON.parse(localStorage.getItem('gawa_users') || '[]');
    const memberIds = validMembers.map(member => {
      const normalizedPhone = member.phone.replace(/\s/g, '');
      let existingUser = allUsers.find((u: any) => u.phone_number.replace(/\s/g, '') === normalizedPhone);
      
      if (!existingUser) {
        existingUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: `${normalizedPhone}@gawa.app`,
          name: member.name,
          phone_number: member.phone,
          credit_score: 700,
          created_at: new Date().toISOString(),
          payment_history: 0,
          total_expenses: 0,
          groups_count: 1,
        };
        allUsers.push(existingUser);
      }
      return existingUser.id;
    });

    localStorage.setItem('gawa_users', JSON.stringify(allUsers));

    const group: Group = {
      id: Date.now().toString(),
      title: newGroup.title,
      description: newGroup.description,
      members: [user!.id, ...memberIds],
      created_at: new Date().toISOString(),
      balance: 0,
      total_expenses: 0,
      category: newGroup.category,
      color: newGroup.category === 'trip' ? 'bg-blue-500' : 
             newGroup.category === 'house' ? 'bg-purple-500' :
             newGroup.category === 'event' ? 'bg-pink-500' : 'bg-green-500',
    };

    const allGroups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
    allGroups.push(group);
    localStorage.setItem('gawa_groups', JSON.stringify(allGroups));

    setGroups([...groups, group]);
    setNewGroup({ title: '', description: '', category: 'general' });
    setGroupMembers([{ name: '', phone: '' }]);
    setIsDialogOpen(false);
    toast({ 
      title: 'Success', 
      description: `Group created with ${validMembers.length} member(s)! Phone numbers saved for STK push.` 
    });
    loadGroups(); // Reload to update stats
  };

  const addMemberField = () => {
    setGroupMembers([...groupMembers, { name: '', phone: '' }]);
  };

  const removeMemberField = (index: number) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: 'name' | 'phone', value: string) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Gawa</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h2>
            <p className="text-muted-foreground mt-1">Manage your groups and expenses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Start a new group to split expenses with friends</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Group Name</Label>
                  <Input
                    id="title"
                    placeholder="Weekend Trip"
                    value={newGroup.title}
                    onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the group purpose..."
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGroup.category} onValueChange={(value: any) => setNewGroup({ ...newGroup, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="trip">Trip</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Group Members</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMemberField}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Member
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add members with phone numbers for STK push payments
                  </p>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {groupMembers.map((member, index) => (
                      <div key={index} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Member name"
                              value={member.name}
                              onChange={(e) => updateMember(index, 'name', e.target.value)}
                            />
                            <Input
                              type="tel"
                              placeholder="+254 700 123456"
                              value={member.phone}
                              onChange={(e) => updateMember(index, 'phone', e.target.value)}
                            />
                          </div>
                          {groupMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMemberField(index)}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-muted-foreground">Active groups</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExpenses}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">KES {stats.totalOwed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pending payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You Owe</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">KES {stats.totalOwing.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        {groups.length === 0 ? (
          <Card className="text-center py-16">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle>No groups yet</CardTitle>
              <CardDescription>Create your first group to start splitting expenses</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {groups.map((group) => {
              const balances = calculateGroupBalances(group.id);
              const userBalance = balances[user!.id] || 0;
              const memberAvatars = group.members.slice(0, 3).map(memberId => {
                const member = getUserById(memberId);
                return member;
              }).filter(Boolean);
              
              return (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                  onClick={() => navigate(`/group/${group.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${group.color} flex items-center justify-center text-white text-xl`}>
                          {getGroupCategoryIcon(group.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {group.title}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {group.category}
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {group.description && (
                      <CardDescription className="mt-2">{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {memberAvatars.map((member, index) => (
                            <Avatar key={index} className="w-8 h-8 border-2 border-background">
                              <AvatarImage src={member?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                              +{group.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Expenses</span>
                        <span className="font-semibold">KES {group.total_expenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Your Balance</span>
                        <span className={`font-semibold ${userBalance > 0 ? 'text-green-600' : userBalance < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {userBalance > 0 ? '+' : userBalance < 0 ? '-' : ''}KES {Math.abs(userBalance).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {userBalance > 0 ? 'You are owed' : userBalance < 0 ? 'You owe' : 'You are settled up'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
