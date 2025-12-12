'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wine,
  Search,
  User,
  Menu,
  X,
  Home,
  BookOpen,
  Gamepad2,
  Award,
  Map,
  GraduationCap,
  History,
  Scan,
  Settings,
  LogOut,
  Crown,
  Bell,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/spirits', label: 'Spirits', icon: Wine },
  { href: '/collection', label: 'Collection', icon: Heart },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/courses', label: 'Academy', icon: GraduationCap },
  { href: '/history', label: 'Museum', icon: History },
  { href: '/distilleries', label: 'Distilleries', icon: Map },
];

const userMenuItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/rewards', label: 'Rewards', icon: Award },
  { href: '/subscription', label: 'Subscription', icon: Crown },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              CRAV<span className="text-amber-400">Barrels</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-5 h-5 text-gray-400" />
            </Button>

            {/* Scanner */}
            <Link href="/scan">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Scan className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="hidden sm:flex relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </Button>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </Button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <p className="font-medium text-white">Welcome!</p>
                      <p className="text-sm text-gray-400">Manage your account</p>
                    </div>
                    <div className="p-2">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="p-2 border-t border-gray-700">
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-gray-800">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        active
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-gray-800">
                  <Link
                    href="/scan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-400 bg-amber-500/10"
                  >
                    <Scan className="w-5 h-5" />
                    Scan Bottle
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
