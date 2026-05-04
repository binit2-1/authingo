'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import authingoLogo from '@/assets/logo/authingo-blue.svg';
import { GithubLogoIcon, List, X } from "@phosphor-icons/react"

const manrope = Manrope({ subsets: ['latin'] });

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleGithubClick = () => {
        window.open('https://github.com/binit2-1/authingo', '_blank');
    };

	return (
		<header className={`${manrope.className} sticky top-0 z-30 w-full bg-fd-background/95 backdrop-blur`}>
			<div className="mx-auto flex h-16 w-full max-w-236.25 items-center justify-between border-b border-fd-border px-6">
				<Link href="/" className="flex items-center gap-2 w-32">
					<Image src={authingoLogo} alt="Authingo" width={132} height={28} priority />
				</Link>

				<div className="hidden sm:flex flex-1 justify-center">
					<nav className="flex items-center justify-center gap-6 text-sm font-semibold text-fd-foreground">
						<Link href="/docs" className="transition hover:text-fd-foreground">
							Docs
						</Link>
						<Link href="/playground" className="transition hover:text-fd-foreground">
							Playground
						</Link>
					</nav>
				</div>

				<div className="flex items-center justify-end gap-3 sm:gap-4 cursor-pointer w-32">
                    <GithubLogoIcon size={20} onClick={handleGithubClick} className="hidden sm:block"/>
					<ThemeSwitch />
                    <button 
                        className="sm:hidden text-fd-foreground p-1"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <List size={24} />}
                    </button>
				</div>
			</div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden absolute top-16 left-0 w-full bg-fd-background border-b border-fd-border py-4 px-6 flex flex-col gap-4 shadow-lg">
                    <Link 
                        href="/docs" 
                        className="text-base font-semibold text-fd-foreground hover:text-fd-primary transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Docs
                    </Link>
                    <Link 
                        href="/playground" 
                        className="text-base font-semibold text-fd-foreground hover:text-fd-primary transition"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Playground
                    </Link>
                    <div 
                        className="text-base font-semibold text-fd-foreground hover:text-fd-primary transition cursor-pointer"
                        onClick={() => {
                            handleGithubClick();
                            setIsMenuOpen(false);
                        }}
                    >
                        GitHub
                    </div>
                </div>
            )}
		</header>
	);
}
