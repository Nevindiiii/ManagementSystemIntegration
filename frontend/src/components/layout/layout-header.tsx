import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, ChevronDown, Settings } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LayoutHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/');
  };

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="flex h-20 items-center justify-between gap-2 border-b border-gray-300 bg-white px-4 ">
      {/* Left side - can add title or other elements here */}
      <div></div>

      {/* User Profile Dropdown - Right side */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 px-3 py-2 h-10 border-black text-black hover:bg-black hover:text-white"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{firstName}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="text-black focus:text-blue-600 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Custom Avatar with First Letter */}
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold text-sm shadow-lg">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
