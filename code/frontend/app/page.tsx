import { redirect } from 'next/navigation';

// middleware.ts sends signed-in users to /dashboard; this covers everyone else.
export default function Home() {
  redirect('/login');
}
