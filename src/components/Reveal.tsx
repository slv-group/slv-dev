import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type RevealDirection = "up" | "left" | "right" | "fade";

const dirMap: Record<RevealDirection, { hidden: string; shown: string }> = {
  up: { hidden: "translate-y-8 opacity-0", shown: "translate-y-0 opacity-100" },
  left: { hidden: "-translate-x-8 opacity-0", shown: "translate-x-0 opacity-100" },
  right: { hidden: "translate-x-8 opacity-0", shown: "translate-x-0 opacity-100" },
  fade: { hidden: "opacity-0 scale-95", shown: "opacity-100 scale-100" },
};

export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: RevealDirection;
  as?: "div" | "section" | "li";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const dir = dirMap[from];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        shown ? dir.shown : dir.hidden,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
