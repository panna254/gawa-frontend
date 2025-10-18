import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Receipt, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  participants: string[];
  split_type: 'equal' | 'custom';
  splits: Record<string, number>;
  created_at: string;
  settled: boolean;
}

interface Group {
  id: string;
  title: string;
  description: string;
  members: string[];
}

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    paid_by: user?.id || '',
    split_type: 'equal' as 'equal' | 'custom',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadGroupData();
  }, [groupId, user, navigate]);

  const loadGroupData = () => {
    const allGroups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
    const foundGroup = allGroups.find((g: Group) => g.id === groupId);
    
    if (!foundGroup) {
      navigate('/dashboard');
      return;
    }

    setGroup(foundGroup);
    
    const allExpenses = JSON.parse(localStorage.getItem('gawa_expenses') || '[]');
    const groupExpenses = allExpenses.filter((e: Expense) => e.group_id === groupId);
    setExpenses(groupExpenses);
  };

  const handleCreateExpense = () => {
    if (!newExpense.title.trim() || !newExpense.amount) {
      toast({ title: 'Error', description: 'Title and amount are required', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(newExpense.amount);
    const memberCount = group!.members.length;
    const splitAmount = amount / memberCount;

    const splits: Record<string, number> = {};
    group!.members.forEach(memberId => {
      splits[memberId] = splitAmount;
    });

    const expense: Expense = {
      id: Date.now().toString(),
      group_id: groupId!,
      title: newExpense.title,
      amount,
      paid_by: newExpense.paid_by,
      participants: group!.members,
      split_type: newExpense.split_type,
      splits,
      created_at: new Date().toISOString(),
      settled: false,
    };

    const allExpenses = JSON.parse(localStorage.getItem('gawa_expenses') || '[]');
    allExpenses.push(expense);
    localStorage.setItem('gawa_expenses', JSON.stringify(allExpenses));

    setExpenses([...expenses, expense]);
    setNewExpense({ title: '', amount: '', paid_by: user!.id, split_type: 'equal' });
    setIsDialogOpen(false);
    toast({ title: 'Success', description: 'Expense added successfully!' });
  };

  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    
    group?.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    expenses.forEach(expense => {
      expense.participants.forEach(participantId => {
        if (participantId !== expense.paid_by) {
          balances[participantId] -= expense.splits[participantId];
          balances[expense.paid_by] += expense.splits[participantId];
        }
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const userBalance = balances[user?.id || ''] || 0;

  if (!group) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">{group.title}</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${userBalance > 0 ? 'text-green-600' : userBalance < 0 ? 'text-red-600' : 'text-foreground'}`}>
                KES {Math.abs(userBalance).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {userBalance > 0 ? 'You are owed' : userBalance < 0 ? 'You owe' : 'You are settled up'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{group.members.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Active participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expenses.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Expenses</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Split a new expense among group members</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-title">Expense Title</Label>
                  <Input
                    id="expense-title"
                    placeholder="Dinner at restaurant"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount (KES)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="1000"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid-by">Paid By</Label>
                  <Select value={newExpense.paid_by} onValueChange={(value) => setNewExpense({ ...newExpense, paid_by: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {group.members.map(memberId => (
                        <SelectItem key={memberId} value={memberId}>
                          {memberId === user?.id ? 'You' : `Member ${memberId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {expenses.length === 0 ? (
          <Card className="text-center py-16">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle>No expenses yet</CardTitle>
              <CardDescription>Add your first expense to start tracking</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{expense.title}</CardTitle>
                      <CardDescription>
                        Paid by {expense.paid_by === user?.id ? 'You' : `Member ${expense.paid_by.slice(0, 8)}`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">KES {expense.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Split {expense.split_type} among {expense.participants.length} members
                    </span>
                    {expense.paid_by === user?.id ? (
                      <span className="text-sm font-semibold text-green-600">
                        +KES {(expense.amount - expense.splits[user.id]).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-600">
                        -KES {expense.splits[user?.id || ''].toFixed(2)}
                      </span>
                    )}
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

export default GroupDetails;
