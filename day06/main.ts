#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'
import { _ } from '../helpers/lodash.ts'

type Track = {
  up: boolean
  right: boolean
  down: boolean
  left: boolean
}

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

let guardPos:any = null
const labMap1:string[][] = []
const labMapTrack2:Track[][] = []
let rowNum = 0
for await (const row of rowReader) {
  labMap1.push(row)
  labMapTrack2.push(row.map(_ => ({
    up: false,
    right: false,
    down: false,
    left: false
  })))

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
const originalGuardPos = { ...guardPos }

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


// Part 2 only
let thisTrack: Track = { up: false, right: false, down: false, left: false }
let obstaclesToAdd = 0

for (let r = 0; r <= maxRow; r++) {
  for (let c = 0; c <= maxCol; c++) {
    if (labMap1[r][c] === '#' || labMap1[r][c] === '^') {
      continue
    }

    // Make an ugly deep clone of the map
    const labMap2 = _.cloneDeep(labMap1)
    labMap2[r][c] = 'O'

    guardPos = { ...originalGuardPos }
    const moddedLabTrack2 = _.cloneDeep(labMapTrack2)

    while (guardPos.col >= 0 && guardPos.col <= maxCol && guardPos.row >= 0 && guardPos.row <= maxRow) {
      thisChar = labMap2[guardPos.row][guardPos.col]
      thisTrack = moddedLabTrack2[guardPos.row][guardPos.col]

      if (direction === 'up') {
        // Mark that we were here before we move
        labMap2[guardPos.row][guardPos.col] = 'X'

        // Loop detected!
        if (thisTrack.up) {
          obstaclesToAdd++
          break
        }
        thisTrack.up = true
        console.log(moddedLabTrack2[guardPos.row][guardPos.col])

        // Stepping out of bounds
        if (guardPos.row - 1 < 0) {
          break
        }

        nextChar = labMap2[guardPos.row - 1][guardPos.col]
        if (nextChar === '#' || nextChar === 'O') {
          // Change direction
          direction = 'right'
          continue
        }

        guardPos.row -= 1
      }

      else if (direction === 'right') {
        // Mark that we were here before we move
        labMap2[guardPos.row][guardPos.col] = 'X'

        // Loop detected!
        if (thisTrack.right) {
          obstaclesToAdd++
          break
        }
        thisTrack.right = true

        // Stepping out of bounds
        if (guardPos.col + 1 > maxCol) {
          break
        }

        nextChar = labMap2[guardPos.row][guardPos.col + 1]
        if (nextChar === '#' || nextChar === 'O') {
          // Change direction
          direction = 'down'
          continue
        }

        guardPos.col += 1
      }

      else if (direction === 'down') {
        // Mark that we were here before we move
        labMap2[guardPos.row][guardPos.col] = 'X'

        // Loop detected!
        if (thisTrack.down) {
          obstaclesToAdd++
          break
        }
        thisTrack.down = true

        // Stepping out of bounds
        if (guardPos.row + 1 > maxRow) {
          break
        }

        nextChar = labMap2[guardPos.row + 1][guardPos.col]
        if (nextChar === '#' || nextChar === 'O') {
          // Change direction
          direction = 'left'
          continue
        }

        guardPos.row += 1
      }

      else if (direction === 'left') {
        // Mark that we were here before we move
        labMap2[guardPos.row][guardPos.col] = 'X'

        // Loop detected!
        if (thisTrack.left) {
          obstaclesToAdd++
          break
        }
        thisTrack.left = true

        // Stepping out of bounds
        if (guardPos.col - 1 > maxCol) {
          break
        }

        nextChar = labMap2[guardPos.row][guardPos.col - 1]
        if (nextChar === '#' || nextChar === 'O') {
          // Change direction
          direction = 'up'
          continue
        }

        guardPos.col -= 1
      }
    }

    console.debug('Lab Map, Part 2:')
    console.debug(labMap2.reduce((acc, row) => acc + row.join('') + '\n', ''))
  }
}

answerPt2 = obstaclesToAdd

// console.debug('Lab Map, Part 1:')
// console.debug(labMap1.reduce((acc, row) => acc + row.join('') + '\n', ''))

// console.debug('Lab Map, Part 2:')
// console.debug(labMap2.reduce((acc, row) => acc + row.join('') + '\n', ''))

// console.debug('Guard position before leaving: ' + JSON.stringify(guardPos) + ' (' + direction + ')\n')

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
