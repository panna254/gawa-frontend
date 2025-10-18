// Mock data service for Gawa MVP presentation
export interface User {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  credit_score: number;
  created_at: string;
  avatar_url?: string;
  payment_history: number;
  total_expenses: number;
  groups_count: number;
}

export interface Group {
  id: string;
  title: string;
  description: string;
  members: string[];
  created_at: string;
  balance: number;
  total_expenses: number;
  category: 'trip' | 'house' | 'event' | 'general';
  color: string;
}

export interface Expense {
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
  category: 'food' | 'transport' | 'accommodation' | 'entertainment' | 'other';
  description?: string;
}

export interface Payment {
  id: string;
  expense_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  payment_method: 'stk_push' | 'bank_transfer' | 'mobile_money';
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone_number: '+254 700 123456',
    credit_score: 820,
    created_at: '2024-01-15T10:00:00Z',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    payment_history: 100,
    total_expenses: 15750,
    groups_count: 3,
  },
  {
    id: 'user_2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    phone_number: '+254 700 234567',
    credit_score: 785,
    created_at: '2024-02-01T14:30:00Z',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    payment_history: 95,
    total_expenses: 12300,
    groups_count: 2,
  },
  {
    id: 'user_3',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    phone_number: '+254 700 345678',
    credit_score: 750,
    created_at: '2024-02-15T09:15:00Z',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    payment_history: 88,
    total_expenses: 8900,
    groups_count: 2,
  },
  {
    id: 'user_4',
    email: 'sarah.jones@example.com',
    name: 'Sarah Jones',
    phone_number: '+254 700 456789',
    credit_score: 720,
    created_at: '2024-03-01T16:45:00Z',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    payment_history: 82,
    total_expenses: 11200,
    groups_count: 1,
  },
  {
    id: 'user_5',
    email: 'david.brown@example.com',
    name: 'David Brown',
    phone_number: '+254 700 567890',
    credit_score: 680,
    created_at: '2024-03-10T11:20:00Z',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    payment_history: 75,
    total_expenses: 6800,
    groups_count: 1,
  },
];

// Mock groups data
export const mockGroups: Group[] = [
  {
    id: 'group_1',
    title: 'Nairobi Weekend Trip',
    description: 'Weekend getaway to Nairobi with friends',
    members: ['user_1', 'user_2', 'user_3'],
    created_at: '2024-03-15T10:00:00Z',
    balance: -2500,
    total_expenses: 15750,
    category: 'trip',
    color: 'bg-blue-500',
  },
  {
    id: 'group_2',
    title: 'Office Lunch Group',
    description: 'Daily lunch expenses with colleagues',
    members: ['user_1', 'user_4', 'user_5'],
    created_at: '2024-03-01T09:00:00Z',
    balance: 1200,
    total_expenses: 8400,
    category: 'general',
    color: 'bg-green-500',
  },
  {
    id: 'group_3',
    title: 'House Bills',
    description: 'Shared household expenses',
    members: ['user_2', 'user_3'],
    created_at: '2024-02-20T14:30:00Z',
    balance: 0,
    total_expenses: 12000,
    category: 'house',
    color: 'bg-purple-500',
  },
  {
    id: 'group_4',
    title: 'Birthday Party',
    description: 'Sarah\'s birthday celebration',
    members: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'],
    created_at: '2024-03-20T18:00:00Z',
    balance: 800,
    total_expenses: 25000,
    category: 'event',
    color: 'bg-pink-500',
  },
];

// Mock expenses data
export const mockExpenses: Expense[] = [
  {
    id: 'expense_1',
    group_id: 'group_1',
    title: 'Hotel Accommodation',
    amount: 12000,
    paid_by: 'user_1',
    participants: ['user_1', 'user_2', 'user_3'],
    split_type: 'equal',
    splits: { user_1: 4000, user_2: 4000, user_3: 4000 },
    created_at: '2024-03-15T20:00:00Z',
    settled: false,
    category: 'accommodation',
    description: '2 nights at Nairobi Hotel',
  },
  {
    id: 'expense_2',
    group_id: 'group_1',
    title: 'Dinner at Carnivore',
    amount: 3750,
    paid_by: 'user_2',
    participants: ['user_1', 'user_2', 'user_3'],
    split_type: 'equal',
    splits: { user_1: 1250, user_2: 1250, user_3: 1250 },
    created_at: '2024-03-16T19:30:00Z',
    settled: true,
    category: 'food',
    description: 'Famous nyama choma restaurant',
  },
  {
    id: 'expense_3',
    group_id: 'group_2',
    title: 'Lunch at Java House',
    amount: 1800,
    paid_by: 'user_1',
    participants: ['user_1', 'user_4', 'user_5'],
    split_type: 'equal',
    splits: { user_1: 600, user_4: 600, user_5: 600 },
    created_at: '2024-03-18T13:00:00Z',
    settled: false,
    category: 'food',
  },
  {
    id: 'expense_4',
    group_id: 'group_2',
    title: 'Uber to Office',
    amount: 1200,
    paid_by: 'user_4',
    participants: ['user_1', 'user_4', 'user_5'],
    split_type: 'equal',
    splits: { user_1: 400, user_4: 400, user_5: 400 },
    created_at: '2024-03-19T08:30:00Z',
    settled: true,
    category: 'transport',
  },
  {
    id: 'expense_5',
    group_id: 'group_3',
    title: 'Electricity Bill',
    amount: 4500,
    paid_by: 'user_2',
    participants: ['user_2', 'user_3'],
    split_type: 'equal',
    splits: { user_2: 2250, user_3: 2250 },
    created_at: '2024-03-01T10:00:00Z',
    settled: true,
    category: 'other',
  },
  {
    id: 'expense_6',
    group_id: 'group_4',
    title: 'Birthday Cake',
    amount: 3500,
    paid_by: 'user_1',
    participants: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'],
    split_type: 'equal',
    splits: { user_1: 700, user_2: 700, user_3: 700, user_4: 700, user_5: 700 },
    created_at: '2024-03-20T15:00:00Z',
    settled: false,
    category: 'food',
    description: 'Custom chocolate cake from Artcaffe',
  },
  {
    id: 'expense_7',
    group_id: 'group_4',
    title: 'Party Decorations',
    amount: 2500,
    paid_by: 'user_3',
    participants: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'],
    split_type: 'equal',
    splits: { user_1: 500, user_2: 500, user_3: 500, user_4: 500, user_5: 500 },
    created_at: '2024-03-20T16:30:00Z',
    settled: false,
    category: 'other',
  },
  {
    id: 'expense_8',
    group_id: 'group_1',
    title: 'Safari Park Entry',
    amount: 3000,
    paid_by: 'user_3',
    participants: ['user_1', 'user_2', 'user_3'],
    split_type: 'equal',
    splits: { user_1: 1000, user_2: 1000, user_3: 1000 },
    created_at: '2024-03-17T10:00:00Z',
    settled: true,
    category: 'entertainment',
    description: 'Entry fees for Nairobi National Park',
  },
];

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: 'payment_1',
    expense_id: 'expense_2',
    from_user: 'user_1',
    to_user: 'user_2',
    amount: 1250,
    status: 'completed',
    created_at: '2024-03-16T21:00:00Z',
    completed_at: '2024-03-16T21:05:00Z',
    payment_method: 'stk_push',
  },
  {
    id: 'payment_2',
    expense_id: 'expense_2',
    from_user: 'user_3',
    to_user: 'user_2',
    amount: 1250,
    status: 'completed',
    created_at: '2024-03-16T21:10:00Z',
    completed_at: '2024-03-16T21:15:00Z',
    payment_method: 'stk_push',
  },
  {
    id: 'payment_3',
    expense_id: 'expense_4',
    from_user: 'user_1',
    to_user: 'user_4',
    amount: 400,
    status: 'completed',
    created_at: '2024-03-19T09:00:00Z',
    completed_at: '2024-03-19T09:03:00Z',
    payment_method: 'stk_push',
  },
  {
    id: 'payment_4',
    expense_id: 'expense_4',
    from_user: 'user_5',
    to_user: 'user_4',
    amount: 400,
    status: 'completed',
    created_at: '2024-03-19T09:05:00Z',
    completed_at: '2024-03-19T09:08:00Z',
    payment_method: 'stk_push',
  },
  {
    id: 'payment_5',
    expense_id: 'expense_5',
    from_user: 'user_3',
    to_user: 'user_2',
    amount: 2250,
    status: 'completed',
    created_at: '2024-03-01T11:00:00Z',
    completed_at: '2024-03-01T11:05:00Z',
    payment_method: 'bank_transfer',
  },
  {
    id: 'payment_6',
    expense_id: 'expense_8',
    from_user: 'user_1',
    to_user: 'user_3',
    amount: 1000,
    status: 'completed',
    created_at: '2024-03-17T11:00:00Z',
    completed_at: '2024-03-17T11:03:00Z',
    payment_method: 'stk_push',
  },
  {
    id: 'payment_7',
    expense_id: 'expense_8',
    from_user: 'user_2',
    to_user: 'user_3',
    amount: 1000,
    status: 'completed',
    created_at: '2024-03-17T11:05:00Z',
    completed_at: '2024-03-17T11:08:00Z',
    payment_method: 'stk_push',
  },
];

// Initialize mock data in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem('gawa_users')) {
    localStorage.setItem('gawa_users', JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem('gawa_groups')) {
    localStorage.setItem('gawa_groups', JSON.stringify(mockGroups));
  }
  if (!localStorage.getItem('gawa_expenses')) {
    localStorage.setItem('gawa_expenses', JSON.stringify(mockExpenses));
  }
  if (!localStorage.getItem('gawa_payments')) {
    localStorage.setItem('gawa_payments', JSON.stringify(mockPayments));
  }
};

// Helper functions
export const getUserById = (id: string): User | undefined => {
  const users = JSON.parse(localStorage.getItem('gawa_users') || '[]');
  return users.find((u: User) => u.id === id);
};

export const getGroupById = (id: string): Group | undefined => {
  const groups = JSON.parse(localStorage.getItem('gawa_groups') || '[]');
  return groups.find((g: Group) => g.id === id);
};

export const getExpensesByGroupId = (groupId: string): Expense[] => {
  const expenses = JSON.parse(localStorage.getItem('gawa_expenses') || '[]');
  return expenses.filter((e: Expense) => e.group_id === groupId);
};

export const getPaymentsByExpenseId = (expenseId: string): Payment[] => {
  const payments = JSON.parse(localStorage.getItem('gawa_payments') || '[]');
  return payments.filter((p: Payment) => p.expense_id === expenseId);
};

export const calculateGroupBalances = (groupId: string): Record<string, number> => {
  const expenses = getExpensesByGroupId(groupId);
  const group = getGroupById(groupId);
  if (!group) return {};

  const balances: Record<string, number> = {};
  group.members.forEach(memberId => {
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

export const getExpenseCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    food: '🍽️',
    transport: '🚗',
    accommodation: '🏨',
    entertainment: '🎉',
    other: '📋',
  };
  return icons[category] || '📋';
};

export const getGroupCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    trip: '✈️',
    house: '🏠',
    event: '🎊',
    general: '👥',
  };
  return icons[category] || '👥';
};
