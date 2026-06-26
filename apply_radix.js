const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

if (!content.includes('@radix-ui/react-avatar')) {
  content = content.replace(
    "import * as Dialog from '@radix-ui/react-dialog'",
    "import * as Dialog from '@radix-ui/react-dialog'\nimport * as Avatar from '@radix-ui/react-avatar'\nimport * as DropdownMenu from '@radix-ui/react-dropdown-menu'\nimport { MoreVertical } from 'lucide-react'"
  );
}

// 1. Replace the Name cell with Avatar + Name
const oldNameCell = `<td className="px-4 py-3">
                    <Link href={\`/membros/\${member.id}\`} className="font-medium hover:text-primary transition-colors">
                      {member.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </td>`;
                  
const newNameCell = `<td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar.Root className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary border border-border shrink-0">
                        <Avatar.Image className="w-full h-full object-cover rounded-full" src={member.photoUrl} alt={member.name} />
                        <Avatar.Fallback className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground bg-secondary rounded-full uppercase" delayMs={100}>
                          {member.name.substring(0, 2)}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <div>
                        <Link href={\`/membros/\${member.id}\`} className="font-bold hover:text-primary transition-colors block">
                          {member.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      </div>
                    </div>
                  </td>`;

content = content.replace(oldNameCell, newNameCell);

// 2. Replace the Actions cell with DropdownMenu
const oldActionsCell = `<td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    {member.phone && (
                      <button onClick={() => openTemplateModal(member)} title="Enviar WhatsApp" className="w-8 h-8 rounded-full bg-whatsapp/10 text-whatsapp flex items-center justify-center hover:bg-whatsapp hover:text-whatsapp-foreground">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => openModal(member)} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {userRole === 'ADMIN' && (
                      <button onClick={() => handleDelete(member.id)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>`;

const newActionsCell = `<td className="px-4 py-3 text-right">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center ml-auto transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[180px] bg-background border border-border rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2" sideOffset={5} align="end">
                          
                          {member.phone && (
                            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg outline-none cursor-pointer hover:bg-whatsapp/10 hover:text-whatsapp transition-colors" onSelect={() => openTemplateModal(member)}>
                              <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                            </DropdownMenu.Item>
                          )}
                          
                          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg outline-none cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors" onSelect={() => openModal(member)}>
                            <Edit2 className="w-4 h-4" /> Editar Perfil
                          </DropdownMenu.Item>
                          
                          {userRole === 'ADMIN' && (
                            <>
                              <DropdownMenu.Separator className="h-px bg-border my-1 mx-2" />
                              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg outline-none cursor-pointer text-destructive hover:bg-destructive/10 transition-colors" onSelect={() => handleDelete(member.id)}>
                                <Trash2 className="w-4 h-4" /> Excluir Conta
                              </DropdownMenu.Item>
                            </>
                          )}
                          
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>`;

content = content.replace(oldActionsCell, newActionsCell);

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', content, 'utf8');
console.log('Avatar e Dropdown injetados com sucesso na tabela.');
