// lib/checklist-validation.ts
import type { Checklist } from '@prisma/client'

export interface ChecklistValidationError {
  field: string
  message: string
}

export function validateChecklistForCompletion(
  checklist: Checklist | null
): ChecklistValidationError[] {
  const errors: ChecklistValidationError[] = []

  if (!checklist) {
    errors.push({ field: 'checklist', message: 'Checkliste wurde noch nicht ausgefüllt' })
    return errors // früh abbrechen, alle weiteren checks wären null-refs
  }

  if (!checklist.vinConfirmed || checklist.vinConfirmed.trim() === '') {
    errors.push({ field: 'vinConfirmed', message: 'VIN muss in der Checkliste eingetragen sein' })
  }

  if (!checklist.overallResult) {
    errors.push({ field: 'overallResult', message: 'Gesamturteil ist Pflicht' })
  }

  if (!checklist.brakeFrontStatus) {
    errors.push({ field: 'brakeFrontStatus', message: 'Bremsen vorne: Zustand muss bewertet werden' })
  }

  if (!checklist.brakeRearStatus) {
    errors.push({ field: 'brakeRearStatus', message: 'Bremsen hinten: Zustand muss bewertet werden' })
  }

  if (checklist.obdErrors === null || checklist.obdErrors === undefined) {
    errors.push({ field: 'obdErrors', message: 'OBD-Diagnose: Fehlerspeicher-Ergebnis ist Pflicht' })
  }

  if (checklist.engineLeaks === null || checklist.engineLeaks === undefined) {
    errors.push({ field: 'engineLeaks', message: 'Motorraum: Lecks-Bewertung ist Pflicht' })
  }

  return errors
}
