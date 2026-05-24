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
import { CATEGORY_ASSET_OPTIONS, categoryImageSrc } from '@/constants/category-assets'
import type { EventCategory } from '@/types/entities'

type CategoryFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: EventCategory | null
  onSubmit: (payload: {
    name: string
    slug: string
    image: string
    icon: string
    color: string
    description: string
    isActive: boolean
  }) => Promise<void>
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState<string>(CATEGORY_ASSET_OPTIONS[0].path)
  const [icon, setIcon] = useState('cake')
  const [color, setColor] = useState('#a855f7')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSlug(category.slug)
      setImage(category.image ?? CATEGORY_ASSET_OPTIONS[0].path)
      setIcon(category.icon ?? 'cake')
      setColor(category.color)
      setDescription(category.description ?? '')
      setIsActive(category.isActive)
    } else {
      setName('')
      setSlug('')
      setImage(CATEGORY_ASSET_OPTIONS[0].path)
      setIcon('cake')
      setColor('#a855f7')
      setDescription('')
      setIsActive(true)
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ name, slug, image, icon, color, description, isActive })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const preview = categoryImageSrc(image)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            {preview ? (
              <img src={preview} alt="" className="h-16 w-16 object-contain" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📅
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{name || 'Category name'}</p>
              <p className="text-sm text-gray-500">/{slug || 'slug'}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category image</Label>
            <Select value={image} onValueChange={setImage}>
              <SelectTrigger>
                <SelectValue placeholder="Select image" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ASSET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.path} value={opt.path}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon key</Label>
              <Input id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-color">Color</Label>
              <Input id="cat-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Active</p>
              <p className="text-xs text-gray-500">Show in mobile category picker</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
