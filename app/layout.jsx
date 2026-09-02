import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (deploymentHost ? `https://${deploymentHost}` : 'https://kavach-disaster-intelligence.piyushrya03.chatgpt.site');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KAVACH Delhi — Disaster Command Centre',
  description: 'Delhi NCT multi-hazard command centre for local environmental intelligence and incident response.',
  openGraph: {
    title: 'KAVACH Delhi — Disaster Command Centre',
    description: 'Delhi NCT geospatial intelligence and incident operations portal.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'KAVACH disaster intelligence network' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAVACH Delhi — Disaster Command Centre',
    description: 'Delhi NCT geospatial intelligence and incident operations portal.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
