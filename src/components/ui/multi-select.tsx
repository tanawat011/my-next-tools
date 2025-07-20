'use client'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxDisplay?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
  disabled = false,
  maxDisplay = 2,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter(s => s !== item))
  }

  const handleSelect = (currentValue: string) => {
    if (selected.includes(currentValue)) {
      onChange(selected.filter(s => s !== currentValue))
    } else {
      onChange([...selected, currentValue])
    }
  }

  const selectedOptions = options.filter(option =>
    selected.includes(option.value)
  )

  const displayedOptions = selectedOptions.slice(0, maxDisplay)
  const remainingCount = selectedOptions.length - maxDisplay

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'min-w-[160px] justify-between text-left font-normal',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
            {selected.length === 0 && (
              <span className="text-muted-foreground truncate">
                {placeholder}
              </span>
            )}

            {/* Display selected badges */}
            {displayedOptions.map(option => (
              <Badge
                variant="secondary"
                key={option.value}
                className="flex h-5 shrink-0 items-center gap-1 px-2 py-0 text-xs"
                onClick={e => {
                  e.stopPropagation()
                  handleUnselect(option.value)
                }}
              >
                {option.icon && <option.icon className="h-3 w-3 shrink-0" />}
                <span className="max-w-[80px] truncate">{option.label}</span>
                <X className="hover:bg-muted h-3 w-3 shrink-0 rounded-sm" />
              </Badge>
            ))}

            {/* Show remaining count */}
            {remainingCount > 0 && (
              <Badge
                variant="outline"
                className="h-5 shrink-0 px-2 py-0 text-xs"
              >
                +{remainingCount}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.icon && (
                    <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                  )}
                  <span className="truncate">{option.label}</span>
                  {selected.includes(option.value) && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Selected
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {/* Selection summary and clear all */}
        {selected.length > 0 && (
          <div className="text-muted-foreground flex items-center justify-between border-t p-2 text-sm">
            <span>{selected.length} selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                onChange([])
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
