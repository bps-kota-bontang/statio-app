import type { MenuItem } from "@/type/menu";
import {
  Cable,
  ChartScatter,
  LayoutDashboard,
  PackageOpen,
  Table,
  User,
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
    title: "Collection",
    icon: <PackageOpen />,
    roles: ["admin"],
    children: [
      {
        title: "Organizations",
        href: "/collection/organizations",
      },
      {
        title: "Indicators",
        href: "/collection/indicators",
      },
      {
        title: "Dimensions",
        href: "/collection/dimensions",
      },
      {
        title: "Tables",
        href: "/collection/tables",
      },
    ],
  },
  {
    title: "Integration",
    icon: <Cable />,
    roles: ["admin"],
    href: "/integration",
  },
  {
    title: "Users",
    icon: <Users />,
    href: "/users",
    roles: ["admin"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <User />,
  },
];
