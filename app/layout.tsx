import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zey Work — AI Proposal Drafts',
  description: 'AI-assisted job match scoring and proposal drafting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950">{children}</body>
    </html>
  );
}
