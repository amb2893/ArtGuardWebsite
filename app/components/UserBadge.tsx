interface Props {
  isAdmin?: boolean;
  isTrusted?: boolean;
}

export default function UserBadge({ isAdmin, isTrusted }: Props) {
  if (isAdmin) return <span className="user-badge user-badge-admin">Admin</span>;
  if (isTrusted) return <span className="user-badge user-badge-trusted">Trusted</span>;
  return null;
}
