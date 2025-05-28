"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Trophy,
  Users,
  BarChart3,
  Settings,
  Menu,
  Plus,
  Archive,
  Filter,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidenavProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and stats",
  },
  {
    title: "Competitions",
    href: "/admin/competitions",
    icon: Trophy,
    description: "Manage all competitions",
    badge: "New",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "User management",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Platform insights",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

const competitionActions = [
  {
    title: "Add Competition",
    href: "/admin/competitions/new",
    icon: Plus,
    description: "Create new competition",
  },
  {
    title: "Archive",
    href: "/admin/competitions/archive",
    icon: Archive,
    description: "Archived competitions",
  },
  {
    title: "Filter & Sort",
    href: "/admin/competitions?filter=true",
    icon: Filter,
    description: "Advanced filtering",
  },
];

export default function AdminSidenav({ className }: AdminSidenavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidenavContent = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">Competition Management</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      isActive && "bg-primary/10 text-primary",
                    )}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Competition Quick Actions */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Competition Tools
            </h3>
            <nav className="space-y-1">
              {competitionActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.href}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => {
                      router.push(action.href);
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">{action.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidenav */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidenavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidenav */}
      <div
        className={cn("hidden md:flex w-80 border-r border-border", className)}
      >
        <SidenavContent />
      </div>
    </>
  );
}
