import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Package, PlusCircle, User, Wifi, Battery, Bell } from 'lucide-react';

const TAB_ROUTES = ['/home', '/molds', '/add-usage', '/reminders', '/profile'];

const tabs = [
  { path: '/home', label: '首页', icon: Home },
  { path: '/molds', label: '模具', icon: Package },
  { path: '/add-usage', label: '新增记录', icon: PlusCircle, special: true },
  { path: '/reminders', label: '维保', icon: Bell },
  { path: '/profile', label: '我的', icon: User },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const showTabs = TAB_ROUTES.includes(location.pathname);
  const isLogin = location.pathname === '/login';

  // Match status bar color to each page's header gradient
  const statusBarBg =
    location.pathname === '/reminders'
      ? 'linear-gradient(160deg, #FF6D00 0%, #E65100 100%)'
      : '#1A73E8';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Phone Frame */}
      <div
        style={{
          width: '393px',
          height: '852px',
          borderRadius: '50px',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(0,0,0,0.3)',
          background: '#F5F7FA',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Status Bar */}
        {!isLogin && (
          <div
            style={{
              height: '56px',
              background: statusBarBg,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 24px 10px',
              flexShrink: 0,
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '34px',
                background: '#000',
                borderRadius: '20px',
                zIndex: 10,
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600 }}>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={13} color="rgba(255,255,255,0.9)" />
              <Battery size={15} color="rgba(255,255,255,0.9)" />
            </div>
          </div>
        )}

        {/* Login page has its own status bar */}
        {isLogin && (
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '56px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              padding: '0 24px 10px', zIndex: 10,
            }}
          >
            <div
              style={{
                position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                width: '120px', height: '34px', background: '#000', borderRadius: '20px',
              }}
            />
            <span style={{ color: '#333', fontSize: '12px', fontWeight: 600 }}>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={13} color="#333" />
              <Battery size={15} color="#333" />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
          }}
        >
          <Outlet />
        </div>

        {/* Bottom Tab Bar */}
        {showTabs && (
          <div
            style={{
              height: '64px',
              background: '#fff',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              paddingBottom: '2px',
            }}
          >
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path ||
                (tab.path === '/molds' && location.pathname.startsWith('/molds/'));
              const Icon = tab.icon;

              if (tab.special) {
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '2px', background: 'none', border: 'none',
                      cursor: 'pointer', padding: '0',
                    }}
                  >
                    <div
                      style={{
                        width: '40px', height: '40px',
                        background: isActive ? '#1557C0' : '#1A73E8',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(26,115,232,0.4)',
                        marginTop: '-14px',
                      }}
                    >
                      <Icon size={20} color="#fff" />
                    </div>
                    <span style={{ fontSize: '10px', color: isActive ? '#1A73E8' : '#9CA3AF', fontWeight: 500 }}>
                      {tab.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '2px', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '6px 0',
                  }}
                >
                  <Icon size={21} color={isActive ? '#1A73E8' : '#9CA3AF'} />
                  <span
                    style={{
                      fontSize: '10px',
                      color: isActive ? '#1A73E8' : '#9CA3AF',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}