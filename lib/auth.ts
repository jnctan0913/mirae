// Hardcoded users
const USERS = [
  {
    id: '1',
    email: 'student1@test.com',
    password: 'password123',
    name: '김민수',
  },
  {
    id: '2',
    email: 'student2@test.com',
    password: 'password123',
    name: '이지은',
  },
];

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User;
  expiresAt: number;
}

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper to set cookie
function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to delete cookie
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Get current session
export function getSession(): Session | null {
  const sessionData = getCookie('auth_session');
  if (!sessionData) return null;

  try {
    const session = JSON.parse(decodeURIComponent(sessionData)) as Session;

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      deleteCookie('auth_session');
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Sign in
export function signIn(email: string, password: string): { user: User } | { error: string } {
  const user = USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const session: Session = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  setCookie('auth_session', encodeURIComponent(JSON.stringify(session)), 7);

  return { user: session.user };
}

// Sign up (disabled - using hardcoded users only)
export function signUp(email: string, password: string, name: string): { error: string } {
  return { error: 'signupDisabledError' };
}

// Sign out
export function signOut() {
  deleteCookie('auth_session');
}

// Get user
export function getUser(): User | null {
  const session = getSession();
  return session?.user || null;
}
