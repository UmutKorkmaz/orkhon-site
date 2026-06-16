export { auth as middleware } from "@/auth";

export const config = {
  // Run the auth middleware on everything except stateless assets and the
  // Next.js internals. No route is blocked — `authorized` always returns true.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
