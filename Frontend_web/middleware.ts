// Middleware disabled to avoid potential SSR conflicts on Firebase Hosting.
// Authentication is handled client-side via AuthContext.
export default function middleware() { }
export const config = { matcher: [] };
