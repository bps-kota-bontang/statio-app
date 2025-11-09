import type { MenuItem } from "@/type/menu";
import { LayoutDashboard, Settings, Table } from "lucide-react";

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
    title: "Management",
    icon: <Settings />,
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
];
