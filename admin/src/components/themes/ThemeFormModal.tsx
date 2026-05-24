import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EventCategory, Theme } from '@/types/entities'

type ThemeFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme?: Theme | null
  categories: EventCategory[]
  onSubmit: (payload: {
    name: string
    slug?: string
    categoryId?: string
    colors: string[]
    mood?: string
    isActive: boolean
  }) => Promise<void>
}

export function ThemeFormModal({
  open,
  onOpenChange,
  theme,
  categories,
  onSubmit,
}: ThemeFormModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [bg, setBg] = useState('#faf5ff')
  const [primary, setPrimary] = useState('#9333ea')
  const [accent, setAccent] = useState('#ec4899')
  const [mood, setMood] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (theme) {
      setName(theme.name)
      setSlug(theme.slug ?? '')
      setCategoryId(theme.categoryId ?? '')
      setBg(theme.backgroundColor ?? theme.previewColors[0] ?? '#faf5ff')
      setPrimary(theme.primaryColor ?? theme.previewColors[1] ?? '#9333ea')
      setAccent(theme.secondaryColor ?? theme.previewColors[2] ?? '#ec4899')
      setMood(theme.mood ?? '')
      setIsActive(theme.isActive)
    } else {
      setName('')
      setSlug('')
      setCategoryId(categories[0]?.id ?? '')
      setBg('#faf5ff')
      setPrimary('#9333ea')
      setAccent('#ec4899')
      setMood('')
      setIsActive(true)
    }
  }, [theme, open, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        slug: slug || undefined,
        categoryId: categoryId || undefined,
        colors: [bg, primary, accent],
        mood: mood || undefined,
        isActive,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{theme ? 'Edit Theme' : 'Add Theme'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex h-20 overflow-hidden rounded-xl">
            <div className="flex-1" style={{ backgroundColor: bg }} />
            <div className="flex-1" style={{ backgroundColor: primary }} />
            <div className="flex-1" style={{ backgroundColor: accent }} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Name</Label>
              <Input id="theme-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-slug">Slug</Label>
              <Input id="theme-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Background</Label>
              <Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Primary</Label>
              <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Accent</Label>
              <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-mood">Mood</Label>
            <Input id="theme-mood" value={mood} onChange={(e) => setMood(e.target.value)} placeholder="playful, elegant..." />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Active</p>
              <p className="text-xs text-gray-500">Available for event creation</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : theme ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
