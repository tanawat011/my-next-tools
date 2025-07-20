'use client'

import {
  Mail,
  Shield,
  Loader2,
  AlertTriangle,
  Trash2,
  Edit,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useUsers, type User } from '@/hooks/use-users'

interface UserActionsDialogProps {
  user: User | null
  actionType: 'edit' | 'delete' | null
  onClose: () => void
}

export function UserActionsDialog({
  user,
  actionType,
  onClose,
}: UserActionsDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    role: 'user',
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateUser, deleteUser } = useUsers()

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        role: user.role || 'user',
        isActive: user.isActive,
      })
      setErrors({})
    }
  }, [user])

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const generateDisplayName = (firstName: string, lastName: string) => {
    return `${firstName.trim()} ${lastName.trim()}`.trim()
  }

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    const newFirstName = field === 'firstName' ? value : formData.firstName
    const newLastName = field === 'lastName' ? value : formData.lastName

    setFormData(prev => ({
      ...prev,
      [field]: value,
      displayName:
        generateDisplayName(newFirstName, newLastName) || prev.displayName,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleEdit = async () => {
    if (!user) return

    if (!validateEditForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      updateUser({
        userId: user.id,
        updates: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          role: formData.role,
          isActive: formData.isActive,
        },
      })
      onClose()
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Failed to update user')
      console.error('Update user error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      deleteUser(user.id)
      onClose()
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Delete user error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to manage users and system settings'
      case 'user':
        return 'Standard user access with basic permissions'
      default:
        return ''
    }
  }

  const getUserInitials = (
    firstName: string,
    lastName: string,
    email: string
  ) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  if (actionType === 'edit') {
    return (
      <Dialog open={!!user && actionType === 'edit'} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update the user&apos;s profile information and settings.
            </DialogDescription>
          </DialogHeader>

          {user && (
            <form className="space-y-6">
              {/* User Preview */}
              <div className="bg-muted/30 flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(
                      formData.firstName,
                      formData.lastName,
                      user.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {formData.displayName || 'No name'}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={getRoleColor(formData.role)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {formData.role === 'superadmin'
                        ? 'Super Admin'
                        : formData.role.charAt(0).toUpperCase() +
                          formData.role.slice(1)}
                    </Badge>
                    <Badge
                      variant={formData.isActive ? 'default' : 'secondary'}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-6">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input value={user.email} disabled className="bg-muted" />
                  <p className="text-muted-foreground text-xs">
                    Email cannot be changed
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={e =>
                        handleNameChange('firstName', e.target.value)
                      }
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-sm">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={e =>
                        handleNameChange('lastName', e.target.value)
                      }
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-sm">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={e =>
                      handleInputChange('displayName', e.target.value)
                    }
                    className={errors.displayName ? 'border-destructive' : ''}
                  />
                  {errors.displayName && (
                    <p className="text-destructive text-sm">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={value => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex flex-col">
                          <span>User</span>
                          <span className="text-muted-foreground text-xs">
                            Standard user access
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span>Admin</span>
                          <span className="text-muted-foreground text-xs">
                            Full system access
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Account Status
                  </Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {formData.isActive
                          ? 'User can sign in and access the system'
                          : 'User is blocked from signing in'}
                      </div>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={value =>
                        handleInputChange('isActive', value)
                      }
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  if (actionType === 'delete') {
    return (
      <AlertDialog
        open={!!user && actionType === 'delete'}
        onOpenChange={onClose}
      >
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-left">
                  Delete User Account
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left">
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {user && (
            <div className="my-4">
              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>
                      {getUserInitials(
                        user.firstName,
                        user.lastName,
                        user.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{user.displayName}</h4>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                    <Badge
                      className={`mt-1 ${getRoleColor(user.role)}`}
                      variant="secondary"
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground mt-4 space-y-2 text-sm">
                <p>• All user data will be permanently removed</p>
                <p>• The user will lose access to their account</p>
                <p>• This action affects all associated data</p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex gap-2 sm:gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return null
}
