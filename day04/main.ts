#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { sortAscending } from '../helpers/array.ts'
import { _ } from '../helpers/lodash.ts'
import { getInputFileName } from '../helpers/args.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

const wordMap:string[][] = []
for await (const row of rowReader) {
  wordMap.push(row)
}

let xmasAppearances = 0
let masXAppearances = 0

for (let i = 0; i < wordMap.length; i++) {
  let row = wordMap[i]

  for (let j = 0; j < row.length; j++) {
    const char = row[j]

    // Only branch out when encountering an "X"
    if (char === 'X') {
      // Look for "XMAS" to the right
      if (
        ((j + 3) < row.length) &&
        (row[j + 1] === 'M' && row[j + 2] === 'A' && row[j + 3] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "SAMX" to the left
      if (
        ((j - 3) >= 0) &&
        (row[j - 1] === 'M' && row[j - 2] === 'A' && row[j - 3] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "XMAS" down
      if (
        ((i + 3) < wordMap.length) &&
        (wordMap[i + 1][j] === 'M' && wordMap[i + 2][j] === 'A' && wordMap[i + 3][j] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "SAMX" up
      if (
        ((i - 3) >= 0) &&
        (wordMap[i - 1][j] === 'M' && wordMap[i - 2][j] === 'A' && wordMap[i - 3][j] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "XMAS" down-right
      if (
        ((i + 3) < wordMap.length && (j + 3) < row.length) &&
        (wordMap[i + 1][j + 1] === 'M' && wordMap[i + 2][j + 2] === 'A' && wordMap[i + 3][j + 3] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "SAMX" up-right
      if (
        ((i - 3) >= 0 && (j + 3) < row.length) &&
        (wordMap[i - 1][j + 1] === 'M' && wordMap[i - 2][j + 2] === 'A' && wordMap[i - 3][j + 3] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "XMAS" down-left
      if (
        ((i + 3) < wordMap.length && (j - 3) >= 0) &&
        (wordMap[i + 1][j - 1] === 'M' && wordMap[i + 2][j - 2] === 'A' && wordMap[i + 3][j - 3] === 'S')
      ) {
        xmasAppearances += 1
      }

      // Look for "SAMX" up-left
      if (
        ((i - 3) >= 0 && (j - 3) >= 0) &&
        (wordMap[i - 1][j - 1] === 'M' && wordMap[i - 2][j - 2] === 'A' && wordMap[i - 3][j - 3] === 'S')
      ) {
        xmasAppearances += 1
      }
    }

    // Only branch out when encountering an "A"
    if (char === 'A') {
      // Quick bail outs for peripheral lines
      if (i === 0 || i === (wordMap.length - 1) || j === 0 || j === (row.length - 1)) {
        continue
      }

      // Look for "(MAS|SAM) x (MAS|SAM)"
      const upLeft = wordMap[i - 1][j - 1]
      const downRight = wordMap[i + 1][j + 1]
      const downLeft = wordMap[i + 1][j - 1]
      const upRight = wordMap[i - 1][j + 1]
      if (
        // Look for "MAS"/"SAM" down-right
        ((upLeft === 'M' && downRight === 'S') || (upLeft === 'S' && downRight === 'M')) &&
        // Look for "MAS"/"SAM" up-right
        ((downLeft === 'M' && upRight === 'S') || (downLeft === 'S' && upRight === 'M'))
      ) {
        masXAppearances += 1
      }
    }    
  }
}

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] "XMAS" appearances: ' + xmasAppearances)
console.log('[pt2] "X-MAS" appearances: ' + masXAppearances)
