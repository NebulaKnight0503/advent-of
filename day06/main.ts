#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'
import { _ } from '../helpers/lodash.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

let guardPos:any = null
const labMap1:string[][] = []
let rowNum = 0
for await (const row of rowReader) {
  labMap1.push(row)

  // Take note of the guard's starting position
  if (guardPos === null) {
    const col = row.indexOf('^')
    if (col > -1) {
      guardPos = { row: rowNum, col }
    }

    // Only bother to increment if we're still seeking the guard position
    rowNum++
  }
}

let answerPt1 = 0
let answerPt2 = 0

const maxRow = labMap1.length - 1
const maxCol = labMap1[0].length - 1
let direction = 'up'

// // Mark the starting position!!!
// labMap1[guardPos.row][guardPos.col] = 'X'
// labMap2[guardPos.row][guardPos.col] = '↑'

// // If immediately running into an obstacle, change the mark starting position
// if (labMap2[guardPos.row - 1][guardPos.col] === '#') {
//   labMap2[guardPos.row][guardPos.col] = '↱'
// }

// ⇑ ⇒ ⇓ ⇐
// ↱ → ↴
// ↑   ↓
// ⬑ ← ↵ 


let thisChar = ''
let nextChar = ''

// Part 1 only
while (guardPos.col >= 0 && guardPos.col <= maxCol && guardPos.row >= 0 && guardPos.row <= maxRow) {
  thisChar = labMap1[guardPos.row][guardPos.col]

  if (direction === 'up') {
    // Mark that we were here before we move
    labMap1[guardPos.row][guardPos.col] = 'X'

    // Stepping out of bounds
    if (guardPos.row - 1 < 0) {
      break
    }

    nextChar = labMap1[guardPos.row - 1][guardPos.col]
    if (nextChar === '#') {
      // Change direction
      direction = 'right'
      continue
    }
    guardPos.row -= 1
  }

  else if (direction === 'right') {
    // Mark that we were here before we move
    labMap1[guardPos.row][guardPos.col] = 'X'

    // Stepping out of bounds
    if (guardPos.col + 1 > maxCol) {
      break
    }

    nextChar = labMap1[guardPos.row][guardPos.col + 1]
    if (nextChar === '#') {
      // Change direction
      direction = 'down'
      continue
    }
    guardPos.col += 1
  }

  else if (direction === 'down') {
    // Mark that we were here before we move
    labMap1[guardPos.row][guardPos.col] = 'X'

    // Stepping out of bounds
    if (guardPos.row + 1 > maxRow) {
      break
    }

    nextChar = labMap1[guardPos.row + 1][guardPos.col]
    if (nextChar === '#') {
      // Change direction
      direction = 'left'
      continue
    }
    guardPos.row += 1
  }

  else if (direction === 'left') {
    // Mark that we were here before we move
    labMap1[guardPos.row][guardPos.col] = 'X'

    // Stepping out of bounds
    if (guardPos.col - 1 > maxCol) {
      break
    }

    nextChar = labMap1[guardPos.row][guardPos.col - 1]
    if (nextChar === '#') {
      // Change direction
      direction = 'up'
      continue
    }
    guardPos.col -= 1
  }
}

answerPt1 = labMap1.reduce(
  (sum, row) => {
    return sum + row.filter((c) => c === 'X').length
  },
  0
)


// console.debug('Lab Map, Part 1:')
// console.debug(labMap1.reduce((acc, row) => acc + row.join('') + '\n', ''))

console.debug('Guard position before leaving: ' + JSON.stringify(guardPos) + ' (' + direction + ')\n')

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
