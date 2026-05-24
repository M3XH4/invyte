import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesApi } from '@/api/categoriesApi'
import { themesApi } from '@/api/themesApi'
import { ThemeFormModal } from '@/components/themes/ThemeFormModal'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Theme } from '@/types/entities'

export function ThemesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Theme | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes', search, categoryFilter],
    queryFn: () =>
      themesApi.list({
        search,
        category_id: categoryFilter === 'all' ? undefined : categoryFilter,
      }),
  })

  const categoryOptions = useMemo(
    () => [{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories],
  )

  const saveMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof themesApi.create>[0]) => {
      if (editing) return themesApi.update(editing.id, payload)
      return themesApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
      toast.success(editing ? 'Theme updated' : 'Theme created')
      setEditing(null)
    },
    onError: () => toast.error('Failed to save theme'),
  })

  const deleteMutation = useMutation({
    mutationFn: themesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
      toast.success('Theme deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete theme'),
  })

  return (
    <div>
      <PageHeader
        title="Themes"
        description="Manage invitation themes and color palettes"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Theme
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search themes..."
            filterValue={categoryFilter}
            onFilterChange={setCategoryFilter}
            filterOptions={categoryOptions}
            filterLabel="Category"
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">No themes found</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden">
              <div className="flex h-24">
                {theme.previewColors.map((color, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{theme.name}</h3>
                    <p className="text-sm text-gray-500">{theme.category}</p>
                    {theme.mood && (
                      <p className="mt-1 text-xs capitalize text-purple-600 dark:text-purple-300">
                        {theme.mood}
                      </p>
                    )}
                  </div>
                  <Badge variant={theme.isActive ? 'active' : 'archived'}>
                    {theme.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">{theme.usageCount} events using this theme</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(theme)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => setDeleteId(theme.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ThemeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        theme={editing}
        categories={categories}
        onSubmit={async (payload) => {
          await saveMutation.mutateAsync(payload)
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete theme?"
        description="This theme will be removed from the catalog."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
