import * as React from 'react';
import { Users, BarChart2,  Package, TrendingUp, Activity, User, Eye, Clock,  LucideIcon, UserPlus, Calendar } from 'lucide-react';
import { NotificationPanel } from '@/components/customUi/NotificationPanel';

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
  const { data: usersResponse, isLoading: usersLoading } = useUsers(1, 100);
  const { data: productsResponse, isLoading: productsLoading } = useProducts(0, 100);
  const newPosts = usePostStore((s) => s.newPosts);
  
  const users = usersResponse?.users || [];
  const products = productsResponse?.products || [];

  // Debug: Log products data
  React.useEffect(() => {
    if (products.length > 0) {
      console.log('Products from API:', products.length, products);
    }
  }, [products]);

  
  // added newly added users
  const combinedUsers = React.useMemo(() => {
    if (!users || users.length === 0) return newPosts ?? [];
    const existingIds = new Set((newPosts || []).map((p) => p.id));
    const others = users.filter((u: any) => !existingIds.has(u.id));
    return [...(newPosts || []), ...others];
  }, [users, newPosts]);

  // Today's new users
  const todaysNewUsers = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return combinedUsers.filter((user: any) => {
      const userDate = new Date(user.createdAt || Date.now());
      return userDate >= today;
    });
  }, [combinedUsers]);

  // Age range calculation
  const ageRange = React.useMemo(() => {
    if (combinedUsers.length === 0) return { min: 0, max: 0, avg: 0 };
    const ages = combinedUsers.map((user: any) => user.age || 0).filter((age: number) => age > 0);
    if (ages.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...ages),
      max: Math.max(...ages),
      avg: Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length)
    };
  }, [combinedUsers]);

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
    <div className="ms-container">
      <div className="ms-header">
        <div className="flex items-start justify-between">
          <div>
            <h1>Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's your business overview</p>
          </div>
          <div className="flex gap-3">
            <NotificationPanel />
            <Button variant="outline" onClick={() => navigate('/products')}>
              <Eye className="w-4 h-4 mr-2" />
              View Products
            </Button>
            <Button onClick={() => navigate('/users')}>
              <User className="w-4 h-4 mr-2" />
              View Users
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-base mb-2">Total Users</p>
              {usersLoading ? (
                <div className="w-20 h-10 bg-muted rounded animate-pulse mb-3"></div>
              ) : (
                <p className="text-4xl font-bold mb-3">
                  {combinedUsers.length}
                </p>
              )}
              <p className="text-green-600 text-base flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-4 bg-primary rounded-xl">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-base mb-2">Products</p>
              {productsLoading ? (
                <div className="w-20 h-10 bg-muted rounded animate-pulse mb-3"></div>
              ) : (
                <p className="text-4xl font-bold mb-3">
                  {products.length}
                </p>
              )}
              <p className="text-green-600 text-base flex items-center">
                <Package className="w-4 h-4 mr-1" />
                Live from API
              </p>
            </div>
            <div className="p-4 bg-green-600 rounded-xl">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-base mb-2">Today's New Users</p>
              {usersLoading ? (
                <div className="w-20 h-10 bg-muted rounded animate-pulse mb-3"></div>
              ) : (
                <p className="text-4xl font-bold mb-3">
                  {todaysNewUsers.length}
                </p>
              )}
              <p className="text-blue-600 text-base flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Added today
              </p>
            </div>
            <div className="p-4 bg-purple-600 rounded-xl">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-base mb-2">User Age Range</p>
              {usersLoading ? (
                <div className="w-20 h-10 bg-muted rounded animate-pulse mb-3"></div>
              ) : (
                <p className="text-4xl font-bold mb-3">
                  {ageRange.min}-{ageRange.max}
                </p>
              )}
              <p className="text-orange-600 text-base flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Avg: {ageRange.avg} years
              </p>
            </div>
            <div className="p-4 bg-orange-600 rounded-xl">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              Product Analytics
            </h3>
            <p className="text-base text-muted-foreground">Price distribution overview</p>
          </div>
          <ActivityChart cartData={products} />
        </div>

        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              Recent Activity
            </h3>
            <p className="text-base text-muted-foreground">Live updates</p>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50">
                    <div className={`p-3 rounded-full ${activity.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}