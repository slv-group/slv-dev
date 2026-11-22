import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/store/useStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComparisonBar } from "@/components/ComparisonBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";
import { IMAGE_FALLBACK_SCRIPT } from "@/lib/image";
import { SITE_JSON_LD, jsonLd } from "@/lib/seo";

const AIAssistant = lazy(() =>
  import("@/components/AIAssistant").then((module) => ({
    default: module.AIAssistant,
  })),
);

const ContactPopup = lazy(() =>
  import("@/components/ContactPopup").then((module) => ({
    default: module.ContactPopup,
  })),
);

function DeferredAIAssistant() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <AIAssistant />
    </Suspense>
  );
}

function DeferredContactPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or submitted the popup in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("slv_contact_popup_dismissed")) {
      return;
    }

    // Show popup after 15 seconds of browsing
    const timer = window.setTimeout(() => {
      setShow(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <ContactPopup />
    </Suspense>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SLV Group — Premium Real Estate in Vijayawada & Amaravati" },
      {
        name: "description",
        content:
          "SLV Group — Leading real estate developers in Vijayawada, Guntur & Amaravati CRDA region. Delivering premium residential layouts, gated communities, and luxury living spaces.",
      },
      { name: "author", content: "SLV Group" },
      { property: "og:title", content: "SLV Group — Premium Real Estate Developers" },
      {
        property: "og:description",
        content:
          "Explore premium gated communities, open plots, and luxury residences across Vijayawada, Guntur, and Amaravati by SLV Group.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.slvgroup.co.in" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SLV Group — Premium Real Estate Developers" },
      {
        name: "twitter:description",
        content:
          "Leading real estate developers in Vijayawada, Guntur & Amaravati CRDA region. Delivering premium layouts and residences.",
      },
      {
        property: "og:image",
        content: "https://www.slvgroup.co.in/slv-logo.png",
      },
      {
        name: "twitter:image",
        content: "https://www.slvgroup.co.in/slv-logo.png",
      },
    ],
    // NOTE: No canonical here. Each page sets its own canonical in its route `head`.
    // A root-level canonical is rendered on every page in addition to the page's own,
    // which tells search engines that every page is a duplicate of the homepage.
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "/slv-logo.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        // Only Poppins is used by the site (see --font-sans / --font-display in styles.css).
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Falls back to the original image if Vercel's image optimizer is unavailable */}
        <script dangerouslySetInnerHTML={{ __html: IMAGE_FALLBACK_SCRIPT }} />
        {/* Business + website details for search engines (every page) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(SITE_JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        {!isAdminRoute && <Navbar />}
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main className={isAdminRoute ? "" : "min-h-screen"}>
          <Outlet />
        </main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <ComparisonBar />}
        {!isAdminRoute && <WhatsAppButton />}
        {!isAdminRoute && <DeferredAIAssistant />}
        {!isAdminRoute && <DeferredContactPopup />}
        <Toaster position="top-center" richColors />
      </StoreProvider>
    </QueryClientProvider>
  );
}
