'use client'

import { Save, RotateCcw, Download, Upload, Info } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'

import { AboutDialog } from '@/components/shared/about-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  useGlobalSettingsStore,
  initializeUserFromSession,
} from '@/store/global-settings-store'

export const GlobalSettingsView = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [showAboutModal, setShowAboutModal] = useState(false)
  const { toast } = useToast()
  const { data: session, status } = useSession()

  const settings = useGlobalSettingsStore()

  // Initialize user from NextAuth session
  React.useEffect(() => {
    if (status === 'authenticated') {
      initializeUserFromSession(session)
    } else if (status === 'unauthenticated') {
      settings.setCurrentUser(null)
    }
    // Don't do anything while status is 'loading'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status])

  const handleSaveSettings = async () => {
    try {
      await settings.saveToFirebase()
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully to Firebase.',
      })
    } catch (error: unknown) {
      console.error('Failed to save settings to Firebase:', error)
      toast({
        title: 'Settings Saved Locally',
        description:
          'Settings saved locally. Firebase sync will retry automatically.',
      })
    }
  }

  const handleResetSettings = async () => {
    try {
      await settings.resetToDefaults()
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to default values.',
      })
    } catch (error: unknown) {
      console.error('Failed to reset settings:', error)
      toast({
        title: 'Reset Complete',
        description:
          'Settings reset locally. Firebase sync will retry automatically.',
      })
    }
  }

  const handleExportSettings = () => {
    const settingsJson = settings.exportSettings()
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'app-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Settings Exported',
      description: 'Settings have been exported successfully.',
    })
  }

  const handleImportSettings = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async e => {
        const content = e.target?.result as string
        const success = await settings.importSettings(content)

        if (success) {
          toast({
            title: 'Settings Imported',
            description: 'Settings have been imported successfully.',
          })
        } else {
          toast({
            title: 'Import Failed',
            description:
              'Failed to import settings. Please check the file format.',
            variant: 'destructive',
          })
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ''
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application configuration and preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Firebase Sync Status */}
            {settings.currentUser && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                {settings.isLoading ? (
                  <span className="text-blue-600">Syncing...</span>
                ) : settings.isSynced ? (
                  <span className="text-green-600">✓ Synced with Firebase</span>
                ) : (
                  <span className="text-amber-600">⚠ Local changes</span>
                )}
              </div>
            )}

            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
              id="import-settings"
            />
            <Button variant="outline" asChild>
              <label htmlFor="import-settings" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </label>
            </Button>

            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
                <CardDescription>
                  Configure your application&apos;s basic information and
                  metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={settings.appName}
                      onChange={e =>
                        settings.updateAppSettings({ appName: e.target.value })
                      }
                      placeholder="My Next Tools"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appVersion">Version</Label>
                    <Input
                      id="appVersion"
                      value={settings.appVersion}
                      onChange={e =>
                        settings.updateAppSettings({
                          appVersion: e.target.value,
                        })
                      }
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appTitle">Application Title</Label>
                  <Input
                    id="appTitle"
                    value={settings.appTitle}
                    onChange={e =>
                      settings.updateAppSettings({ appTitle: e.target.value })
                    }
                    placeholder="My Next Tools - Professional Dashboard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appDescription">Description</Label>
                  <Input
                    id="appDescription"
                    value={settings.appDescription}
                    onChange={e =>
                      settings.updateAppSettings({
                        appDescription: e.target.value,
                      })
                    }
                    placeholder="A modern Next.js application..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="appAuthor">Author</Label>
                    <Input
                      id="appAuthor"
                      value={settings.appAuthor}
                      onChange={e =>
                        settings.updateAppSettings({
                          appAuthor: e.target.value,
                        })
                      }
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appUrl">Website URL</Label>
                    <Input
                      id="appUrl"
                      value={settings.appUrl}
                      onChange={e =>
                        settings.updateAppSettings({ appUrl: e.target.value })
                      }
                      placeholder="https://your-app.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appKeywords">
                    Keywords (comma-separated)
                  </Label>
                  <Input
                    id="appKeywords"
                    value={settings.appKeywords.join(', ')}
                    onChange={e =>
                      settings.updateAppSettings({
                        appKeywords: e.target.value
                          .split(',')
                          .map(k => k.trim())
                          .filter(k => k),
                      })
                    }
                    placeholder="nextjs, dashboard, tools, typescript"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Configure contact and support information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={e =>
                        settings.updateAppSettings({
                          contactEmail: e.target.value,
                        })
                      }
                      placeholder="support@your-app.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportUrl">Support URL</Label>
                    <Input
                      id="supportUrl"
                      value={settings.supportUrl}
                      onChange={e =>
                        settings.updateAppSettings({
                          supportUrl: e.target.value,
                        })
                      }
                      placeholder="https://your-app.com/support"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                    <Input
                      id="privacyUrl"
                      value={settings.privacyPolicyUrl}
                      onChange={e =>
                        settings.updateAppSettings({
                          privacyPolicyUrl: e.target.value,
                        })
                      }
                      placeholder="https://your-app.com/privacy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termsUrl">Terms of Service URL</Label>
                    <Input
                      id="termsUrl"
                      value={settings.termsOfServiceUrl}
                      onChange={e =>
                        settings.updateAppSettings({
                          termsOfServiceUrl: e.target.value,
                        })
                      }
                      placeholder="https://your-app.com/terms"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Providers</CardTitle>
                <CardDescription>
                  Configure which authentication methods are available to users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="google-auth">Google Authentication</Label>
                    <p className="text-muted-foreground text-sm">
                      Allow users to sign in with their Google account
                    </p>
                  </div>
                  <Switch
                    id="google-auth"
                    checked={settings.allowGoogleAuth}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({ allowGoogleAuth: checked })
                    }
                  />
                </div>

                {settings.allowGoogleAuth && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="restrict-google-users">
                          Restrict Google to Existing Users Only
                        </Label>
                        <p className="text-muted-foreground text-sm">
                          Only allow Google sign-in for users that already exist
                          in your database
                        </p>
                      </div>
                      <Switch
                        id="restrict-google-users"
                        checked={settings.restrictGoogleToExistingUsers}
                        onCheckedChange={checked =>
                          settings.updateAppSettings({
                            restrictGoogleToExistingUsers: checked,
                          })
                        }
                      />
                    </div>

                    {settings.restrictGoogleToExistingUsers && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          When enabled, Google users must already exist in your
                          database to sign in. New Google users will be blocked
                          from automatic account creation.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-registration">
                      New User Registration
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Allow new users to create accounts
                    </p>
                  </div>
                  <Switch
                    id="new-registration"
                    checked={settings.allowNewUserRegistration}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({
                        allowNewUserRegistration: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-verification">
                      Email Verification
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <Switch
                    id="email-verification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="guest-mode">Guest Mode</Label>
                    <p className="text-muted-foreground text-sm">
                      Allow users to access the app without authentication
                    </p>
                  </div>
                  <Switch
                    id="guest-mode"
                    checked={settings.allowGuestMode}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({ allowGuestMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Features</CardTitle>
                <CardDescription>
                  Enable or disable various application features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode Support</Label>
                    <p className="text-muted-foreground text-sm">
                      Enable dark/light theme switching
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.enableDarkMode}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({ enableDarkMode: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multi-language">
                      Multi-language Support
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Enable multiple language options
                    </p>
                  </div>
                  <Switch
                    id="multi-language"
                    checked={settings.enableMultiLanguage}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({
                        enableMultiLanguage: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-muted-foreground text-sm">
                      Enable in-app notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({
                        enableNotifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Analytics Tracking</Label>
                    <p className="text-muted-foreground text-sm">
                      Enable usage analytics and tracking
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.enableAnalytics}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({ enableAnalytics: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure advanced security and session management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={e =>
                        settings.updateAppSettings({
                          sessionTimeout: parseInt(e.target.value) || 60,
                        })
                      }
                      min="5"
                      max="1440"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">
                      Max Login Attempts
                    </Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={e =>
                        settings.updateAppSettings({
                          maxLoginAttempts: parseInt(e.target.value) || 5,
                        })
                      }
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Configure maintenance mode settings for planned downtime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">
                      Enable Maintenance Mode
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Restrict access to the application during maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.enableMaintenanceMode}
                    onCheckedChange={checked =>
                      settings.updateAppSettings({
                        enableMaintenanceMode: checked,
                      })
                    }
                  />
                </div>

                {settings.enableMaintenanceMode && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">
                        Maintenance Message
                      </Label>
                      <Input
                        id="maintenance-message"
                        value={settings.maintenanceMessage}
                        onChange={e =>
                          settings.updateAppSettings({
                            maintenanceMessage: e.target.value,
                          })
                        }
                        placeholder="We are currently performing maintenance..."
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Maintenance mode will prevent normal users from
                        accessing the application. Admin users will still be
                        able to access the system.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Information</CardTitle>
                <CardDescription>
                  Configure the information displayed in the About dialog.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about-title">About Title</Label>
                  <Input
                    id="about-title"
                    value={settings.aboutTitle}
                    onChange={e =>
                      settings.updateAppSettings({ aboutTitle: e.target.value })
                    }
                    placeholder="About My Next Tools"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about-description">About Description</Label>
                  <Input
                    id="about-description"
                    value={settings.aboutDescription}
                    onChange={e =>
                      settings.updateAppSettings({
                        aboutDescription: e.target.value,
                      })
                    }
                    placeholder="Description of your application..."
                  />
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAboutModal(true)}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Preview About Dialog
                  </Button>

                  <AboutDialog
                    open={showAboutModal}
                    onOpenChange={setShowAboutModal}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
