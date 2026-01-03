/**
 * UserMenu Component
 * 
 * Displays user avatar and dropdown menu for authenticated users,
 * or sign in/up buttons for unauthenticated users.
 */

import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaUser, FaCog, FaBell, FaCrown, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

interface UserMenuProps {
    compact?: boolean;
}

export default function UserMenu({ compact = false }: UserMenuProps) {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isLoaded) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        );
    }

    return (
        <>
            <SignedOut>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => router.push('/sign-up')}
                        className="px-3 py-1.5 text-sm bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                    >
                        Sign Up
                    </button>
                </div>
            </SignedOut>

            <SignedIn>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                        {user?.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt={user.firstName || 'User'}
                                className="w-8 h-8 rounded-full border-2 border-yellow-500/50"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <FaUser className="text-yellow-500 text-sm" />
                            </div>
                        )}
                        {!compact && (
                            <>
                                <span className="text-sm text-gray-300 hidden sm:block">
                                    {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
                                </span>
                                <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-700">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {user?.emailAddresses[0]?.emailAddress}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <MenuItem
                                    icon={<FaBell />}
                                    label="Alerts"
                                    onClick={() => { router.push('/alerts'); setIsOpen(false); }}
                                />
                                <MenuItem
                                    icon={<FaCrown />}
                                    label="Subscription"
                                    onClick={() => { router.push('/settings?tab=subscription'); setIsOpen(false); }}
                                    badge="Pro"
                                />
                                <MenuItem
                                    icon={<FaCog />}
                                    label="Settings"
                                    onClick={() => { router.push('/settings'); setIsOpen(false); }}
                                />
                            </div>

                            {/* Sign Out */}
                            <div className="py-1 border-t border-gray-700">
                                <MenuItem
                                    icon={<FaSignOutAlt />}
                                    label="Sign Out"
                                    onClick={() => signOut()}
                                    variant="danger"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SignedIn>
        </>
    );
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    badge?: string;
    variant?: 'default' | 'danger';
}

function MenuItem({ icon, label, onClick, badge, variant = 'default' }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
        >
            <span className="text-gray-400">{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                    {badge}
                </span>
            )}
        </button>
    );
}
