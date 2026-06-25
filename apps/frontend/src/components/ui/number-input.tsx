'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Input } from './input';

/** Texto (com vírgula ou ponto) → número, ou null se vazio/incompleto. */
function parse(s: string): number | null {
  const c = s.replace(',', '.').trim();
  if (c === '' || c === '.' || c === '-' || c === '-.') return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

function display(value: number | null | undefined): string {
  return value == null ? '' : String(value);
}

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
}

/**
 * Input numérico tolerante: permite o campo ficar vazio (sem "0" preso),
 * aceita vírgula ou ponto como separador decimal e preserva o texto enquanto
 * se escreve. Normaliza a apresentação ao perder o foco.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onValueChange, inputMode, ...rest }, ref) {
    const [raw, setRaw] = useState(() => display(value));
    const focused = useRef(false);

    // Sincroniza com alterações externas (ex: selecionar alimento, conversão de
    // unidades) só fora de foco, para não interromper a escrita do utilizador.
    useEffect(() => {
      if (!focused.current && parse(raw) !== value) {
        setRaw(display(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <Input
        ref={ref}
        {...rest}
        type="text"
        inputMode={inputMode ?? 'decimal'}
        value={raw}
        onFocus={(e) => {
          focused.current = true;
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          focused.current = false;
          setRaw(display(value));
          rest.onBlur?.(e);
        }}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9.,-]/g, '');
          setRaw(next);
          onValueChange(parse(next));
        }}
      />
    );
  },
);
