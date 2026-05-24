import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '@/api/adminApi'
import { useTheme } from '@/context/theme-context'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import type { AppSettings } from '@/types/entities'

export function SettingsPage() {
  const { isDarkMode, setDarkMode } = useTheme()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await adminApi.updateSettings(settings)
      setSettings(updated)
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure Invyte admin and platform defaults"
        action={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4 dark:bg-white/5">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-purple-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frontendUrl">Public Frontend URL</Label>
              <Input
                id="frontendUrl"
                value={settings.publicFrontendUrl}
                onChange={(e) =>
                  setSettings({ ...settings, publicFrontendUrl: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500">Send RSVP and event emails</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500">Mobile push for hosts and guests</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(v) => setSettings({ ...settings, pushNotifications: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RSVP Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">RSVP Deadline (days before event)</Label>
              <Input
                id="deadline"
                type="number"
                value={settings.rsvpDeadlineDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rsvpDeadlineDays: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload">Max Upload Size (MB)</Label>
              <Input
                id="upload"
                type="number"
                value={settings.maxUploadMb}
                onChange={(e) =>
                  setSettings({ ...settings, maxUploadMb: Number(e.target.value) })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={settings.adminName}
                onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
