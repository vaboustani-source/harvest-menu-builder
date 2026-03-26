import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  suffix?: string;
};

/** Strips non-numeric chars (keeps digits and dots) from a stored price like "$38pp" → "38" */
export function stripPrice(stored: string): string {
  if (!stored) return '';
  return stored.replace(/[^0-9.,]/g, '');
}

/** Formats a raw number string to "$38pp" */
export function formatPrice(raw: string, suffix = 'pp'): string {
  const cleaned = raw.replace(/[^0-9.,]/g, '');
  if (!cleaned) return '';
  return `$${cleaned}${suffix}`;
}

export function PriceInput({ value, onChange, placeholder = '38', className, suffix = 'pp' }: Props) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <span className="absolute left-3 text-muted-foreground font-sans text-sm pointer-events-none select-none">$</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        className="pl-7 pr-10"
        inputMode="decimal"
      />
      <span className="absolute right-3 text-muted-foreground font-sans text-sm pointer-events-none select-none">{suffix}</span>
    </div>
  );
}
