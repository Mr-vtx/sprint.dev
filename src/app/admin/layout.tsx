import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The root layout already provides <html>, fonts and the theme provider.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
