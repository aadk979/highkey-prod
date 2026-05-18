export function JsonViewer({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="italic text-ink-muted">null</span>;
  }

  return (
    <details className="text-xs">
      <summary className="cursor-pointer select-none text-primary hover:opacity-80">
        View JSON
      </summary>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded border border-hairline bg-surface-1 p-3 font-mono text-xs text-ink">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}
