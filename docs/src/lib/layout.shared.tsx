import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Navbar from '@/components/navbar';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <Navbar />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
