#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'

let answerPt1 = 0
let answerPt2 = 0

type FreeBlock = {
  startIndex: number
  size: number
}
type FileBlock = {
  fileId: number
  startIndex: number
  size: number
}

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

let diskMap:number[] = []
for await (const row of rowReader) {
  diskMap.push(...row.map(char => Number.parseInt(char, 10)))
}

const occurrenceCounts:Record<string, number> = {}
const freeBlockGroups:FreeBlock[] = []
const fileBlockGroups:FileBlock[] = []
let countOfNonFreeBlocks = 0
let mapIndex = 0
const fileSystemMap:string[] = diskMap.reduce(
  (outputArr:string[], num:number, index:number) => {
    const isFile = index % 2 === 0
    if (isFile) {
      const fileId = Math.floor(index / 2)
      const fileSpace:string[] = Array(num).fill(fileId.toString())
      outputArr.push(...fileSpace)

      occurrenceCounts[fileId.toString()] = (occurrenceCounts[fileId.toString()] || 0) + num
      countOfNonFreeBlocks += num
      fileBlockGroups.push({ fileId, startIndex: mapIndex, size: num })
    } else {
      const freeSpace:string[] = Array(num).fill('.')
      outputArr.push(...freeSpace)

      occurrenceCounts['.'] = (occurrenceCounts['.'] || 0) + num
      freeBlockGroups.push({ startIndex: mapIndex, size: num })
    }
    mapIndex += num
    return outputArr
  },
  []
)
const highestFileId = Number.parseInt(fileSystemMap[fileSystemMap.length - 1], 10)

// console.debug('fileSystemMap:\n' + fileSystemMap.join(''))

const compactedFileSystemMap1:string[] = Array(fileSystemMap.length).fill('.')

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

  compactedFileSystemMap1[buildingIndex] = currentEntry

  // Compute checksum
  if (currentEntry !== '.') {
    //console.debug(`+= ${buildingIndex} * ${Number.parseInt(currentEntry, 10)}`)
    answerPt1 += buildingIndex * Number.parseInt(currentEntry, 10)
  }

  buildingIndex++
}

// console.debug('compactedFileSystemMap1:\n' + compactedFileSystemMap1.join(''))

// Validation
// for (const [entry, expectedCount] of Object.entries(occurrenceCounts)) {
//   const actualCount = compactedFileSystemMap1.filter(c => c === entry).length
//   if (actualCount !== expectedCount) {
//     console.error(`Expected ${expectedCount} of "${entry}", but found ${actualCount}`)
//   }
// }

// Part 2
const compactedFileSystemMap2:string[] = fileSystemMap.slice()

let buildingIndex2 = 0
let buildingFileId = 0
let compactingFileId = highestFileId

// TODO: This check is probably wrong again....
for (let i = fileBlockGroups.length - 1; i > 0; i--) {
  const highestFile = fileBlockGroups[i]
  const earlySufficientFreeSpace = freeBlockGroups.findIndex(({ startIndex, size }) => size >= highestFile.size && startIndex < highestFile.startIndex)

  // If none big enough, leave in original spot
  if (earlySufficientFreeSpace === -1) {
    continue
  }

  const freeBlock = freeBlockGroups[earlySufficientFreeSpace]
  const remainingFreeSpace = freeBlock.size - highestFile.size

  // Compact the file into the free space
  compactedFileSystemMap2.splice(freeBlock.startIndex, highestFile.size, ...Array(highestFile.size).fill(highestFile.fileId.toString()))
  // Remove the file from its old space
  compactedFileSystemMap2.splice(highestFile.startIndex, highestFile.size, ...Array(highestFile.size).fill('.'))

  if (remainingFreeSpace === 0) {
    freeBlockGroups.splice(earlySufficientFreeSpace, 1)
  } else {
    // Create the newly released free space
    const nearestFreeBlockIndex = freeBlockGroups.findLastIndex(({ startIndex, size }) => startIndex < highestFile.startIndex)
    const nearestFreeBlock = freeBlockGroups[nearestFreeBlockIndex]
    // If the free block butts up against the highest file, we can just extend it
    if (nearestFreeBlock.startIndex + nearestFreeBlock.size === highestFile.startIndex) {
      nearestFreeBlock.size += highestFile.size
    } else {
      // Otherwise, we need to insert a new free block
      const newFreeBlock:FreeBlock = { startIndex: highestFile.startIndex, size: highestFile.size }
      freeBlockGroups.splice(nearestFreeBlockIndex + 1, 0, newFreeBlock)
    }

    freeBlock.startIndex += highestFile.size
    freeBlock.size = remainingFreeSpace
  }
}

// Compute checksum
for (let i = 0; i < compactedFileSystemMap2.length; i++) {
  const currentEntry = compactedFileSystemMap2[i]
  if (currentEntry !== '.') {
    //console.debug(`+= ${buildingIndex2} * ${Number.parseInt(currentEntry, 10)}`)
    answerPt2 += i * Number.parseInt(currentEntry, 10)
  }
}

//console.debug('compactedFileSystemMap2:\n' + compactedFileSystemMap2.join(''))

// Validation
// for (const [entry, expectedCount] of Object.entries(occurrenceCounts)) {
//   const actualCount = compactedFileSystemMap2.filter(c => c === entry).length
//   if (actualCount !== expectedCount) {
//     console.error(`Expected ${expectedCount} of "${entry}", but found ${actualCount}`)
//   }
// }

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
