import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { useSettingsStore } from '@/store/settingsStore';
import { Moon, Sun, Monitor, Globe, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { settings: serverSettings, updateSettings, isUpdating } = useSettings();
  const { settings, setTheme, setLanguage, updateNotifications, updatePrivacy } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
    }
  }, [serverSettings]);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = localSettings.theme === 'system' ? systemTheme : localSettings.theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(activeTheme);
  }, [localSettings.theme]);

  const handleSave = () => {
    updateSettings(localSettings);
    setTheme(localSettings.theme);
    setLanguage(localSettings.language);
    updateNotifications(localSettings.notifications);
    updatePrivacy(localSettings.privacy);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Select your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setLocalSettings({ ...localSettings, theme: value as any })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      localSettings.theme === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={localSettings.language}
                onValueChange={(value) => setLocalSettings({ ...localSettings, language: value as any })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="si">සිංහල (Sinhala)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={localSettings.notifications.email}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, email: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notif">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch
                  id="push-notif"
                  checked={localSettings.notifications.push}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, push: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notif">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={localSettings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, sms: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={localSettings.privacy.profileVisibility}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      privacy: { ...localSettings.privacy, profileVisibility: value as any },
                    })
                  }
                >
                  <SelectTrigger id="profile-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">Display email on your profile</p>
                </div>
                <Switch
                  id="show-email"
                  checked={localSettings.privacy.showEmail}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      privacy: { ...localSettings.privacy, showEmail: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
