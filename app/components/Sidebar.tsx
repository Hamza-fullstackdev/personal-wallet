import React from "react";
import { ArrowDownRight, Folder, Inbox, Pen } from "lucide-react";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";

const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Inbox,
  },
  {
    title: "Categories",
    url: "/app/categories",
    icon: Folder,
  },
  {
    title: "Incomings",
    url: "/app/incomings",
    icon: ArrowDownRight,
  },
];
const Sidebar = () => {
  return (
    <SidebarRoot>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' asChild>
                <Link href='/app' className='!text-white hover:!bg-white/10'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-sm border border-white text-sidebar-primary-foreground'>
                    <Pen className='size-4' />
                  </div>
                  <div className='flex flex-col gap-0.5 leading-none'>
                    <span className='font-semibold'>Personal Wallet</span>
                    <span className='text-xs'>Manage your wallet</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel className='!text-white'>
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className='!text-white hover:!bg-white/10'
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarRoot>
  );
};

export default Sidebar;
