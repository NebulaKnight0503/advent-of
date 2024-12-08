#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'
import { printGrid } from '../helpers/print.ts'

let answerPt1 = 0
let answerPt2 = 0

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

type Point = {
  row: number
  col: number
}

const antennaMap:string[][] = []
const antennaDict:Record<string, Point[]> = {}
const antinodeMap1:string[][] = []
const antinodeDict1:Record<string, boolean> = {}
const antinodeMap2:string[][] = []
const antinodeDict2:Record<string, boolean> = {}

let rowNum = 0
for await (const row of rowReader) {
  for (let col = 0; col < row.length; col++) {
    const freq = row[col]
    if (freq !== '.') {
      if (!antennaDict[freq]) {
        antennaDict[freq] = []
      }
      antennaDict[freq].push({ row: rowNum, col })
    }
  }
  antennaMap.push(row)
  antinodeMap1.push(Array(row.length).fill('.'))
  antinodeMap2.push(Array(row.length).fill('.'))

  rowNum++
}

const maxRow = antennaMap.length - 1
const maxCol = antennaMap[0].length - 1

for (const [freq, points] of Object.entries(antennaDict)) {
  // If there's only one antenna of this frequency, then it doesn't have any antinodes
  if (points.length === 1) {
    continue
  }

  for (let i = 0; i < points.length; i++) {
    const thisPoint = points[i]
    const otherPoints = points.filter((_, j) => j !== i)
    for (const otherPoint of otherPoints) {
      let isFirstAntinode = true
      let keepGoing = true

      // Start from the current point
      let antinodeRow = thisPoint.row
      let antinodeCol = thisPoint.col

      // In part 2, the antenna itself is guaranteed to have an antinode on it
      antinodeDict2[`${antinodeRow},${antinodeCol}`] = true

      const rowDiff = otherPoint.row - thisPoint.row
      const colDiff = otherPoint.col - thisPoint.col

      while (keepGoing) {
        antinodeRow = antinodeRow - rowDiff
        antinodeCol = antinodeCol - colDiff

        console.debug(`Checking for anticode at ${antinodeRow},${antinodeCol}...`)

        if (antinodeRow >= 0 && antinodeRow <= maxRow && antinodeCol >= 0 && antinodeCol <= maxCol) {
          console.debug(`...found antinode at ${antinodeRow},${antinodeCol}`)
          if (isFirstAntinode) {
            antinodeMap1[antinodeRow][antinodeCol] = '#'
            antinodeDict1[`${antinodeRow},${antinodeCol}`] = true
            isFirstAntinode = false
          }

          // Resonant harmonics (part 2)
          antinodeMap2[antinodeRow][antinodeCol] = '#'
          antinodeDict2[`${antinodeRow},${antinodeCol}`] = true
        } else {
          console.debug(`Proposed antinode at ${antinodeRow},${antinodeCol} was out of bounds`)
          keepGoing = false
        }
        //keepGoing = false
      }
    }
  }
}

answerPt1 = Object.keys(antinodeDict1).length
answerPt2 = Object.keys(antinodeDict2).length

// DEBUGGING
// console.debug(`Antenna map:\n${printGrid(antennaMap)}\n`)
// console.debug(`Antinode map 1:\n${printGrid(antinodeMap1)}\n`)
// console.debug(`Antinode map 2:\n${printGrid(antinodeMap2)}\n`)
// console.debug(`Antenna dict:\n${JSON.stringify(antennaDict, null, 2)}\n`)

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
