import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Navbar from '@/components/navbar';
import { SidebarTrigger } from 'fumadocs-ui/layouts/docs/slots/sidebar';


export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <Navbar sidebarTrigger={SidebarTrigger} layout="docs" />,
    },
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
