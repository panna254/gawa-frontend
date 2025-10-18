import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  credit_score: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('gawa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('gawa_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('gawa_user', JSON.stringify(userWithoutPassword));
      toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Login failed', description: 'Invalid email or password.', variant: 'destructive' });
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('gawa_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      toast({ title: 'Signup failed', description: 'Email already exists.', variant: 'destructive' });
      throw new Error('Email exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      phone_number: phone,
      password,
      credit_score: 750,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('gawa_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('gawa_user', JSON.stringify(userWithoutPassword));
    
    toast({ title: 'Account created!', description: 'Welcome to Gawa.' });
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gawa_user');
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
