import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'operator';

export interface CurrentUser {
  name: string;
  role: UserRole;
  roleLabel: string;
  workshop: string;
  phone: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem('mold_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (u: CurrentUser) => {
    setUser(u);
    localStorage.setItem('mold_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mold_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const DEMO_ACCOUNTS = [
  {
    name: '张工',
    role: 'admin' as UserRole,
    roleLabel: '管理员',
    workshop: '挤出车间',
    phone: '13800138001',
    password: 'admin123',
    avatar: '张',
    desc: '可新增/编辑/删除模具，访问全部功能',
  },
  {
    name: '李工',
    role: 'operator' as UserRole,
    roleLabel: '操作员',
    workshop: '模压车间',
    phone: '13800138002',
    password: 'user123',
    avatar: '李',
    desc: '可提交使用记录，查看模具信息',
  },
];
