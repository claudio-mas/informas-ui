import * as React from "react"
import { BellIcon, InboxIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/registry/informas/blocks/app-shell/app-shell"
import { Alert, AlertDescription, AlertTitle } from "@/registry/informas/ui/alert"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/registry/informas/ui/alert-dialog"
import { Badge } from "@/registry/informas/ui/badge"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/registry/informas/ui/breadcrumb"
import { Button } from "@/registry/informas/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/informas/ui/card"
import { Checkbox } from "@/registry/informas/ui/checkbox"
import { DataTable, type DataTableColumns } from "@/registry/informas/ui/data-table"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/registry/informas/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/registry/informas/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/informas/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/registry/informas/ui/field"
import { Input } from "@/registry/informas/ui/input"
import { Label } from "@/registry/informas/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/informas/ui/native-select"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/registry/informas/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/informas/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/registry/informas/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/informas/ui/select"
import { Separator } from "@/registry/informas/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/informas/ui/sheet"
import {
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/registry/informas/ui/sidebar"
import { Skeleton } from "@/registry/informas/ui/skeleton"
import { Toaster } from "@/registry/informas/ui/sonner"
import { Switch } from "@/registry/informas/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/informas/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/informas/ui/tabs"
import { Textarea } from "@/registry/informas/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/informas/ui/tooltip"

import { CHAVE_DO_TEMA } from "./chave"
import { FATURAS, type Fatura } from "./dados"

const SECOES = [
  ["acoes", "Ações e selos"],
  ["avisos", "Avisos"],
  ["formularios", "Formulários"],
  ["conteudo", "Conteúdo"],
  ["sobreposicoes", "Sobreposições"],
  ["dados", "Dados e navegação"],
] as const

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" })
const SELO = { paga: "success", pendente: "warning", vencida: "destructive" } as const

const colunas: DataTableColumns<Fatura> = [
  { accessorKey: "id", header: "Fatura" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "cidade", header: "Cidade" },
  { accessorKey: "vencimento", header: "Vencimento", sortFn: "datetime", cell: ({ getValue }) => data.format(new Date(String(getValue()))) },
  {
    accessorKey: "valor", header: "Valor", sortFn: "numeric",
    cell: ({ getValue }) => <span className="tabular-nums">{moeda.format(Number(getValue()))}</span>,
  },
  {
    accessorKey: "situacao", header: "Situação", enableSorting: false,
    cell: ({ row }) => <Badge variant={SELO[row.original.situacao]}>{row.original.situacao}</Badge>,
  },
]

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-20 space-y-4">
      <h2 id={`${id}-titulo`} className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  )
}

export function App() {
  const [aceite, setAceite] = React.useState(false)
  return (
    <TooltipProvider>
      <AppShell
        themeStorageKey={CHAVE_DO_TEMA}
        brand={
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">i</span>
            <span className="font-semibold">informas-ui</span>
          </div>
        }
        navigation={
          <SidebarGroup>
            <SidebarGroupLabel>Componentes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SECOES.map(([id, titulo], i) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild isActive={i === 0}>
                      <a href={`#${id}`} aria-current={i === 0 ? "page" : undefined}>{titulo}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }
        header={<h1 className="truncate text-sm font-medium">Catálogo de componentes</h1>}
      >
        <div className="mx-auto max-w-5xl space-y-12 pb-16">
          <Secao id="acoes" titulo="Ações e selos">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Salvar</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="outline">Contorno</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive"><Trash2Icon /> Excluir</Button>
              <Button disabled>Desabilitado</Button>
              <Button size="sm">Pequeno</Button>
              <Button size="lg">Grande</Button>
              <Button size="icon" aria-label="Adicionar"><PlusIcon /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Padrão</Badge>
              <Badge variant="secondary">Secundário</Badge>
              <Badge variant="outline">Contorno</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="success">Pago</Badge>
              <Badge variant="warning">Pendente</Badge>
              <Badge variant="destructive">Vencido</Badge>
            </div>
          </Secao>

          <Secao id="avisos" titulo="Avisos">
            <div className="grid gap-3 md:grid-cols-2">
              <Alert role={undefined}><BellIcon /><AlertTitle>Padrão</AlertTitle><AlertDescription>Informação neutra, sem urgência.</AlertDescription></Alert>
              <Alert variant="info" role={undefined}><AlertTitle>Info</AlertTitle><AlertDescription>O fechamento de agosto foi importado.</AlertDescription></Alert>
              <Alert variant="success" role={undefined}><AlertTitle>Sucesso</AlertTitle><AlertDescription>Versão 3 salva; 12 períodos reapurados.</AlertDescription></Alert>
              <Alert variant="warning" role={undefined}><AlertTitle>Atenção</AlertTitle><AlertDescription>Sem razão: o custo de materiais vem do valor informado.</AlertDescription></Alert>
              <Alert variant="destructive" role={undefined} className="md:col-span-2"><AlertTitle>Não foi possível salvar</AlertTitle><AlertDescription><p>O nível PP está declarado ausente e tem conta classificada.</p></AlertDescription></Alert>
            </div>
          </Secao>

          <Secao id="formularios" titulo="Formulários">
            <form className="grid gap-6 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome da empresa</FieldLabel>
                  <Input id="nome" placeholder="Ex.: Alimentos Boa Safra" />
                  <FieldDescription>Aparece no topo de todas as telas.</FieldDescription>
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input id="email" type="email" defaultValue="gestor@" aria-invalid aria-describedby="email-erro" />
                  <FieldError id="email-erro">Informe um e-mail completo.</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="obs">Observações</FieldLabel>
                  <Textarea id="obs" placeholder="Opcional" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="erp">Sistema de origem (nativo)</FieldLabel>
                  <NativeSelect id="erp" defaultValue="omie">
                    <NativeSelectOption value="protheus">Totvs Protheus</NativeSelectOption>
                    <NativeSelectOption value="omie">Omie</NativeSelectOption>
                    <NativeSelectOption value="bling">Bling</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="plano">Plano</FieldLabel>
                  <Select defaultValue="pro">
                    <SelectTrigger id="plano" className="w-full"><SelectValue placeholder="Escolha" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gratis">Grátis</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <FieldSet>
                  <FieldLegend variant="label">Níveis que a empresa movimenta</FieldLegend>
                  <RadioGroup defaultValue="tres">
                    <div className="flex items-center gap-2"><RadioGroupItem value="dois" id="dois" /><Label htmlFor="dois">MP e PA</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="tres" id="tres" /><Label htmlFor="tres">MP, PP e PA</Label></div>
                  </RadioGroup>
                </FieldSet>
                <div className="flex items-center gap-2">
                  <Checkbox id="aceite" checked={aceite} onCheckedChange={(v) => setAceite(v === true)} />
                  <Label htmlFor="aceite">Li e aceito os termos</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="avisos-email" defaultChecked />
                  <Label htmlFor="avisos-email">Receber avisos por e-mail</Label>
                </div>
              </FieldGroup>
            </form>
          </Secao>

          <Secao id="conteudo" titulo="Conteúdo">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Prazo médio de estoque</CardTitle>
                  <CardDescription>Agosto de 2026</CardDescription>
                  <CardAction><Badge variant="success">apurado</Badge></CardAction>
                </CardHeader>
                <CardContent><p className="text-3xl font-semibold tabular-nums">42,7 dias</p></CardContent>
                <CardFooter className="text-sm text-muted-foreground">MP 18,2 · PP 6,1 · PA 18,4</CardFooter>
              </Card>
              <Card>
                <CardHeader><CardTitle>Carregando</CardTitle><CardDescription>Skeleton</CardDescription></CardHeader>
                <CardContent className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /></CardContent>
              </Card>
            </div>
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
                <EmptyTitle>Nenhum período ainda</EmptyTitle>
                <EmptyDescription>Importe o primeiro balancete para ver a série.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button>Importar balancete</Button></EmptyContent>
            </Empty>
            <Tabs defaultValue="resumo">
              <TabsList>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="detalhe">Detalhe</TabsTrigger>
              </TabsList>
              <TabsContent value="resumo" className="text-sm">Conteúdo da aba Resumo.</TabsContent>
              <TabsContent value="detalhe" className="text-sm">Conteúdo da aba Detalhe.</TabsContent>
            </Tabs>
          </Secao>

          <Secao id="sobreposicoes" titulo="Sobreposições">
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild><Button variant="outline">Abrir diálogo</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar empresa</DialogTitle>
                    <DialogDescription>As mudanças valem para todos os usuários.</DialogDescription>
                  </DialogHeader>
                  <Field><FieldLabel htmlFor="nome-dialogo">Nome</FieldLabel><Input id="nome-dialogo" defaultValue="Alimentos Boa Safra" /></Field>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive">Excluir empresa</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir a empresa?</AlertDialogTitle>
                    <AlertDialogDescription>Todos os períodos e mapeamentos serão apagados. Não dá para desfazer.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Sheet>
                <SheetTrigger asChild><Button variant="outline">Abrir painel</Button></SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Refine a lista de faturas.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Mais ações"><MoreHorizontalIcon /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Fatura F-1001</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem>Baixar PDF</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">Cancelar fatura</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline">Ver detalhes</Button></PopoverTrigger>
                <PopoverContent><p className="text-sm">Fechamento em 31/08, importado de Omie.</p></PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost">Dica</Button></TooltipTrigger>
                <TooltipContent>Dias de consumo cobertos pelo estoque.</TooltipContent>
              </Tooltip>
              <Button variant="secondary" onClick={() => toast.success("Mapeamento salvo", { description: "Versão 3 · 12 períodos reapurados" })}>Mostrar notificação</Button>
            </div>
          </Secao>

          <Secao id="dados" titulo="Dados e navegação">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#dados">Empresas</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#dados">Alimentos Boa Safra</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Faturas</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <DataTable columns={colunas} data={FATURAS} caption="Faturas da empresa" searchPlaceholder="Buscar faturas" pageSize={8} />
            <Separator />
            <Table>
              <TableHeader><TableRow><TableHead>Nível</TableHead><TableHead className="text-right">PME (dias)</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>MP</TableCell><TableCell className="text-right tabular-nums">18,2</TableCell></TableRow>
                <TableRow><TableCell>PA</TableCell><TableCell className="text-right tabular-nums">18,4</TableCell></TableRow>
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#dados" /></PaginationItem>
                <PaginationItem><PaginationLink href="#dados">1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#dados" isActive>2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationNext href="#dados" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </Secao>
        </div>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  )
}
