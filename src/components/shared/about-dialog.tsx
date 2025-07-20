'use client'

import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useGlobalSettingsStore } from '@/store/global-settings-store'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const settings = useGlobalSettingsStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {settings.aboutTitle}
            <Badge variant="secondary">{settings.appVersion}</Badge>
          </DialogTitle>
          <DialogDescription className="text-left">
            {settings.aboutDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Author:</span>
              <p className="text-muted-foreground">{settings.appAuthor}</p>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <p className="text-muted-foreground">{settings.appVersion}</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={settings.appUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Website
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={settings.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Support
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${settings.contactEmail}`}>
                <ExternalLink className="mr-2 h-3 w-3" />
                Contact
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
