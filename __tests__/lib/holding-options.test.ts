import {
  coerceHoldingEdition,
  coerceHoldingFinish,
  DEFAULT_HOLDING_EDITION,
  DEFAULT_HOLDING_FINISH,
  isHoldingEdition,
  isHoldingFinish,
} from '@/lib/holding-options'

describe('isHoldingFinish', () => {
  it.each(['NORMAL', 'HOLO', 'REVERSE'])('returns true for %s', (v) => {
    expect(isHoldingFinish(v)).toBe(true)
  })

  it.each([undefined, null, '', 'normal', 'FOIL', 42])(
    'returns false for %s',
    (v) => {
      expect(isHoldingFinish(v)).toBe(false)
    },
  )
})

describe('isHoldingEdition', () => {
  it.each(['UNLIMITED', 'FIRST_EDITION'])('returns true for %s', (v) => {
    expect(isHoldingEdition(v)).toBe(true)
  })

  it.each([undefined, null, '', 'unlimited', 'first_edition', 1])(
    'returns false for %s',
    (v) => {
      expect(isHoldingEdition(v)).toBe(false)
    },
  )
})

describe('coerceHoldingFinish', () => {
  it.each(['NORMAL', 'HOLO', 'REVERSE'] as const)(
    'passes through valid finish %s',
    (v) => {
      expect(coerceHoldingFinish(v)).toBe(v)
    },
  )

  it.each([undefined, null, 'garbage', 42])(
    'falls back to default for %s',
    (v) => {
      expect(coerceHoldingFinish(v)).toBe(DEFAULT_HOLDING_FINISH)
    },
  )
})

describe('coerceHoldingEdition', () => {
  it.each(['UNLIMITED', 'FIRST_EDITION'] as const)(
    'passes through valid edition %s',
    (v) => {
      expect(coerceHoldingEdition(v)).toBe(v)
    },
  )

  it.each([undefined, null, 'garbage', 42])(
    'falls back to default for %s',
    (v) => {
      expect(coerceHoldingEdition(v)).toBe(DEFAULT_HOLDING_EDITION)
    },
  )
})
