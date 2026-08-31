'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import type { Quiz as QuizType } from '@/lib/content/types'
import { useProgressStore } from '@/store/progress-store'

export function Quiz({ quiz, lessonId }: { quiz: QuizType; lessonId: string }) {
  const [answers, setAnswers] = React.useState<Record<string, number | boolean>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const completeLesson = useProgressStore((s) => s.completeLesson)

  const total = quiz.questions.length
  const correct = React.useMemo(() => {
    return quiz.questions.reduce((acc, q) => {
      const a = answers[q.id]
      if (a === undefined) return acc
      if (q.type === 'true-false') return acc + (a === q.answer ? 1 : 0)
      return acc + (a === q.correctIndex ? 1 : 0)
    }, 0)
  }, [answers, quiz.questions])

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined)

  const submit = () => {
    setSubmitted(true)
    if (correct === total) {
      completeLesson(lessonId, `Lección completada`)
    }
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-primary" />
          <CardTitle className="text-base">
            {quiz.title ?? 'Comprueba lo aprendido'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {quiz.questions.map((q, qi) => {
          const selected = answers[q.id]
          const isCorrect =
            q.type === 'true-false'
              ? selected === q.answer
              : selected === q.correctIndex
          return (
            <div key={q.id} className="space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 font-mono-tight text-xs text-primary">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                <p className="text-sm font-medium text-foreground">{q.question}</p>
              </div>
              {q.type === 'true-false' ? (
                <RadioGroup
                  value={selected === undefined ? '' : String(selected)}
                  onValueChange={(v) =>
                    setAnswers((p) => ({ ...p, [q.id]: v === 'true' }))
                  }
                  className="grid grid-cols-2 gap-2 pl-6"
                  disabled={submitted}
                >
                  {['true', 'false'].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`${q.id}-${v}`} />
                      <Label htmlFor={`${q.id}-${v}`} className="text-sm capitalize">
                        {v === 'true' ? 'Verdadero' : 'Falso'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={selected === undefined ? '' : String(selected)}
                  onValueChange={(v) =>
                    setAnswers((p) => ({ ...p, [q.id]: parseInt(v, 10) }))
                  }
                  className="space-y-1.5 pl-6"
                  disabled={submitted}
                >
                  {q.options?.map((opt, i) => {
                    const optCorrect = q.correctIndex === i
                    const optSelected = selected === i
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
                          submitted && optCorrect
                            ? 'border-[oklch(0.65_0.12_160_/_0.5)] bg-[oklch(0.28_0.05_160_/_0.15)]'
                            : submitted && optSelected && !optCorrect
                              ? 'border-[oklch(0.65_0.2_25_/_0.5)] bg-[oklch(0.3_0.06_25_/_0.15)]'
                              : 'border-border/50 hover:bg-muted/30',
                        )}
                      >
                        <RadioGroupItem value={String(i)} id={`${q.id}-${i}`} />
                        <Label htmlFor={`${q.id}-${i}`} className="flex-1 cursor-pointer text-sm">
                          {opt}
                        </Label>
                        {submitted && optCorrect && (
                          <CheckCircle2 className="size-4 text-[oklch(0.78_0.13_160)]" />
                        )}
                        {submitted && optSelected && !optCorrect && (
                          <XCircle className="size-4 text-[oklch(0.72_0.18_25)]" />
                        )}
                      </div>
                    )
                  })}
                </RadioGroup>
              )}
              {submitted && (
                <p
                  className={cn(
                    'pl-6 text-xs',
                    isCorrect ? 'text-[oklch(0.78_0.13_160)]' : 'text-[oklch(0.72_0.18_25)]',
                  )}
                >
                  {isCorrect ? 'Correcto. ' : 'Incorrecto. '}
                  <span className="text-muted-foreground">{q.explanation}</span>
                </p>
              )}
            </div>
          )
        })}

        {submitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Puntuación</span>
              <span className={cn('font-mono-tight font-semibold', correct === total ? 'text-[oklch(0.78_0.13_160)]' : 'text-foreground')}>
                {correct} / {total}
              </span>
            </div>
            <Progress value={(correct / total) * 100} className="h-2" />
            {correct === total && (
              <p className="text-xs text-[oklch(0.78_0.13_160)]">
                ¡Lección completada y registrada en tu progreso! +25 pts
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!submitted ? (
            <Button onClick={submit} disabled={!allAnswered} size="sm">
              Comprobar respuestas
            </Button>
          ) : (
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="mr-1.5 size-3.5" />
              Reintentar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
