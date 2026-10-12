import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface StoreState {
  wishlist: string[];
  compare: string[];
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isWishlisted: (id: string) => boolean;
  isComparing: (id: string) => boolean;
}

const StoreContext = createContext<StoreState | null>(null);

const read = (key: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(read("slv_wishlist"));
    setCompare(read("slv_compare"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("slv_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    window.localStorage.setItem("slv_compare", JSON.stringify(compare));
  }, [compare]);

  const toggleWishlist = (id: string) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const toggleCompare = (id: string) =>
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 3) return c;
      return [...c, id];
    });

  const value: StoreState = {
    wishlist,
    compare,
    toggleWishlist,
    toggleCompare,
    clearCompare: () => setCompare([]),
    isWishlisted: (id) => wishlist.includes(id),
    isComparing: (id) => compare.includes(id),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
