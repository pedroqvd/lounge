const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

if (!content.includes('UserIcon')) {
  content = content.replace(
    "import { Plus, Search, MessageCircle, Filter, ChevronDown, Edit2, Trash2, Database, Send, UploadCloud } from 'lucide-react'",
    "import { Plus, Search, MessageCircle, Filter, ChevronDown, Edit2, Trash2, Database, Send, UploadCloud, User as UserIcon, Phone, Activity, Users } from 'lucide-react'"
  );
}

const oldModal = `<Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {editingMember ? 'Editar Membro' : 'Novo Membro'}
            </Dialog.Title>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone (Whatsapp)</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="61 9..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="VISITANTE">Visitante</option>
                    <option value="ATIVO">Membro Ativo</option>
                    <option value="INATIVO">Inativo (Desgarrado)</option>
                    <option value="DISCIPULADO">Discipulado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável</label>
                  <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Sem responsável</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors">Cancelar</button>
                </Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>`;

const newModal = `<Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
            <Dialog.Title className="text-2xl font-extrabold tracking-tight">
              {editingMember ? 'Editar Perfil do Membro' : 'Novo Membro'}
            </Dialog.Title>
            <form onSubmit={handleSave} className="space-y-5 mt-4">
              
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-foreground">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-10 pr-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ex: João da Silva" />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-foreground">Telefone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-10 pr-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="61 9..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-foreground">Status no Sistema</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                      <option value="VISITANTE">Visitante</option>
                      <option value="ATIVO">Membro Ativo</option>
                      <option value="INATIVO">Inativo (Desgarrado)</option>
                      <option value="DISCIPULADO">Discipulado</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-foreground">Responsável / Célula</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                      <option value="">Sem responsável</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <Dialog.Close asChild>
                  <button type="button" className="px-6 py-2.5 border-2 rounded-xl hover:bg-secondary font-bold transition-all">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>`;

content = content.replace(oldModal, newModal);
content = content.replace('Respons\ufffdvel', 'Responsável');

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', content, 'utf8');
console.log('Modal premium aplicado com sucesso!');
