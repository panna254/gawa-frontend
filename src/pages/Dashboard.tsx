import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, DollarSign, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Group {
  id: string;
  title: string;
  description: string;
  members: string[];
  created_at: string;
  balance: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ title: '', description: '' });

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
  };

  const handleCreateGroup = () => {
    if (!newGroup.title.trim()) {
      toast({ title: 'Error', description: 'Group title is required', variant: 'destructive' });
      return;
    }

    const group: Group = {
      id: Date.now().toString(),
      title: newGroup.title,
      description: newGroup.description,
      members: [user!.id],
      created_at: new Date().toISOString(),
      balance: 0,
    };

    const allGroups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
    allGroups.push(group);
    localStorage.setItem('gawa_groups', JSON.stringify(allGroups));

    setGroups([...groups, group]);
    setNewGroup({ title: '', description: '' });
    setIsDialogOpen(false);
    toast({ title: 'Success', description: 'Group created successfully!' });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h2>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/group/${group.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {group.title}
                  </CardTitle>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <span className="font-semibold">{group.members.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Your Balance</span>
                      <span className={`font-semibold ${group.balance > 0 ? 'text-green-600' : group.balance < 0 ? 'text-red-600' : ''}`}>
                        KES {Math.abs(group.balance).toFixed(2)}
                        {group.balance > 0 ? ' owed to you' : group.balance < 0 ? ' you owe' : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
