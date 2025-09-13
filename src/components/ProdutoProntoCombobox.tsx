// src/components/ProdutoProntoCombobox.tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

// Interface para ficha técnica (produto pronto)
export interface Ficha {
  id: string
  nome: string
  codigo: string
  categoria: string | null
  custo_total_producao: number | null
}

interface ProdutoProntoComboboxProps {
  items: Ficha[]
  selectedLabel: string
  onSelect: (item: Ficha) => void
  placeholder?: string
  disabled?: boolean
}

export const ProdutoProntoCombobox = ({
  items,
  selectedLabel,
  onSelect,
  placeholder = "Buscar produto pronto...",
  disabled = false
}: ProdutoProntoComboboxProps) => {
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
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandEmpty>Produto não encontrado.</CommandEmpty>
          <CommandList className="max-h-64 overflow-auto">
            <CommandGroup>
              {items.map((item) => (
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
                      <span className="text-sm font-medium">{item.nome}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{item.codigo}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium text-green-600">
                          R$ {(item.custo_total_producao || 0).toFixed(2)}
                        </span>
                        {item.categoria && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-blue-600">{item.categoria}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ProdutoProntoCombobox