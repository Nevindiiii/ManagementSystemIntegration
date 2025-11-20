import { useState } from 'react';
import { BarChart3, UserPlus, Package, User, Settings, Menu, PackagePlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileModal } from '@/components/user-profile/profile-modal';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Users Data', url: '/users', icon: UserPlus },
  { title: 'Products Data', url: '/products', icon: Package },
  { title: 'Manual Products', url: '/manual-products', icon: PackagePlus },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function FloatingNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div className="fixed top-2 left-6 z-50">
        <div
          className={`rounded-full bg-white shadow-2xl transition-all duration-300 ease-out ${isExpanded ? 'px-3 py-3' : 'p-4'} `}
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 w-8 items-center justify-center text-black transition-transform hover:scale-110"
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {isExpanded && (
              <>
                {items.map((item) => {
                  const isActive = location.pathname.startsWith(item.url);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        if (item.url === '/profile') {
                          setIsProfileModalOpen(true);
                        } else {
                          navigate(item.url);
                        }
                        setIsExpanded(false);
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-black scale-110 text-white'
                          : 'text-black hover:bg-gray-100'
                      } `}
                      title={item.title}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
