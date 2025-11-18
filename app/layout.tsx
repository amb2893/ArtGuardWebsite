// app/layout.tsx
'use client';

import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { UserBadge } from './components/UserBadge';
import { UserStateProvider, useUserState } from './UserStateProvider';

function AppShell({ children }: { children: ReactNode }) {
  const { user, loginAsDemo, logout } = useUserState();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>ArtGuard</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
            Defend Your Creative Work
          </p>
        </div>

        {/* Global user status (main site) + fake toggle */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            Main site user
          </div>
          <UserBadge user={user} />
          <div style={{ marginTop: '0.5rem' }}>
            {user ? (
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={loginAsDemo}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Sign in as Demo User
              </button>
            )}
          </div>
        </div>
      </header>

      <nav
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #ddd',
          paddingBottom: '0.75rem',
        }}
      >
        <Link href="/">Home</Link>
        <Link href="/articles">Articles</Link>
        <Link href="/ratings">Ratings</Link>
        <Link href="/forums">Forums</Link>
      </nav>

      <main>{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserStateProvider>
          <AppShell>{children}</AppShell>
        </UserStateProvider>
      </body>
    </html>
  );
}