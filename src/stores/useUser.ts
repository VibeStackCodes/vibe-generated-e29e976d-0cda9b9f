import React, { createContext, useContext, useMemo, useState } from 'react';
import type { User, UserRole } from '@/types';

type UserContextType = {
  user: User;
  login: (role: UserRole) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ id: 'u1', name: 'Guest', email: '', role: 'viewer' });

  const login = (role: UserRole) => {
    const next: User = { id: 'u-rol-'+role, name: 'User '+role, email: role+"@example.com", role };
    setUser(next);
  };

  const logout = () => {
    setUser({ id: 'u1', name: 'Guest', email: '', role: 'viewer' });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
