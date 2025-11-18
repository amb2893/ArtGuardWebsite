// app/forums/page.tsx
'use client';

import { useUserState } from '../UserStateProvider';
import { UserBadge } from '../components/UserBadge';

export default function ForumsPage() {
  const { user, loginAsDemo, logout } = useUserState();

  return (
    <section>
      <h2>Forums</h2>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: 4,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Forums user session</h3>
        <UserBadge user={user} />

        <div style={{ marginTop: '0.75rem' }}>
          {user ? (
            <button
              type="button"
              onClick={logout}
              style={{
                padding: '0.35rem 0.9rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Sign out (Forums)
            </button>
          ) : (
            <button
              type="button"
              onClick={loginAsDemo}
              style={{
                padding: '0.35rem 0.9rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Sign in as Demo User (Forums)
            </button>
          )}
        </div>

      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Example threads</h3>
        <ul>
          <li>Welcome to the forums</li>
          <li>Feature requests</li>
          <li>General discussion</li>
        </ul>
      </div>
    </section>
  );
}