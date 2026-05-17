import {
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  Percent,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Promotions", href: "/promotions", icon: Percent },
  { label: "Roadshow", href: "/roadshow", icon: Store },
  {
    label: "Finance",
    href: "/finance/payments",
    icon: CreditCard,
    children: [
      { label: "Payments", href: "/finance/payments" },
      { label: "Refunds", href: "/finance/refunds" },
      { label: "Disputes", href: "/finance/disputes" },
      { label: "Stripe Events", href: "/finance/stripe-events" },
      { label: "Audit Logs", href: "/finance/audit-logs" },
    ],
  },
];
