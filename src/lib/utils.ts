import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to determine if a route is protected
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/admin", "/agent-dashboard"];
  const protectedPrefixes = ["/admin/"];

  return (
    protectedRoutes.includes(pathname) ||
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}
