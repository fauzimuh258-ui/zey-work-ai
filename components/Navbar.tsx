import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl tracking-wider text-emerald-500">ZEY WORK</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">AI DRAFT ASSISTANT</span>
      </div>
      <div className="flex gap-6 text-sm font-medium text-zinc-400">
        <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
        <Link href="/jobs" className="hover:text-white transition">Job Queue</Link>
        <Link href="/settings" className="hover:text-white transition">Settings</Link>
      </div>
    </nav>
  );
}
