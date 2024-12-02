#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { sortAscending } from '../helpers/array.ts'
import { _ } from '../helpers/lodash.ts'
import { getInputFileName } from '../helpers/args.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName())

// Assess each group of numbers
const locationIdsLeft:number[] = []
const locationIdsRight:number[] = []
for await (const [left, right] of rowReader) {
  locationIdsLeft.push(Number.parseInt(left, 10))
  locationIdsRight.push(Number.parseInt(right, 10))
}

// Sort the arrays
sortAscending(locationIdsLeft)
sortAscending(locationIdsRight)

const distanceSum = _.zip(locationIdsLeft, locationIdsRight).reduce(
  (distanceSum, [left, right]) => distanceSum + Math.abs(left - right),
  0
)

const similaritySum = locationIdsLeft.reduce(
  (similaritySum, left) => {
    let rightCount = 0
    for (const right of locationIdsRight) {
      if (left === right) {
        rightCount += 1
      }
    }
    return similaritySum + (left * rightCount)
  },
  0
)

//console.log('Values: ' + JSON.stringify(distanceSum))
console.log('[pt1] Distance sum: ' + distanceSum)
console.log('[pt2] Similarity sum: ' + similaritySum)
