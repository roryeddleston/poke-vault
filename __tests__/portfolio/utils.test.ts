import { filterHoldings, hasAnyValue } from '@/app/portfolio/utils'
import type { Holding, PortfolioSummary } from '@/app/portfolio/types'

function makeHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: '1',
    cardId: 'base1-4',
    cardName: 'Charizard',
    setName: 'Base Set',
    grade: 'RAW',
    finish: 'NORMAL',
    edition: 'UNLIMITED',
    purchasePrice: 100,
    quantity: 1,
    snapshots: [],
    ...overrides,
  }
}

describe('filterHoldings', () => {
  it('matches search against cardName, setName, or cardId', () => {
    const byName = makeHolding({ id: 'by-name', cardName: 'Pikachu' })
    const bySet = makeHolding({ id: 'by-set', setName: 'Pikachu Collection' })
    const byId = makeHolding({ id: 'by-id', cardId: 'pikachu-58' })
    const noMatch = makeHolding({ id: 'no-match' })

    const result = filterHoldings([byName, bySet, byId, noMatch], 'pikachu', [])

    expect(result.map((h) => h.id).sort()).toEqual(['by-id', 'by-name', 'by-set'])
  })

  it('quickPreset "graded" excludes RAW and empty grades', () => {
    const holdings = [
      makeHolding({ id: 'a', grade: 'RAW' }),
      makeHolding({ id: 'b', grade: '' }),
      makeHolding({ id: 'c', grade: 'PSA 10' }),
    ]
    expect(filterHoldings(holdings, '', [], 'graded').map((h) => h.id)).toEqual(['c'])
  })

  it('quickPreset "raw" includes only RAW grades', () => {
    const holdings = [
      makeHolding({ id: 'a', grade: 'RAW' }),
      makeHolding({ id: 'b', grade: 'PSA 10' }),
    ]
    expect(filterHoldings(holdings, '', [], 'raw').map((h) => h.id)).toEqual(['a'])
  })

  it('applies grade and set filters together (AND semantics)', () => {
    const matches = makeHolding({ id: 'match', grade: 'PSA 10', setName: 'Base Set' })
    const wrongGrade = makeHolding({ id: 'wrong-grade', grade: 'PSA 9', setName: 'Base Set' })
    const wrongSet = makeHolding({ id: 'wrong-set', grade: 'PSA 10', setName: 'Jungle' })

    const result = filterHoldings([matches, wrongGrade, wrongSet], '', [
      { key: 'grade', value: 'PSA 10' },
      { key: 'set', value: 'Base Set' },
    ])

    expect(result.map((h) => h.id)).toEqual(['match'])
  })

  it('quickPreset "recent" sorts by createdAt descending', () => {
    const holdings = [
      makeHolding({ id: 'old', createdAt: '2024-01-01T00:00:00.000Z' }),
      makeHolding({ id: 'new', createdAt: '2024-06-01T00:00:00.000Z' }),
    ]
    expect(filterHoldings(holdings, '', [], 'recent').map((h) => h.id)).toEqual([
      'new',
      'old',
    ])
  })
})

describe('hasAnyValue', () => {
  const empty: PortfolioSummary = {
    totalInvested: 0,
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
  }

  it('returns false when summary is all zero', () => {
    expect(hasAnyValue(empty)).toBe(false)
  })

  it.each([
    ['totalInvested', 10],
    ['totalValue', 10],
    ['totalProfit', -10],
    ['profitPercentage', -5],
  ] as const)('returns true when %s is non-zero (%d)', (field, value) => {
    expect(hasAnyValue({ ...empty, [field]: value })).toBe(true)
  })
})
