"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, ArrowRightLeft, Home } from "lucide-react";
import { authService } from "@/services/auth.service";

export function MenuBar() {
    const pathname = usePathname();

    if (pathname === '/login') {
        return null;
    }

    const routes = [
        {
            href: "/",
            label: "Home",
            icon: Home,
            active: pathname === "/",
        },
        {
            href: "/master-items",
            label: "Master Items",
            icon: Package,
            active: pathname === "/master-items",
        },
        {
            href: "/transactions",
            label: "Transactions",
            icon: ArrowRightLeft,
            active: pathname === "/transactions",
        },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            Inventory App
                        </Link>
                        <div className="flex gap-4">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        route.active
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <route.icon className="h-4 w-4" />
                                    {route.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={async () => {
                                try {
                                    await authService.logout();
                                } catch (e) {
                                    console.error('Logout failed', e);
                                }
                                if (typeof window !== 'undefined') {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('refreshToken');
                                    window.location.href = '/login';
                                }
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
