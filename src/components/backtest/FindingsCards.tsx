import { useState } from 'react'
import { Section } from './Section'

interface Props {
  findings: string[]
  suggestions: string[]
}

type CardType = 'info' | 'success' | 'warning'

function classifyFinding(text: string): CardType {
  const lower = text.toLowerCase()
  if (lower.includes('best') || lower.includes('high') || lower.includes('improve')) return 'success'
  if (lower.includes('worst') || lower.includes('low') || lower.includes('significantly lower') || lower.includes('effect')) return 'warning'
  return 'info'
}

const CARD_STYLES: Record<CardType, string> = {
  info: 'border-blue-800/50 bg-blue-950/30 text-blue-200',
  success: 'border-green-800/50 bg-green-950/30 text-green-200',
  warning: 'border-yellow-800/50 bg-yellow-950/30 text-yellow-200',
}

const CARD_ICONS: Record<CardType, string> = {
  info: 'i',
  success: '+',
  warning: '!',
}

export function FindingsCards({ findings, suggestions }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const toggle = (idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="space-y-6">
      {/* Findings */}
      <Section title="Key Findings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {findings.map((f, i) => {
            const type = classifyFinding(f)
            return (
              <div key={i} className={`border rounded-xl p-4 ${CARD_STYLES[type]}`}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">
                    {CARD_ICONS[type]}
                  </span>
                  <p className="text-sm leading-relaxed">{f}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Suggestions as action items */}
      <Section title="Action Items">
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <label
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked[i] ?? false}
                onChange={() => toggle(i)}
                className="mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className={`text-sm ${checked[i] ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                {s}
              </span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}
