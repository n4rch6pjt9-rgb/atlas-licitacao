export function MonoPanel({ value }: { value: unknown }) {
  if (value == null || value === "") return null;
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <pre className="max-h-80 overflow-auto rounded-md bg-bg p-3 font-mono text-xs leading-relaxed text-muted">
      {text}
    </pre>
  );
}
