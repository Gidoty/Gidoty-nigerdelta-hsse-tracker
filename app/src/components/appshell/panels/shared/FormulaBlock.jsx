export default function FormulaBlock({ lines, citation }) {
  return (
    <div>
      {citation && <p className="mb-1 text-[11px] text-muted">Formula ({citation}):</p>}
      <pre className="overflow-x-auto rounded-lg border-l-2 border-teal bg-bg p-3 font-mono text-xs leading-normal text-teal">
        {lines.join('\n')}
      </pre>
    </div>
  )
}
