import { Section } from './Section'

export function FindingsSection({ findings, suggestions }: { findings: string[]; suggestions: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Section title="Findings">
        <ul className="space-y-2">
          {findings.map((f, i) => (
            <li key={i} className="text-sm bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 text-blue-200">
              {f}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Suggestions">
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="text-sm bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3 text-yellow-200">
              {s}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
