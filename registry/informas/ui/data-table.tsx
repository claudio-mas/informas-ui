"use client"

import * as React from "react"
import {
  columnFilteringFeature,
  constructFilterFn,
  constructSortFn,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/registry/informas/ui/button"
import { Input } from "@/registry/informas/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/informas/ui/table"

/**
 * Compara como número. Use `sortFn: "numeric"` em colunas que podem ser negativas:
 * o "alphanumeric" trata o "-" como texto e agrupa os negativos fora de ordem.
 */
const sortFn_numeric = constructSortFn({
  sort: (a, b) => {
    const na = Number(a)
    const nb = Number(b)
    if (Number.isNaN(na)) return Number.isNaN(nb) ? 0 : 1 // não numérico vai para o fim
    if (Number.isNaN(nb)) return -1
    return na < nb ? -1 : na > nb ? 1 : 0
  },
})

const semAcento = (value: unknown) =>
  String(value ?? "")
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

/** Busca que ignora maiúsculas e acentos: "sao paulo" encontra "São Paulo". */
const filterFn_includesTextoSemAcento = constructFilterFn({
  ...filterFn_includesString,
  resolveFilterValue: semAcento,
  resolveDataValue: semAcento,
})

// A v9 não embute as funções de ordenação e filtro: quem não está registrado aqui cai em
// "basic" (com aviso só em dev). Valores vindos como string ("9,00") precisam do alphanumeric.
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    numeric: sortFn_numeric,
    text: sortFn_text,
  },
  filterFns: { includesString: filterFn_includesTextoSemAcento },
})

export type DataTableFeatures = typeof features

/** Colunas de uma `DataTable`. */
export type DataTableColumns<TData extends RowData> = ColumnDef<DataTableFeatures, TData>[]

type DataTableProps<TData extends RowData> = {
  columns: DataTableColumns<TData>
  data: TData[]
  /** Legenda da tabela para leitores de tela. Recomendado. */
  caption?: string
  /** Mostra um campo de busca em todas as colunas. */
  searchPlaceholder?: string
  /** Conteúdo quando não há linhas (sem dados ou sem resultado na busca). */
  empty?: React.ReactNode
  pageSize?: number
  className?: string
}

function sortLabel(direction: false | "asc" | "desc") {
  return direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"
}

function DataTable<TData extends RowData>({
  columns,
  data,
  caption,
  searchPlaceholder,
  empty = "Nenhum resultado.",
  pageSize = 10,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const searchId = React.useId()

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-4", className)}>
      {searchPlaceholder ? (
        <div className="relative max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={searchId}
            type="search"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value)
              table.setPageIndex(0)
            }}
            className="pl-8"
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border">
        <Table>
          {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const direction = header.column.getIsSorted()
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <TableHead key={header.id} aria-sort={sortable ? sortLabel(direction) : undefined}>
                      {sortable && !header.isPlaceholder ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {content}
                          {/* shrink-0: em coluna estreita o flex comprimiria o ícone a zero. */}
                          {direction === "asc" ? (
                            <ArrowUpIcon aria-hidden="true" className="shrink-0" />
                          ) : direction === "desc" ? (
                            <ArrowDownIcon aria-hidden="true" className="shrink-0" />
                          ) : (
                            <ChevronsUpDownIcon aria-hidden="true" className="shrink-0 text-muted-foreground" />
                          )}
                        </Button>
                      ) : (
                        content
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {/* getVisibleCells pertence ao columnVisibilityFeature, que esta tabela não registra. */}
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span aria-live="polite">
            Página {table.state.pagination.pageIndex + 1} de {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon aria-hidden="true" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Próxima página"
            >
              Próxima
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { DataTable }
