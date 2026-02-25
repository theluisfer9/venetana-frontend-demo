import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'
import type { User, Role, Institution } from '@/lib/admin-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null // null = create mode
  roles: Role[]
  institutions: Institution[]
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
}

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  roles,
  institutions,
  onSubmit,
  isPending,
}: Props) {
  const isEdit = !!user

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (open && user) {
      setEmail(user.email)
      setUsername(user.username)
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setPhone(user.phone ?? '')
      setPassword('')
      setRoleId(user.role.id)
      setInstitutionId(user.institution?.id ?? '')
      setIsActive(user.is_active)
    } else if (open) {
      setEmail('')
      setUsername('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setPassword('')
      setRoleId('')
      setInstitutionId('')
      setIsActive(true)
    }
  }, [open, user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Record<string, unknown> = {
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role_id: roleId,
      institution_id: institutionId || null,
    }
    if (isEdit) {
      data.id = user!.id
      data.is_active = isActive
    } else {
      data.password = password
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email *</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label className="text-xs">Username *</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Nombre *</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Apellido *</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {!isEdit && (
              <div>
                <Label className="text-xs">Contraseña *</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={8}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Rol *</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Institución</Label>
              <Select
                value={institutionId}
                onValueChange={(v) => setInstitutionId(v === '__none__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Ninguna</SelectItem>
                  {institutions
                    .filter((i) => i.is_active)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-xs">Usuario activo</Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !roleId}>
              {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
