import { describe, expect, it } from 'vitest'
import {
  canonicalKeypadTerminal,
  getKeypadModel,
  KEYPAD_4X4_MODEL,
  normalizeKeypadPushed,
} from './keypadModel'

describe('extracted keypad_4x4 contact model', () => {
  it('records module topology, terminal names, contact resistances, and idle default', () => {
    expect(KEYPAD_4X4_MODEL).toMatchObject({
      id: 'keypad_4x4',
      moduleSource: 'tinkercad-engine-complete-extracted/models/keypad_4x4--module-58745.js',
      rows: ['row1', 'row2', 'row3', 'row4'],
      columns: ['column1', 'column2', 'column3', 'column4'],
      internalNode: 'internal',
      defaultPushed: false,
      closedResistanceOhms: 1e-3,
      openResistanceOhms: 1e10,
      supportsMultipleKeys: false,
    })
    expect(getKeypadModel()?.contacts).toHaveLength(8)
    expect(getKeypadModel()?.contacts.every(contact => !contact.closed && contact.resistanceOhms === 1e10)).toBe(true)
    expect(getKeypadModel()?.pushed).toBeNull()
  })

  it('maps breadboard Row n and Column n labels to the extracted terminal aliases', () => {
    expect(canonicalKeypadTerminal('Row 1')).toBe('row1')
    expect(canonicalKeypadTerminal(' row 4 ')).toBe('row4')
    expect(canonicalKeypadTerminal('Column 2')).toBe('column2')
    expect(canonicalKeypadTerminal('COLUMN 4')).toBe('column4')
    expect(canonicalKeypadTerminal('Row 5')).toBeUndefined()
    expect(canonicalKeypadTerminal('Signal')).toBeUndefined()
  })

  it('normalizes extracted subelement codes and explicit single [row, column] pairs', () => {
    expect(normalizeKeypadPushed('13')).toEqual([1, 3])
    expect(normalizeKeypadPushed([2, 4])).toEqual([2, 4])
    expect(normalizeKeypadPushed(['3', '1'])).toEqual([3, 1])
    expect(normalizeKeypadPushed(false)).toBeNull()
    expect(normalizeKeypadPushed(null)).toBeNull()
    expect(normalizeKeypadPushed(undefined)).toBeNull()
  })

  it('closes exactly the selected row and column through the shared internal node', () => {
    const model = getKeypadModel('23')!
    expect(model.pushed).toEqual([2, 3])
    expect(model.contacts).toEqual([
      { terminal: 'row1', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
      { terminal: 'row2', internalNode: 'internal', resistanceOhms: 1e-3, closed: true },
      { terminal: 'row3', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
      { terminal: 'row4', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
      { terminal: 'column1', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
      { terminal: 'column2', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
      { terminal: 'column3', internalNode: 'internal', resistanceOhms: 1e-3, closed: true },
      { terminal: 'column4', internalNode: 'internal', resistanceOhms: 1e10, closed: false },
    ])
    expect(model.contacts.filter(contact => contact.closed).reduce((sum, contact) => sum + contact.resistanceOhms, 0))
      .toBe(2e-3)
  })

  it('rejects invalid keys and simultaneous keys because extracted pushed holds one subelement', () => {
    expect(normalizeKeypadPushed('55')).toBeUndefined()
    expect(normalizeKeypadPushed('1234')).toBeUndefined()
    expect(normalizeKeypadPushed([[1, 2], [3, 4]])).toBeUndefined()
    expect(getKeypadModel([[1, 2], [3, 4]])).toBeUndefined()
    expect(getKeypadModel(['12', '34'])).toBeUndefined()
  })
})
