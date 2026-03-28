"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTripStore } from "@/store/trip-store";

const NAV_ITEMS = [
  {
    href: "/trips",
    label: "旅行",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#F59E0B" : "#888888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-8 4 4 4-6 4 6" />
        <line x1="3" y1="21" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "記帳",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#F59E0B" : "none"}
        stroke={active ? "#F59E0B" : "#888888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/records",
    label: "明細",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#F59E0B" : "#888888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "統計",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#F59E0B" : "#888888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/split",
    label: "分帳",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#F59E0B" : "#888888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

// Pages that carry trip_id as a query param in their nav links
const TRIP_AWARE_HREFS = new Set(["/records", "/dashboard", "/split", "/upload"]);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTripId = useTripStore((s) => s.currentTripId);
  const prevTripId = useRef(currentTripId);

  // When trip switches, update URL so trip-aware pages refetch immediately
  useEffect(() => {
    if (!currentTripId || currentTripId === prevTripId.current) return;
    prevTripId.current = currentTripId;
    const base = pathname.split("?")[0];
    if (TRIP_AWARE_HREFS.has(base)) {
      router.replace(`${base}?trip_id=${currentTripId}`);
    }
  }, [currentTripId, pathname, router]);

  // Build nav href: trip-aware pages get ?trip_id= appended
  const navHref = (href: string) => {
    if (TRIP_AWARE_HREFS.has(href) && currentTripId) {
      return `${href}?trip_id=${currentTripId}`;
    }
    return href;
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col h-dvh bg-[#0f0f0f]">
      <main className="flex-1 overflow-y-auto">{children}</main>

      <nav
        className="flex-shrink-0 bg-[#1a1a1a] border-t border-[#2e2e2e]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={navHref(item.href)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 active:opacity-70 transition-opacity"
              >
                {item.icon(active)}
                <span className={`text-[9px] font-medium ${active ? "text-amber-500" : "text-[#888888]"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
