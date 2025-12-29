import type { MenuItem } from "@/type/menu";
import {
  ChartScatter,
  LayoutDashboard,
  Settings,
  Table,
  Users,
} from "lucide-react";

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard />,
  },
  {
    title: "Tables",
    href: "/tables",
    icon: <Table />,
  },
  {
    title: "Analysis",
    icon: <ChartScatter />,
    roles: ["admin"],
    href: "/analysis",
  },
  {
    title: "Management",
    icon: <Settings />,
    roles: ["admin"],
    children: [
      {
        title: "Organizations",
        href: "/management/organizations",
      },
      {
        title: "Indicators",
        href: "/management/indicators",
      },
      {
        title: "Dimensions",
        href: "/management/dimensions",
      },
      {
        title: "Tables",
        href: "/management/tables",
      },
    ],
  },
  {
    title: "Users",
    icon: <Users />,
    href: "/users",
    roles: ["admin"],
  },
];
