// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <section>
      <h2>Welcome to ArtGuard!</h2>

      <ul>
        <li>
          <Link href="/articles">Go to Articles</Link>
        </li>
        <li>
          <Link href="/ratings">Go to Ratings</Link>
        </li>
        <li>
          <Link href="/forums">Go to Forums</Link>
        </li>
      </ul>
    </section>
  );
}
