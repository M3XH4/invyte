import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesApi } from '@/api/categoriesApi'
import { CategoryFormModal } from '@/components/categories/CategoryFormModal'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryImageSrc } from '@/constants/category-assets'
import type { EventCategory } from '@/types/entities'

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EventCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', search, activeFilter],
    queryFn: () =>
      categoriesApi.list({
        search,
        active: activeFilter === 'all' ? undefined : activeFilter,
      }),
  })

  const filtered = useMemo(() => categories, [categories])

  const saveMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof categoriesApi.create>[0]) => {
      if (editing) {
        return categoriesApi.update(editing.id, payload)
      }
      return categoriesApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(editing ? 'Category updated' : 'Category created')
      setEditing(null)
    },
    onError: () => toast.error('Failed to save category'),
  })

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete category'),
  })

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage event categories for Invyte"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search categories..."
            filterValue={activeFilter}
            onFilterChange={setActiveFilter}
            filterOptions={[
              { value: 'all', label: 'All' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Tags className="mb-4 h-12 w-12 text-purple-300" />
            <p className="font-bold text-gray-900 dark:text-white">No categories found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => {
            const img = categoryImageSrc(cat.image)
            return (
              <Card
                key={cat.id}
                className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-purple-500/10"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}66)`,
                      }}
                    >
                      {img ? (
                        <img src={img} alt="" className="h-12 w-12 object-contain" />
                      ) : (
                        <span className="text-2xl">📅</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(cat)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => setDeleteId(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                    {!cat.isActive && <Badge variant="archived">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">/{cat.slug}</p>
                  {cat.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">{cat.description}</p>
                  )}
                  <p className="mt-3 text-sm font-semibold text-purple-600 dark:text-purple-300">
                    {cat.eventCount} events
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSubmit={async (payload) => {
          await saveMutation.mutateAsync(payload)
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete category?"
        description="Events using this category may be affected."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
