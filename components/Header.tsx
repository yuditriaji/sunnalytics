/**
 * Header Component
 * 
 * Top navigation bar with logo and user menu.
 */

import UserMenu from './UserMenu';
import { useRouter } from 'next/router';
import { FaBell } from 'react-icons/fa';
import { useUser } from '@clerk/nextjs';

interface HeaderProps {
    title?: string;
}

export default function Header({ title = 'Sunnalytics' }: HeaderProps) {
    const router = useRouter();
    const { isSignedIn } = useUser();

    return (
        <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40 px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2"
                >
                    <span className="text-xl font-bold text-yellow-500">{title}</span>
                </button>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {isSignedIn && (
                        <button
                            onClick={() => router.push('/alerts')}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors relative"
                        >
                            <FaBell className="text-lg" />
                            {/* Notification badge - can be made dynamic */}
                        </button>
                    )}
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
