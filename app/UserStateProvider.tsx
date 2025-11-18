// app/UserStateProvider.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { demoUser, DemoUser } from './demoUser';

type UserContextValue = {
  user: DemoUser | null;
  loginAsDemo: () => void;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserStateProvider({ children }: { children: ReactNode }) {
  // Start logged OUT
  const [user, setUser] = useState<DemoUser | null>(null);

  const loginAsDemo = () => setUser(demoUser);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, loginAsDemo, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserState() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return ctx;
}