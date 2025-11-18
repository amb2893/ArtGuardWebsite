// app/components/UserBadge.tsx
import { DemoUser } from '../demoUser';

type Props = {
  user: DemoUser | null;
};

export function UserBadge({ user }: Props) {
  if (!user) {
    return (
      <div style={{ fontSize: '0.9rem' }}>
        <div>Signed in as:</div>
        <strong style={{ opacity: 0.7 }}>Not signed in</strong>
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <div>Signed in as:</div>
      <strong>{user.name}</strong>
      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user.email}</div>
    </div>
  );
}