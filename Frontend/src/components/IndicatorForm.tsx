import { useEffect, useMemo, useState } from 'react'
import type { IndicatorPayload, IndicatorRow } from '../services/indicatorService'

type IndicatorFormProps = {
  editing: IndicatorRow | null
  onCancelEdit: () => void
  onSubmit: (payload: IndicatorPayload, id?: number) => Promise<void>
}

type FormErrors = Partial<Record<keyof IndicatorPayload, string>>

const INITIAL_FORM: IndicatorPayload = {
  indicatorType: '',
  indicatorValue: '',
  confidence: null,
  severity: 'MEDIUM',
  status: 'ACTIVE',
  sourceName: '',
  sourceReference: '',
  description: '',
}

export function IndicatorForm({
  editing,
  onCancelEdit,
  onSubmit,
}: IndicatorFormProps) {
  const [form, setForm] = useState<IndicatorPayload>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!editing) {
      setForm(INITIAL_FORM)
      setErrors({})
      return
    }

    setForm({
      indicatorType: editing.indicatorType ?? '',
      indicatorValue: editing.indicatorValue ?? '',
      confidence: editing.confidence,
      severity: editing.severity ?? 'MEDIUM',
      status: editing.status ?? 'ACTIVE',
      sourceName: editing.sourceName ?? '',
      sourceReference: editing.sourceReference ?? '',
      description: editing.description ?? '',
    })
    setErrors({})
  }, [editing])

  const title = useMemo(
    () => (editing ? `Edit indicator #${editing.id}` : 'Create indicator'),
    [editing],
  )

  const validate = (payload: IndicatorPayload): FormErrors => {
    const next: FormErrors = {}
    if (!payload.indicatorType.trim()) next.indicatorType = 'Type is required'
    if (!payload.indicatorValue.trim()) next.indicatorValue = 'Value is required'
    if (!payload.severity.trim()) next.severity = 'Severity is required'
    if (!payload.status.trim()) next.status = 'Status is required'
    if (payload.confidence != null && (payload.confidence < 0 || payload.confidence > 100)) {
      next.confidence = 'Confidence must be between 0 and 100'
    }
    if (payload.sourceName.length > 256) next.sourceName = 'Source name is too long'
    if (payload.sourceReference.length > 512) {
      next.sourceReference = 'Source reference is too long'
    }
    return next
  }

  const setField = <K extends keyof IndicatorPayload>(
    key: K,
    value: IndicatorPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedPayload: IndicatorPayload = {
      ...form,
      indicatorType: form.indicatorType.trim(),
      indicatorValue: form.indicatorValue.trim(),
      severity: form.severity.trim(),
      status: form.status.trim(),
      sourceName: form.sourceName.trim(),
      sourceReference: form.sourceReference.trim(),
      description: form.description.trim(),
    }
    const nextErrors = validate(trimmedPayload)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      setSubmitting(true)
      await onSubmit(trimmedPayload, editing?.id)
      if (!editing) setForm(INITIAL_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="mb-4 text-lg font-medium text-slate-100">{title}</h2>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Type *</span>
          <input
            value={form.indicatorType}
            onChange={(e) => setField('indicatorType', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
          {errors.indicatorType ? (
            <p className="text-xs text-red-300">{errors.indicatorType}</p>
          ) : null}
        </label>

        <label className="space-y-1 text-sm">
          <span>Value *</span>
          <input
            value={form.indicatorValue}
            onChange={(e) => setField('indicatorValue', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
          {errors.indicatorValue ? (
            <p className="text-xs text-red-300">{errors.indicatorValue}</p>
          ) : null}
        </label>

        <label className="space-y-1 text-sm">
          <span>Confidence (0-100)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={form.confidence ?? ''}
            onChange={(e) =>
              setField('confidence', e.target.value === '' ? null : Number(e.target.value))
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
          {errors.confidence ? (
            <p className="text-xs text-red-300">{errors.confidence}</p>
          ) : null}
        </label>

        <label className="space-y-1 text-sm">
          <span>Severity *</span>
          <select
            value={form.severity}
            onChange={(e) => setField('severity', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>Status *</span>
          <select
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>Source Name</span>
          <input
            value={form.sourceName}
            onChange={(e) => setField('sourceName', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
          {errors.sourceName ? (
            <p className="text-xs text-red-300">{errors.sourceName}</p>
          ) : null}
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span>Source Reference</span>
          <input
            value={form.sourceReference}
            onChange={(e) => setField('sourceReference', e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
          {errors.sourceReference ? (
            <p className="text-xs text-red-300">{errors.sourceReference}</p>
          ) : null}
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={3}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded border border-violet-700 bg-violet-800/70 px-4 py-2 text-sm hover:bg-violet-700 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
