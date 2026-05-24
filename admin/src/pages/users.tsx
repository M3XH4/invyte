import { useCallback, useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Users } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { UserRoleBadge, UserStatusBadge } from '@/components/shared/status-badges'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { User } from '@/types/entities'
import { formatDate } from '@/lib/utils'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers({ search, role: roleFilter })
      setUsers(data)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [loadUsers])

  const filtered = useMemo(() => users, [users])

  return (
    <div>
      <PageHeader title="User Management" description="Manage platform users and roles" />

      <Card>
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, username..."
            filterValue={roleFilter}
            onFilterChange={setRoleFilter}
            filterOptions={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'host', label: 'Host' },
              { value: 'guest', label: 'Guest' },
            ]}
          />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Adjust your search or filters." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hosted</TableHead>
                    <TableHead>RSVPs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell>@{user.username}</TableCell>
                      <TableCell>
                        <UserRoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>{user.totalHostedEvents}</TableCell>
                      <TableCell>{user.guestRsvpCount}</TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(user.joinedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
