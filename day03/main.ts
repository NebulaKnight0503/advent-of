#!/usr/bin/env -S deno run --allow-read

import { getInputText } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'

// Get all contents from the input file
const fileContents = await getInputText(getInputFileName())

const matchesPt1 = [...fileContents.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)]

const sumOfProductsPt1 = matchesPt1.reduce(
  (sum, match) => {
    const [_, left, right] = match
    const product = Number.parseInt(left, 10) * Number.parseInt(right, 10)
    return sum + product
  },
  0
)

const matchesPt2 = [...fileContents.matchAll(/(?:(mul)\((\d{1,3}),(\d{1,3})\)|(do)\(\)|(don't\(\)))/g)]
const sumOfProductsPt2 = matchesPt2.reduce(
  (acc, match) => {
    const [_, isMul, left, right, isDo, isDont] = match
    if (isDo) {
      acc.enabled = true
    }
    else if (isDont) {
      acc.enabled = false
    }
    else if (acc.enabled && isMul) {
      const product = Number.parseInt(left, 10) * Number.parseInt(right, 10)
      acc.sum += product
    }
    return acc
  },
  { sum: 0, enabled: true }
)

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] Sum of products: ' + sumOfProductsPt1)
console.log('[pt2] Sum of products: ' + sumOfProductsPt2.sum)
