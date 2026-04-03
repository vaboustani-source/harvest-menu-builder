import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
  coupleId: string;
  coupleName: string;
};

type HistoryEntry = {
  id: string;
  step: string;
  previous_value: any;
  new_value: any;
  post_submission: boolean;
  changed_at: string;
};

export function CoupleHistoryViewer({ coupleId, coupleName }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['change-history', coupleId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('change_history')
        .select('*')
        .eq('couple_id', coupleId)
        .order('changed_at', { ascending: false })
        .limit(200);
      return (data ?? []) as HistoryEntry[];
    },
    enabled: expanded,
  });

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <History size={12} />
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Hide' : 'View'} History
      </button>

      {expanded && (
        <div className="mt-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <p className="font-sans text-xs text-muted-foreground animate-pulse py-2">Loading history…</p>
          ) : !history || history.length === 0 ? (
            <p className="font-sans text-xs text-muted-foreground py-2 italic">No changes recorded yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="border border-border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {entry.step}
                      </span>
                      {entry.post_submission && (
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 font-sans border-amber-400 text-amber-600">
                          Post-submission
                        </Badge>
                      )}
                    </div>
                    <span className="font-sans text-[10px] text-muted-foreground">
                      {new Date(entry.changed_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Previous</p>
                      <pre className="font-mono text-[10px] text-muted-foreground bg-secondary/50 rounded p-1.5 overflow-x-auto max-h-24 whitespace-pre-wrap">
                        {formatValue(entry.previous_value)}
                      </pre>
                    </div>
                    <div>
                      <p className="font-sans text-[9px] uppercase tracking-widest text-primary mb-0.5">New</p>
                      <pre className="font-mono text-[10px] text-foreground bg-secondary/50 rounded p-1.5 overflow-x-auto max-h-24 whitespace-pre-wrap">
                        {formatValue(entry.new_value)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}
