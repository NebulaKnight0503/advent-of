#!/usr/bin/env -S deno run --allow-read

import { getInputSectionStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'
import { _ } from '../helpers/lodash.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const sectionReader = await getInputSectionStream(getInputFileName())

let section1:string[] = []
let section2:string[] = []
let answerPt1 = 0
let answerPt2 = 0

for await (const section of sectionReader) {
  if (section1.length === 0) {
    section1 = section
  } else {
    section2 = section
  }
}

const orderingMap = {}
for (const ordering of section1) {
  const [before, later] = ordering.split('|')
  if (!orderingMap[before]) {
    orderingMap[before] = []
  }
  orderingMap[before].push(later)
}

const validUpdates:string[][] = []
const invalidUpdates:string[][] = []
for (const update of section2) {
  let isValid = true
  const pages = update.split(',')
  for (let i = 0; i < pages.length; i++) {
    // The first page cannot be out of order as far as we know at this point
    if (i === 0) {
      continue
    }

    // If there is no ordering rule of pages that must follow this one, it's valid so far
    const orderingRulesForThisPage = orderingMap[pages[i]]
    if (!orderingRulesForThisPage) {
      continue
    }

    const previousPages = pages.slice(0, i)
    const orderingViolations = _.intersection(orderingRulesForThisPage, previousPages)
    if (orderingViolations.length > 0) {
      isValid = false
      break
    }
  }

  if (isValid) {
    validUpdates.push(pages)
  } else {
    invalidUpdates.push(pages)
  }
}

// console.debug('\nValid updates:\n' + validUpdates.join('\n'))
// console.debug('\nInvalid updates:\n' + invalidUpdates.join('\n'))

for (const updatePages of validUpdates) {
  answerPt1 += Number.parseInt(updatePages[Math.floor(updatePages.length / 2)], 10)
}

for (const updatePages of invalidUpdates) {
  // Fix the printing order
  for (let i = 0; i < updatePages.length; i++) {
    // The first page cannot be out of order as far as we know at this point
    if (i === 0) {
      continue
    }

    // If there is no ordering rule of pages that must follow this one, it's valid so far
    const orderingRulesForThisPage = orderingMap[updatePages[i]]
    if (!orderingRulesForThisPage) {
      continue
    }

    const previousPages = updatePages.slice(0, i)
    const orderingViolations = _.intersection(orderingRulesForThisPage, previousPages)
    if (orderingViolations.length > 0) {
      const lowestIndex = Math.min(...orderingViolations.map(v => previousPages.indexOf(v)))
      const removedPages = updatePages.splice(i, 1)
      updatePages.splice(lowestIndex, 0, removedPages[0])
    }
  }

  // Then add the middle value
  answerPt2 += Number.parseInt(updatePages[Math.floor(updatePages.length / 2)], 10)
}

console.log('\n')
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
