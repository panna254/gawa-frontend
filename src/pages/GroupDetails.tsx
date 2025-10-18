import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Receipt, Users, CreditCard, Smartphone, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Group, Expense, getUserById, getExpenseCategoryIcon, calculateGroupBalances, getPaymentsByExpenseId } from '@/lib/mockData';
import AISmartSplit from '@/components/AISmartSplit';

interface CustomSplit {
  userId: string;
  amount: number;
}

interface PaymentRequest {
  expenseId: string;
  fromUser: string;
  toUser: string;
  amount: number;
}

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    paid_by: user?.id || '',
    split_type: 'equal' as 'equal' | 'custom',
    category: 'other' as 'food' | 'transport' | 'accommodation' | 'entertainment' | 'other',
    description: '',
  });
  const [customSplits, setCustomSplits] = useState<CustomSplit[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

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

    if (selectedParticipants.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one participant', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(newExpense.amount);
    let splits: Record<string, number> = {};

    if (newExpense.split_type === 'equal') {
      const splitAmount = amount / selectedParticipants.length;
      selectedParticipants.forEach(participantId => {
        splits[participantId] = splitAmount;
      });
    } else {
      // Custom splits
      const totalCustomAmount = customSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalCustomAmount - amount) > 0.01) {
        toast({ title: 'Error', description: 'Custom split amounts must equal the total amount', variant: 'destructive' });
        return;
      }
      customSplits.forEach(split => {
        splits[split.userId] = split.amount;
      });
    }

    const expense: Expense = {
      id: Date.now().toString(),
      group_id: groupId!,
      title: newExpense.title,
      amount,
      paid_by: newExpense.paid_by,
      participants: selectedParticipants,
      split_type: newExpense.split_type,
      splits,
      created_at: new Date().toISOString(),
      settled: false,
      category: newExpense.category,
      description: newExpense.description,
    };

    const allExpenses = JSON.parse(localStorage.getItem('gawa_expenses') || '[]');
    allExpenses.push(expense);
    localStorage.setItem('gawa_expenses', JSON.stringify(allExpenses));

    setExpenses([...expenses, expense]);
    setNewExpense({ 
      title: '', 
      amount: '', 
      paid_by: user!.id, 
      split_type: 'equal',
      category: 'other',
      description: '',
    });
    setCustomSplits([]);
    setSelectedParticipants([]);
    setIsDialogOpen(false);
    toast({ title: 'Success', description: 'Expense added successfully!' });
  };

  const handlePaymentRequest = async (expense: Expense) => {
    setSelectedExpense(expense);
    setIsPaymentDialogOpen(true);
  };

  const initiatePayment = async (paymentRequest: PaymentRequest) => {
    // Simulate PayHero STK Push
    toast({ 
      title: 'Payment Request Sent', 
      description: 'STK Push sent to recipient\'s phone. Waiting for confirmation...' 
    });
    
    // Simulate payment completion after 3 seconds
    setTimeout(() => {
      const payments = JSON.parse(localStorage.getItem('gawa_payments') || '[]');
      const newPayment = {
        id: Date.now().toString(),
        expense_id: paymentRequest.expenseId,
        from_user: paymentRequest.fromUser,
        to_user: paymentRequest.toUser,
        amount: paymentRequest.amount,
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        payment_method: 'stk_push',
      };
      
      payments.push(newPayment);
      localStorage.setItem('gawa_payments', JSON.stringify(payments));
      
      toast({ 
        title: 'Payment Completed!', 
        description: `KES ${paymentRequest.amount.toFixed(2)} received successfully` 
      });
      
      setIsPaymentDialogOpen(false);
      loadGroupData(); // Reload to update balances
    }, 3000);
  };

  const handleAISuggestion = (suggestion: any) => {
    setNewExpense({
      title: suggestion.title,
      amount: suggestion.amount.toString(),
      paid_by: user!.id,
      split_type: 'equal',
      category: suggestion.category,
      description: suggestion.description,
    });
    
    // Set participants to all group members
    setSelectedParticipants(group!.members);
    
    // For equal splits, we don't need custom splits
    setCustomSplits([]);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
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
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map(memberId => {
                    const member = getUserById(memberId);
                    return (
                      <Avatar key={memberId} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={member?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {member?.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {group.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold">{group.members.length}</p>
              <p className="text-sm text-muted-foreground">Active participants</p>
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

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Expenses</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <AISmartSplit 
                  onApplySuggestion={handleAISuggestion}
                  groupMembers={group?.members || []}
                  getUserById={getUserById}
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                      <DialogDescription>Split a new expense among group members</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paid-by">Paid By</Label>
                          <Select value={newExpense.paid_by} onValueChange={(value) => setNewExpense({ ...newExpense, paid_by: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {group.members.map(memberId => {
                                const member = getUserById(memberId);
                                return (
                                  <SelectItem key={memberId} value={memberId}>
                                    {memberId === user?.id ? 'You' : member?.name || `Member ${memberId.slice(0, 8)}`}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={newExpense.category} onValueChange={(value: any) => setNewExpense({ ...newExpense, category: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="food">🍽️ Food</SelectItem>
                              <SelectItem value="transport">🚗 Transport</SelectItem>
                              <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                              <SelectItem value="entertainment">🎉 Entertainment</SelectItem>
                              <SelectItem value="other">📋 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                          id="description"
                          placeholder="Additional details..."
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Participants</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {group.members.map(memberId => {
                            const member = getUserById(memberId);
                            return (
                              <div key={memberId} className="flex items-center space-x-2">
                                <Checkbox
                                  id={memberId}
                                  checked={selectedParticipants.includes(memberId)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedParticipants([...selectedParticipants, memberId]);
                                    } else {
                                      setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
                                    }
                                  }}
                                />
                                <Label htmlFor={memberId} className="text-sm">
                                  {memberId === user?.id ? 'You' : member?.name || `Member ${memberId.slice(0, 8)}`}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Split Type</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="equal"
                              name="split_type"
                              value="equal"
                              checked={newExpense.split_type === 'equal'}
                              onChange={(e) => setNewExpense({ ...newExpense, split_type: e.target.value as 'equal' | 'custom' })}
                            />
                            <Label htmlFor="equal">Equal Split</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="custom"
                              name="split_type"
                              value="custom"
                              checked={newExpense.split_type === 'custom'}
                              onChange={(e) => setNewExpense({ ...newExpense, split_type: e.target.value as 'equal' | 'custom' })}
                            />
                            <Label htmlFor="custom">Custom Split</Label>
                          </div>
                        </div>
                      </div>

                      {newExpense.split_type === 'custom' && (
                        <div className="space-y-2">
                          <Label>Custom Amounts</Label>
                          {selectedParticipants.map(participantId => {
                            const member = getUserById(participantId);
                            const customSplit = customSplits.find(s => s.userId === participantId);
                            return (
                              <div key={participantId} className="flex items-center space-x-2">
                                <Label className="w-24 text-sm">
                                  {participantId === user?.id ? 'You' : member?.name || `Member ${participantId.slice(0, 8)}`}
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={customSplit?.amount || ''}
                                  onChange={(e) => {
                                    const amount = parseFloat(e.target.value) || 0;
                                    setCustomSplits(prev => {
                                      const filtered = prev.filter(s => s.userId !== participantId);
                                      return [...filtered, { userId: participantId, amount }];
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateExpense}>Add Expense</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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
                {expenses.map((expense) => {
                  const paidByUser = getUserById(expense.paid_by);
                  const userSplit = expense.splits[user?.id || ''] || 0;
                  const userOwed = expense.paid_by !== user?.id ? userSplit : 0;
                  const userGained = expense.paid_by === user?.id ? (expense.amount - userSplit) : 0;
                  const payments = getPaymentsByExpenseId(expense.id);
                  const isFullyPaid = payments.length === expense.participants.filter(p => p !== expense.paid_by).length;
                  
                  return (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getExpenseCategoryIcon(expense.category)}</div>
                            <div>
                              <CardTitle className="text-lg">{expense.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                Paid by {expense.paid_by === user?.id ? 'You' : paidByUser?.name || `Member ${expense.paid_by.slice(0, 8)}`}
                                <Badge variant="outline" className="text-xs">
                                  {expense.category}
                                </Badge>
                              </CardDescription>
                              {expense.description && (
                                <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">KES {expense.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {isFullyPaid ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Settled
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Split {expense.split_type} among {expense.participants.length} members
                            </span>
                            <div className="flex items-center gap-2">
                              {userOwed > 0 && (
                                <span className="text-sm font-semibold text-red-600">
                                  You owe: KES {userOwed.toFixed(2)}
                                </span>
                              )}
                              {userGained > 0 && (
                                <span className="text-sm font-semibold text-green-600">
                                  You're owed: KES {userGained.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Participants:</p>
                            <div className="flex flex-wrap gap-2">
                              {expense.participants.map(participantId => {
                                const participant = getUserById(participantId);
                                const amount = expense.splits[participantId];
                                const isPaid = payments.some(p => p.from_user === participantId);
                                return (
                                  <div key={participantId} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={participant?.avatar_url} />
                                      <AvatarFallback className="text-xs">
                                        {participant?.name?.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{participantId === user?.id ? 'You' : participant?.name || `Member ${participantId.slice(0, 8)}`}</span>
                                    <span className="font-medium">KES {amount.toFixed(2)}</span>
                                    {isPaid && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {userOwed > 0 && !isFullyPaid && (
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => handlePaymentRequest(expense)}
                                className="gap-2"
                              >
                                <Smartphone className="w-4 h-4" />
                                Pay via STK Push
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Who Owes Who</h2>
              <div className="grid gap-4">
                {Object.entries(balances).map(([memberId, balance]) => {
                  const member = getUserById(memberId);
                  if (!member || balance === 0) return null;
                  
                  return (
                    <Card key={memberId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{memberId === user?.id ? 'You' : member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {balance > 0 ? '+' : ''}KES {Math.abs(balance).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {balance > 0 ? 'is owed' : 'owes'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <div className="space-y-4">
                {expenses.flatMap(expense => {
                  const payments = getPaymentsByExpenseId(expense.id);
                  return payments.map(payment => {
                    const fromUser = getUserById(payment.from_user);
                    const toUser = getUserById(payment.to_user);
                    return (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                {payment.payment_method === 'stk_push' ? (
                                  <Smartphone className="w-5 h-5 text-primary" />
                                ) : (
                                  <CreditCard className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {fromUser?.name || `Member ${payment.from_user.slice(0, 8)}`} paid {toUser?.name || `Member ${payment.to_user.slice(0, 8)}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  For: {expense.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(payment.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">KES {payment.amount.toFixed(2)}</p>
                              <Badge 
                                variant={payment.status === 'completed' ? 'default' : 'secondary'}
                                className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {payment.status === 'completed' ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" />Completed</>
                                ) : (
                                  <><Clock className="w-3 h-3 mr-1" />Pending</>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payment</DialogTitle>
              <DialogDescription>
                Send a payment request via STK Push to settle this expense
              </DialogDescription>
            </DialogHeader>
            {selectedExpense && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium">{selectedExpense.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Amount: KES {selectedExpense.splits[user?.id || ''].toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={getUserById(selectedExpense.paid_by)?.avatar_url} />
                      <AvatarFallback>
                        {getUserById(selectedExpense.paid_by)?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedExpense.paid_by === user?.id ? 'You' : getUserById(selectedExpense.paid_by)?.name || `Member ${selectedExpense.paid_by.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getUserById(selectedExpense.paid_by)?.phone_number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Smartphone className="w-5 h-5" />
                    <span className="font-medium">STK Push Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    A payment request will be sent to the recipient's phone. They'll need to enter their M-Pesa PIN to complete the payment.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedExpense) {
                    initiatePayment({
                      expenseId: selectedExpense.id,
                      fromUser: user?.id || '',
                      toUser: selectedExpense.paid_by,
                      amount: selectedExpense.splits[user?.id || ''],
                    });
                  }
                }}
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Send STK Push
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default GroupDetails;
