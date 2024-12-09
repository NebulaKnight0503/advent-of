#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'

let answerPt1 = 0
let answerPt2 = 0

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

let diskMap:number[] = []
for await (const row of rowReader) {
  diskMap.push(...row.map(char => Number.parseInt(char, 10)))
}

const occurrenceCounts:Record<string, number> = {}
let countOfNonFreeBlocks = 0
const fileSystemMap:string[] = diskMap.reduce(
  (outputArr:string[], num:number, index:number) => {
    const isFile = index % 2 === 0
    if (isFile) {
      const fileId = Math.floor(index / 2)
      const fileSpace:string[] = Array(num).fill(fileId.toString())
      outputArr.push(...fileSpace)
      occurrenceCounts[fileId.toString()] = (occurrenceCounts[fileId.toString()] || 0) + num
      countOfNonFreeBlocks += num
    } else {
      const freeSpace:string[] = Array(num).fill('.')
      outputArr.push(...freeSpace)
      occurrenceCounts['.'] = (occurrenceCounts['.'] || 0) + num
    }
    return outputArr
  },
  []
)

// console.debug('fileSystemMap:\n' + fileSystemMap.join(''))

const compactedFileSystemMap:string[] = Array(fileSystemMap.length).fill('.')

let buildingIndex = 0
let compactingIndex = fileSystemMap.length - 1

while (buildingIndex < countOfNonFreeBlocks) {
  let currentEntry = fileSystemMap[buildingIndex]

  if (currentEntry === '.') {
    while (fileSystemMap[compactingIndex] === '.') {
      compactingIndex--
    }
    currentEntry = fileSystemMap[compactingIndex--]
  }

  compactedFileSystemMap[buildingIndex] = currentEntry

  // Compute checksum
  if (currentEntry !== '.') {
    //console.debug(`+= ${buildingIndex} * ${Number.parseInt(currentEntry, 10)}`)
    answerPt1 += buildingIndex * Number.parseInt(currentEntry, 10)
  }

  buildingIndex++
}

// console.debug('compactedFileSystemMap:\n' + compactedFileSystemMap.join(''))

// Validation
for (const [char, expectedCount] of Object.entries(occurrenceCounts)) {
  const actualCount = compactedFileSystemMap.filter(c => c === char).length
  if (actualCount !== expectedCount) {
    console.error(`Expected ${expectedCount} of "${char}", but found ${actualCount}`)
  }
}

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
