"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, MessageSquare, User } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Weekly Questions",
    icon: Calendar,
    href: "/questions",
    color: "text-violet-500",
  },
  {
    label: "My Groups",
    icon: Users,
    href: "/groups",
    color: "text-pink-700",
  },
  {
    label: "Chats",
    icon: MessageSquare,
    color: "text-orange-500",
    href: "/chats",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
    color: "text-emerald-500",
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col border-r bg-background md:w-60">
      <div className="flex h-14 items-center border-b px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-xl">mindsync</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn("justify-start", pathname === route.href && "bg-secondary")}
            asChild
          >
            <Link href={route.href}>
              <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
