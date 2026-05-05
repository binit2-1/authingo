import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Navbar from '@/components/navbar';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout nav={{ component: <Navbar layout="home" /> }}>{children}</HomeLayout>;
}
