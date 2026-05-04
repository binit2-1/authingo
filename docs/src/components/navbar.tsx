'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import authingoLogo from '@/assets/logo/authingo-blue.svg';

const manrope = Manrope({ subsets: ['latin'] });

export default function Navbar() {
	return (
		<header
			className={`${manrope.className} sticky top-0 z-40 w-full border-b border-fd-border bg-fd-background/95 backdrop-blur`}
		>
			<div className="mx-auto flex h-16 w-full max-w-336.25 items-center gap-4 px-6">
				<Link href="/" className="flex items-center gap-2">
					<Image src={authingoLogo} alt="Authingo" width={132} height={28} priority />
				</Link>

				<div className="flex-1">
					<nav className="flex items-center justify-center gap-6 text-sm font-semibold text-fd-foreground">
						<Link href="/docs" className="transition hover:text-fd-foreground">
							Docs
						</Link>
						<Link href="/playground" className="transition hover:text-fd-foreground">
							Playground
						</Link>
					</nav>
				</div>

				<div className="flex items-center justify-end">
					<ThemeSwitch />
				</div>
			</div>
		</header>
	);
}
