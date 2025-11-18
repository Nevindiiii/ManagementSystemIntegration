import * as React from 'react';
import {
  Users,
  BarChart2,
  Package,
  TrendingUp,
  Activity,
  User,
  Eye,
  Clock,
  LucideIcon,
  UserPlus,
  Calendar,
} from 'lucide-react';
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
import { CategoryChart } from '@/components/customUi/CategoryChart';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: usersResponse, isLoading: usersLoading } = useUsers(1, 100);
  const { data: productsResponse, isLoading: productsLoading } = useProducts(
    0,
    100
  );
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
    const ages = combinedUsers
      .map((user: any) => user.age || 0)
      .filter((age: number) => age > 0);
    if (ages.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...ages),
      max: Math.max(...ages),
      avg: Math.round(
        ages.reduce((a: number, b: number) => a + b, 0) / ages.length
      ),
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
        bgColor: 'bg-blue-100',
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
        bgColor: 'bg-green-100',
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
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's your business overview
            </p>
          </div>
          <div className="flex gap-3">
            <NotificationPanel />
            <Button variant="outline" onClick={() => navigate('/products')}>
              <Eye className="mr-2 h-4 w-4" />
              View Products
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth-users')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Auth Users
            </Button>
            <Button onClick={() => navigate('/users')}>
              <User className="mr-2 h-4 w-4" />
              View Users
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2 text-base">
                Total Users
              </p>
              {usersLoading ? (
                <div className="bg-muted mb-3 h-10 w-20 animate-pulse rounded"></div>
              ) : (
                <p className="mb-3 text-4xl font-bold">
                  {combinedUsers.length}
                </p>
              )}
              <p className="flex items-center text-base text-green-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                +12% from last month
              </p>
            </div>
            <div className="bg-primary rounded-xl p-4">
              <Users className="text-primary-foreground h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2 text-base">Products</p>
              {productsLoading ? (
                <div className="bg-muted mb-3 h-10 w-20 animate-pulse rounded"></div>
              ) : (
                <p className="mb-3 text-4xl font-bold">{products.length}</p>
              )}
              <p className="flex items-center text-base text-green-600">
                <Package className="mr-1 h-4 w-4" />
                Live from API
              </p>
            </div>
            <div className="rounded-xl bg-green-600 p-4">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2 text-base">
                Today's New Users
              </p>
              {usersLoading ? (
                <div className="bg-muted mb-3 h-10 w-20 animate-pulse rounded"></div>
              ) : (
                <p className="mb-3 text-4xl font-bold">
                  {todaysNewUsers.length}
                </p>
              )}
              <p className="flex items-center text-base text-blue-600">
                <Calendar className="mr-1 h-4 w-4" />
                Added today
              </p>
            </div>
            <div className="rounded-xl bg-purple-600 p-4">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2 text-base">
                User Age Range
              </p>
              {usersLoading ? (
                <div className="bg-muted mb-3 h-10 w-20 animate-pulse rounded"></div>
              ) : (
                <p className="mb-3 text-4xl font-bold">
                  {ageRange.min}-{ageRange.max}
                </p>
              )}
              <p className="flex items-center text-base text-orange-600">
                <Activity className="mr-1 h-4 w-4" />
                Avg: {ageRange.avg} years
              </p>
            </div>
            <div className="rounded-xl bg-orange-600 p-4">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="mr-4 rounded-xl bg-blue-100 p-3">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              Category Breakdown
            </h3>
            <p className="text-muted-foreground text-base">
              Product categories
            </p>
          </div>
          <CategoryChart products={products} />
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="mr-4 rounded-xl bg-purple-100 p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              Product Analytics
            </h3>
            <p className="text-muted-foreground text-base">
              Price distribution
            </p>
          </div>
          <div className="mb-6 flex justify-center">
            <ActivityChart cartData={products} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="mr-4 rounded-xl bg-blue-100 p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              Recent Activity
            </h3>
            <p className="text-muted-foreground text-base">Live updates</p>
          </div>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={index}
                    className="hover:bg-muted/50 flex items-center space-x-4 rounded-xl p-4"
                  >
                    <div className={`rounded-full p-3 ${activity.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium">{activity.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="mr-4 rounded-xl bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              Quick Stats
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-blue-700">
                  {new Set(products.map((p) => p.category)).size}
                </p>
              </div>
              <BarChart2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Avg Product Price</p>
                <p className="text-2xl font-bold text-purple-700">
                  $
                  {products.length > 0
                    ? (
                        products.reduce((sum, p) => sum + p.price, 0) /
                        products.length
                      ).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-orange-700">
                  {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center text-xl font-semibold">
              <div className="mr-4 rounded-xl bg-amber-100 p-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              User Insights
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-700">
                  {combinedUsers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
              <div>
                <p className="text-sm text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-blue-700">
                  {todaysNewUsers.length}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Avg Age</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {ageRange.avg} years
                </p>
              </div>
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
