import * as React from 'react';
import { Users, BarChart2,  Package, TrendingUp, Activity, User, Eye, Clock,  LucideIcon } from 'lucide-react';

interface ActivityItem {
  type: string;
  title: string;
  time: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}
import { useNavigate } from 'react-router';
import { useUsers } from '@/hooks/useUserQueries';
import { useProducts } from '@/hooks/useProductQueries';
import { usePostStore } from '@/store/postStore';
import { Button } from '@/components/ui/button';
import { ActivityChart } from '@/components/customUi/ActivityChart';



export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const newPosts = usePostStore((s) => s.newPosts);

  // Debug: Log products data
  React.useEffect(() => {
    if (products.length > 0) {
      console.log('Products from API:', products.length, products);
    }
  }, [products]);

  
  // added newly added users
  const combinedUsers = React.useMemo(() => {
    if (!users) return newPosts ?? [];
    const existingIds = new Set((newPosts || []).map((p) => p.id));
    const others = (users || []).filter((u: any) => !existingIds.has(u.id));
    return [...(newPosts || []), ...others];
  }, [users, newPosts]);

  // Recent activity data
  const recentActivity = React.useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Add recent users
    combinedUsers.slice(0, 3).forEach((user: any) => {
      activities.push({
        type: 'user',
        title: `New user registered: ${user.name || user.email || 'Unknown'}`,
        time: '2 hours ago',
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    });
    
    // Add recent products
    products.slice(0, 2).forEach((product: any) => {
      activities.push({
        type: 'product',
        title: `Product added: ${product.name || 'New Product'}`,
        time: '4 hours ago',
        icon: Package,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    });
    
    return activities.slice(0, 5);
  }, [combinedUsers, products]);



  return (
    <div className="min-h-screen ml-[-40px] mt-[-60px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold text-black ">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Products
          </Button>
          <Button 
            onClick={() => navigate('/users')}
            className=" hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <User className="w-4 h-4 mr-2" />
            View Users
          </Button>
        </div>
      </div>

      {/* Horizontal Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Users</p>
              {usersLoading ? (
                <div className="w-16 h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-slate-800 mb-2">
                  {combinedUsers.length}
                </p>
              )}
              <p className="text-emerald-600 text-sm flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Products</p>
              {productsLoading ? (
                <div className="w-16 h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-slate-800 mb-2">
                  {products.length}
                </p>
              )}
              <p className="text-emerald-600 text-sm flex items-center font-medium">
                <Package className="w-3 h-3 mr-1" />
                Live from API
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-800 mb-2">24</p>
              <p className="text-blue-600 text-sm flex items-center font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse inline-block"></span>
                Live now
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Performance</p>
              <p className="text-3xl font-bold text-slate-800 mb-2">98.5%</p>
              <p className="text-emerald-600 text-sm flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Excellent status
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Left: Activity Chart, Right: Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Activity Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              Product Analytics
            </h3>
            <p className="text-sm text-slate-500 font-medium">Price distribution overview</p>
          </div>
          <ActivityChart cartData={products} />
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              Recent Activity
            </h3>
            <p className="text-sm text-slate-500 font-medium">Live updates</p>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.bgColor}`}>
                      <IconComponent className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}