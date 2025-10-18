import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Calculator, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AISmartSplitProps {
  onApplySuggestion: (suggestion: ExpenseSuggestion) => void;
  groupMembers: string[];
  getUserById: (id: string) => any;
}

interface ExpenseSuggestion {
  title: string;
  amount: number;
  category: string;
  description: string;
  suggestedSplits: Record<string, number>;
  reasoning: string;
}

const AISmartSplit = ({ onApplySuggestion, groupMembers, getUserById }: AISmartSplitProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<ExpenseSuggestion | null>(null);

  const generateSuggestion = async () => {
    if (!expenseDescription.trim()) {
      toast({ title: 'Error', description: 'Please describe the expense', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSuggestions: ExpenseSuggestion[] = [
        {
          title: 'Restaurant Dinner',
          amount: 4500,
          category: 'food',
          description: 'Group dinner at a nice restaurant',
          suggestedSplits: generateEqualSplits(4500, groupMembers),
          reasoning: 'Based on typical restaurant expenses and group size, I suggest splitting equally among all participants.'
        },
        {
          title: 'Uber Ride',
          amount: 1200,
          category: 'transport',
          description: 'Shared ride to destination',
          suggestedSplits: generateEqualSplits(1200, groupMembers),
          reasoning: 'Transport costs are typically shared equally among all riders.'
        },
        {
          title: 'Movie Tickets',
          amount: 2400,
          category: 'entertainment',
          description: 'Cinema tickets for group',
          suggestedSplits: generateEqualSplits(2400, groupMembers),
          reasoning: 'Entertainment expenses are usually split equally as everyone benefits equally.'
        },
        {
          title: 'Grocery Shopping',
          amount: 3200,
          category: 'food',
          description: 'Shared groceries for group meal',
          suggestedSplits: generateEqualSplits(3200, groupMembers),
          reasoning: 'Grocery expenses for shared meals should be split equally among participants.'
        },
        {
          title: 'Hotel Room',
          amount: 8000,
          category: 'accommodation',
          description: 'Shared accommodation for trip',
          suggestedSplits: generateEqualSplits(8000, groupMembers),
          reasoning: 'Accommodation costs are typically shared equally among all occupants.'
        }
      ];

      // Pick a random suggestion based on description keywords
      const keywords = expenseDescription.toLowerCase();
      let selectedSuggestion = mockSuggestions[0]; // default

      if (keywords.includes('dinner') || keywords.includes('restaurant') || keywords.includes('food')) {
        selectedSuggestion = mockSuggestions[0];
      } else if (keywords.includes('uber') || keywords.includes('taxi') || keywords.includes('ride')) {
        selectedSuggestion = mockSuggestions[1];
      } else if (keywords.includes('movie') || keywords.includes('cinema') || keywords.includes('entertainment')) {
        selectedSuggestion = mockSuggestions[2];
      } else if (keywords.includes('grocery') || keywords.includes('shopping') || keywords.includes('market')) {
        selectedSuggestion = mockSuggestions[3];
      } else if (keywords.includes('hotel') || keywords.includes('accommodation') || keywords.includes('room')) {
        selectedSuggestion = mockSuggestions[4];
      }

      // Customize the suggestion based on description
      selectedSuggestion = {
        ...selectedSuggestion,
        description: expenseDescription,
        title: extractTitle(expenseDescription) || selectedSuggestion.title,
      };

      setSuggestion(selectedSuggestion);
      setIsGenerating(false);
    }, 2000);
  };

  const generateEqualSplits = (amount: number, members: string[]) => {
    const splits: Record<string, number> = {};
    const splitAmount = amount / members.length;
    members.forEach(memberId => {
      splits[memberId] = splitAmount;
    });
    return splits;
  };

  const extractTitle = (description: string) => {
    // Simple title extraction logic
    const words = description.split(' ');
    if (words.length <= 3) return description;
    return words.slice(0, 3).join(' ');
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onApplySuggestion(suggestion);
      setIsOpen(false);
      setExpenseDescription('');
      setSuggestion(null);
      toast({ title: 'Success', description: 'AI suggestion applied to expense form!' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI Smart Split
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Smart Split Assistant
          </DialogTitle>
          <DialogDescription>
            Describe your expense and let AI suggest the best way to split it among group members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expense-description">Describe the expense</Label>
            <Textarea
              id="expense-description"
              placeholder="e.g., 'Dinner at a nice restaurant for 4 people' or 'Uber ride to the airport'"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={generateSuggestion} 
              disabled={isGenerating || !expenseDescription.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  Get AI Suggestion
                </>
              )}
            </Button>
          </div>

          {suggestion && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Calculator className="w-5 h-5" />
                  AI Suggestion
                </CardTitle>
                <CardDescription>{suggestion.reasoning}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-lg font-semibold">{suggestion.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-lg font-semibold">KES {suggestion.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Suggested Split</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(suggestion.suggestedSplits).map(([memberId, amount]) => {
                      const member = getUserById(memberId);
                      return (
                        <div key={memberId} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {member?.name || `Member ${memberId.slice(0, 8)}`}
                            </span>
                          </div>
                          <span className="font-semibold">KES {amount.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI Reasoning</p>
                      <p className="text-sm text-blue-700 mt-1">{suggestion.reasoning}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {suggestion && (
            <Button onClick={handleApplySuggestion} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Apply Suggestion
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISmartSplit;
