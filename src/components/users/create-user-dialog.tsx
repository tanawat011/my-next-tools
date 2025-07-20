'use client'

import { User, Mail, Eye, EyeOff, Shield, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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
import { useUsers } from '@/hooks/use-users'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createUser } = useUsers()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateDisplayName = (firstName: string, lastName: string) => {
    return `${firstName.trim()} ${lastName.trim()}`.trim()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      // Auto-generate display name when first name or last name changes
      if (field === 'firstName' || field === 'lastName') {
        updated.displayName = generateDisplayName(
          field === 'firstName' ? value : prev.firstName,
          field === 'lastName' ? value : prev.lastName
        )
      }

      return updated
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      createUser({
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        photoURL: '',
      })

      // Reset form
      resetForm()
      onOpenChange(false)
      toast.success('User created successfully! They can now sign in.')
    } catch (error) {
      toast.error('Failed to create user. Please try again.')
      console.error('Create user error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      displayName: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-primary h-5 w-5" />
            </div>
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a new user to the system. They will be able to sign in
            immediately with the provided credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Preview */}
          <div className="bg-muted/30 flex items-center gap-4 rounded-lg border p-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {formData.firstName.charAt(0)}
                {formData.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">
                {formData.displayName || 'New User'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {formData.email || 'email@example.com'}
              </p>
              <Badge className={`mt-2 ${getRoleColor(formData.role)}`}>
                <Shield className="mr-1 h-3 w-3" />
                {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm">{errors.lastName}</p>
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
                onChange={e => handleInputChange('displayName', e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Auto-generated from first and last name. You can customize it.
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={value => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
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

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    className={
                      errors.password ? 'border-destructive pr-10' : 'pr-10'
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className={
                      errors.confirmPassword
                        ? 'border-destructive pr-10'
                        : 'pr-10'
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
