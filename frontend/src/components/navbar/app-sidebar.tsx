import { BarChart3,  UserPlus, Package, User } from "lucide-react"
import { useNavigate, useLocation } from 'react-router'
import { useState } from 'react'
import { ProfileModal } from '@/components/user-profile/profile-modal'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
 
  
} from "@/components/ui/sidebar"

// Menu items to match the image
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Users Data",
    url: "/users",
    icon: UserPlus,
  },
  {
    title: "Products Data", 
    url: "/products",
    icon: Package,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  

  return (
    <Sidebar className="w-16" collapsible="none">
      <SidebarContent>
        <SidebarHeader className="border-b p-3">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarGroup className="flex-1 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2 py-4">
              {items.map((item) => {
                const isActive = item.url === '#' ? false : 
                  (item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url))
                const Icon = item.icon
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.url === '/profile') {
                          setIsProfileModalOpen(true)
                        } else if (item.url !== '#') {
                          navigate(item.url)
                        }
                      }}
                      className={`
                        w-12 h-12 flex items-center justify-center rounded-lg
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      tooltip={item.title}
                    >
                      <Icon className="w-5 h-5" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </Sidebar>
  )
}