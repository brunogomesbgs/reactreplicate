"use client";

import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ChevronLeft, X} from "lucide-react";
import {
    LayoutDashboard,
    Users,
    FileText,
    FolderKanban,
    Settings,
    CreditCard,
    LineChart,
} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useSidebar} from "@/lib/hooks/use-sidebar";
import {useEffect, useState} from "react";
import {useUser} from "@/hooks/useUser";

const mainNavItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Despesas",
        href: "/dashboard/despesas",
        icon: FileText,
    },
    {
        title: "Orçamentos",
        href: "/dashboard/orcamentos",
        icon: FileText,
    },
    {
        title: "Portfólio",
        href: "/dashboard/portfolio",
        icon: FolderKanban,
    },
    {
        title: "Insights",
        href: "/dashboard/insights",
        icon: LineChart,
    },
    {
        title: "Admin",
        href: "/dashboard/admin",
        icon: Settings,
    },
];

const configNavItems = [
    {
        title: "Equipe",
        href: "/dashboard/equipe",
        icon: Users,
    },
    {
        title: "Planos e assinatura",
        href: "/dashboard/planos",
        icon: CreditCard,
    },
    {
        title: "Configurações",
        href: "/dashboard/configuracoes",
        icon: Settings,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const {isCollapsed, toggle, isMobile, isOpen, setIsCollapsed} =
        useSidebar();

    const {user, loading} = useUser();
    const {isAdmin, setIsAdmin} = useState(false);
    const adminEmails = ["thark.pro", "redraw.pro"]
    const emailRegex = new RegExp(`[a-zA-Z0-9._%+-]+@(?:${adminEmails.join('|')})$`, 'gi');

    const checkIsAdmin = () => {
        setIsAdmin(user?.email.match(emailRegex || []));
    }

    // Em dispositivos grandes, definir collapsed com base no localStorage ou padrão
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            }
        };

        // Executar uma vez na montagem
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setIsCollapsed]);

    const sidebarVariants = {
        desktop: {
            width: isCollapsed ? 80 : 240,
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            } as any,
        },
        mobile: {
            width: 240,
            x: isOpen ? 0 : -320,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            } as any,
        },
    };

    return (
        <>
            {/* Overlay para mobile */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 0.5}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                        className="fixed inset-0 z-40 bg-black"
                        onClick={toggle}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={isMobile ? "mobile" : "desktop"}
                variants={sidebarVariants}
                className={cn(
                    "border-r bg-background shadow-sm",
                    "fixed left-0 top-0 z-50 h-screen flex flex-col"
                )}
            >
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link href="/" className="flex items-center">
                        <Image
                            src={isCollapsed && !isMobile ? "/short_logo.png" : "/logo.png"}
                            alt="Limify"
                            width={isCollapsed && !isMobile ? 32 : 100}
                            height={32}
                            className="h-8 w-auto"
                        />
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shadow-sm border border-input"
                        onClick={toggle}
                    >
                        {isMobile ? (
                            <X className="h-4 w-4"/>
                        ) : (
                            <motion.div
                                initial={false}
                                animate={{rotate: isCollapsed ? 180 : 0}}
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </motion.div>
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-6">
                        <div className="space-y-2">
                            {(!isCollapsed || isMobile) && (
                                <h2 className="px-2 text-sm font-medium text-muted-foreground">
                                    Trabalho
                                </h2>
                            )}
                            <div className="space-y-1">
                                {isAdmin && mainNavItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant={pathname === item.href ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            pathname === item.href &&
                                            "bg-primary text-primary-foreground",
                                            isCollapsed && !isMobile ? "px-2" : "px-4"
                                        )}
                                        asChild
                                    >
                                        <Link href={item.href} className="gap-2">
                                            <item.icon className="h-4 w-4 shrink-0"/>
                                            {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(!isCollapsed || isMobile) && (
                                <h2 className="px-2 text-sm font-medium text-muted-foreground">
                                    Configurações
                                </h2>
                            )}
                            <div className="space-y-1">
                                {configNavItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant={pathname === item.href ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            pathname === item.href &&
                                            "bg-primary text-primary-foreground",
                                            isCollapsed && !isMobile ? "px-2" : "px-4"
                                        )}
                                        asChild
                                    >
                                        <Link href={item.href} className="gap-2">
                                            <item.icon className="h-4 w-4 shrink-0"/>
                                            {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            </motion.aside>
        </>
    );
}
