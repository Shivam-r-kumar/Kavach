import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://kavach-disaster-intelligence.openai.site'),
  title: 'KAVACH — Multi-Hazard Disaster Intelligence',
  description: 'Edge-AI powered multi-hazard environmental intelligence and early warning network.',
  openGraph: {
    title: 'KAVACH — Multi-Hazard Disaster Intelligence',
    description: 'One Network. Multiple Hazards. Intelligence at the Edge.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'KAVACH multi-hazard intelligence network' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAVACH — Multi-Hazard Disaster Intelligence',
    description: 'One Network. Multiple Hazards. Intelligence at the Edge.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
