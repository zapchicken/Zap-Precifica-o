import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

// Interface genérica para itens do combobox
export interface CatalogInsumo {
  id: string | number
  nome?: string
  nome_comercial?: string
  codigo?: string
  codigo_insumo?: string
  preco_por_unidade?: number
  fator_correcao?: number
  unidade_medida?: string
  categoria?: string
  fornecedor: string | null;
}

export type InsumoForUI = {
  id: string;
  nome: string;                    // ← usado na UI
  codigo: string;                  // ← usado na UI
  fornecedor: string | null;       // ← usado na UI
  nome_comercial?: string;         // ← vem do banco
  codigo_insumo?: string;          // ← vem do banco
  fornecedor_id?: string;          // ← vem do banco
  categoria: string;
  unidade_medida: string;
  tipo_embalagem: string;
  preco_por_unidade: number;
  fator_correcao: number;
  created_at: string;
  updated_at: string;
};

interface InsumoComboboxProps {
  items: InsumoForUI[]
  selectedLabel: string
  onSelect: (item: InsumoForUI) => void
  placeholder?: string
  disabled?: boolean
}

export const InsumoCombobox = ({ 
  items, 
  selectedLabel, 
  onSelect, 
  placeholder = "Buscar insumo...",
  disabled = false
}: InsumoComboboxProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            className="h-9"
          />
          <CommandEmpty>Insumo não encontrado.</CommandEmpty>
          <CommandList className="max-h-64 overflow-auto">
            <CommandGroup>
              {items.map((item) => {
                const nome = item.nome || item.nome_comercial || 'Sem nome'
                const codigo = item.codigo || item.codigo_insumo || '---'
                const preco = item.preco_por_unidade !== undefined ? item.preco_por_unidade.toFixed(2) : null
                const unidade = item.unidade_medida || 'un'

                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      onSelect(item)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{nome}</span>
                        <span className="text-xs text-muted-foreground">{codigo}</span>
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Exportação padrão para compatibilidade
export default InsumoCombobox