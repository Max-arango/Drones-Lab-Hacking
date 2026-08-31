'use client'

import * as React from 'react'
import { Flag, CheckCircle2, XCircle, Lightbulb, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProgressStore } from '@/store/progress-store'
import { useToast } from '@/hooks/use-toast'
import type { FlagChallengeSection } from '@/lib/content/types'

export function FlagChallenge({ section }: { section: FlagChallengeSection }) {
  const [value, setValue] = React.useState('')
  const [result, setResult] = React.useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = React.useState(false)
  const submitFlag = useProgressStore((s) => s.submitFlag)
  const flags = useProgressStore((s) => s.flags)
  const already = !!flags[section.labId]
  const { toast } = useToast()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = submitFlag(
      section.labId,
      value,
      section.expectedFlag,
      section.title,
    )
    if (ok) {
      setResult('correct')
      toast({
        title: 'Flag capturada',
        description: `${section.title} — +150 pts`,
      })
    } else {
      setResult('wrong')
      toast({
        title: 'Flag incorrecta',
        description: 'Revisa el formato y vuelve a intentarlo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Flag className="size-4 text-primary" />
          <CardTitle className="text-base font-mono-tight">
            {section.title}
          </CardTitle>
          {section.points && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-mono-tight text-xs text-primary">
              +{section.points} pts
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/80">{section.prompt}</p>

        {already && result !== 'wrong' ? (
          <div className="flex items-center gap-2 rounded-lg border border-[oklch(0.65_0.12_160_/_0.4)] bg-[oklch(0.28_0.05_160_/_0.15)] p-3">
            <CheckCircle2 className="size-5 text-[oklch(0.78_0.13_160)]" />
            <div>
              <div className="text-sm font-medium text-[oklch(0.78_0.13_160)]">
                Flag capturada
              </div>
              <div className="font-mono-tight text-xs text-muted-foreground">
                {section.expectedFlag}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex gap-2">
            <div className="relative flex-1">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setResult('idle')
                }}
                placeholder="DRLAB{...}"
                className={cn(
                  'pl-9 font-mono-tight',
                  result === 'wrong' && 'border-[oklch(0.65_0.2_25_/_0.6)]',
                  result === 'correct' && 'border-[oklch(0.65_0.12_160_/_0.6)]',
                )}
                disabled={already}
              />
            </div>
            <Button type="submit" disabled={already || !value.trim()} size="default">
              Enviar
            </Button>
          </form>
        )}

        {result === 'wrong' && (
          <div className="flex items-center gap-2 text-sm text-[oklch(0.72_0.18_25)]">
            <XCircle className="size-4" />
            Flag incorrecta. Revisa el formato.
          </div>
        )}

        {section.hint && !already && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowHint((v) => !v)}
            >
              <Lightbulb className="mr-1.5 size-3.5" />
              {showHint ? 'Ocultar pista' : 'Mostrar pista'}
            </Button>
            {showHint && (
              <p className="mt-1.5 rounded-md border border-border/40 bg-muted/20 p-2.5 text-xs text-muted-foreground">
                {section.hint}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
