#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { sortAscending } from '../helpers/array.ts'
import { _ } from '../helpers/lodash.ts'
import { getInputFileName } from '../helpers/args.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const reportReader = await getInputRowStream(getInputFileName())

const isSafeReport = (levelNumbers: number[]) => {
  const initiallyEqual = levelNumbers[0] === levelNumbers[1]
  if (initiallyEqual) {
    //console.debug(' - Skipping report with no initial direction')
    return false
  }

  const initiallyAscending = levelNumbers[0] < levelNumbers[1]
  const initiallyDescending = levelNumbers[0] > levelNumbers[1]

  for (let i = 1; i < levelNumbers.length; i++) {
    if (initiallyAscending && (levelNumbers[i - 1] >= levelNumbers[i])) {
      //console.debug(' - Skipping report ascending levels not ascending anymore')
      return false
    }

    if (initiallyDescending && (levelNumbers[i - 1] <= levelNumbers[i])) {
      //console.debug(' - Skipping report descending levels not ascending anymore')
      return false
    }

    const diff = Math.abs(levelNumbers[i] - levelNumbers[i - 1])
    if (diff < 1 || diff > 3) {
      //console.debug(` - Skipping report as level difference is too much: ${diff}`)
      return false
    }
  }
  
  return true
}

const isSafeAfterDampening = (levelNumbers: number[], dampened: boolean = false) => {
  const prefix = dampened ? '  ' : ''

  if (dampened) {
    console.debug(`${prefix} - Dampened levels: ${JSON.stringify(levelNumbers)}`)
  }

  const initiallyEqual = levelNumbers[0] === levelNumbers[1]
  if (initiallyEqual) {
    if (dampened) {
      console.debug(`${prefix}   - Skipping dampened report with no initial direction (${levelNumbers[0]} == ${levelNumbers[1]})`)
      return false
    } else {
      console.debug(`${prefix} - Dampening report with no initial direction (${levelNumbers[0]} == ${levelNumbers[1]})`)
      return isSafeAfterDampening(levelNumbers.slice(1), true)
    }
  }

  const initiallyAscending = levelNumbers[0] < levelNumbers[1]
  const initiallyDescending = levelNumbers[0] > levelNumbers[1]

  for (let i = 1; i < levelNumbers.length; i++) {
    if (initiallyAscending && levelNumbers[i - 1] >= levelNumbers[i]) {
      if (dampened) {
        console.debug(`${prefix}   - Skipping dampened report ascending levels not ascending anymore (${levelNumbers[i - 1]} >= ${levelNumbers[i]})`)
        return false
      } else {
        console.debug(`${prefix} - Dampening report ascending levels not ascending anymore (${levelNumbers[i - 1]} >= ${levelNumbers[i]})`)

        const safeWithoutPrevious = isSafeAfterDampening([...levelNumbers.slice(0, i - 1), ...levelNumbers.slice(i)], true)
        if (safeWithoutPrevious) {
          return true
        }

        const safeWithoutThis = isSafeAfterDampening([...levelNumbers.slice(0, i), ...levelNumbers.slice(i + 1)], true)
        return safeWithoutThis
      }
    }

    if (initiallyDescending && (levelNumbers[i - 1] <= levelNumbers[i])) {
      if (dampened) {
        console.debug(`${prefix}   - Skipping dampened report descending levels not descending anymore (${levelNumbers[i - 1]} <= ${levelNumbers[i]})`)
        return false
      } else {
        console.debug(`${prefix} - Dampening report descending levels not descending anymore (${levelNumbers[i - 1]} <= ${levelNumbers[i]})`)

        const safeWithoutPrevious = isSafeAfterDampening([...levelNumbers.slice(0, i - 1), ...levelNumbers.slice(i)], true)
        if (safeWithoutPrevious) {
          return true
        }

        const safeWithoutThis = isSafeAfterDampening([...levelNumbers.slice(0, i), ...levelNumbers.slice(i + 1)], true)
        return safeWithoutThis
      }
    }

    const diff = Math.abs(levelNumbers[i] - levelNumbers[i - 1])
    if (diff < 1 || diff > 3) {
      if (dampened) {
        console.debug(`${prefix}   - Skipping dampened report as level difference is too much: ${diff} (${levelNumbers[i - 1]} -> ${levelNumbers[i]})`)
        return false
      } else {
        console.debug(`${prefix} - Dampening report as level difference is too much: ${diff} (${levelNumbers[i - 1]} -> ${levelNumbers[i]})`)

        const safeWithoutPrevious = isSafeAfterDampening([...levelNumbers.slice(0, i - 1), ...levelNumbers.slice(i)], true)
        if (safeWithoutPrevious) {
          return true
        }

        const safeWithoutThis = isSafeAfterDampening([...levelNumbers.slice(0, i), ...levelNumbers.slice(i + 1)], true)
        return safeWithoutThis
      }
    }
  }

  return true
}

const canBeSafeAfterDampeningBruteForce = (levelNumbers: number[]) => {
  for (let i = 0; i < levelNumbers.length; i++) {
    const dampenedReport = [
      ...levelNumbers.slice(0, i),
      ...levelNumbers.slice(i + 1)
    ]
    if (isSafeReport(dampenedReport)) {
      return true
    }
  }

  return false
}

// Assess each group of numbers
let safeReports = 0
let safeReportsAfterDampening = 0
let safeReportsAfterBruteDampening = 0
for await (const [...levels] of reportReader) {
  const levelNumbers = levels.map(l => Number.parseInt(l, 10))

  console.debug(`\nLevels: ${JSON.stringify(levelNumbers)}`)

  if (isSafeReport(levelNumbers)) {
    safeReports += 1
  }
  const safeAfterDampening = isSafeAfterDampening(levelNumbers, false)
  console.debug(' - ' + (safeAfterDampening ? 'Safe' : 'UNSAFE!'))
  if (safeAfterDampening) {
    safeReportsAfterDampening += 1
  }

  const safeAfterBruteDampening = canBeSafeAfterDampeningBruteForce(levelNumbers)
  if (safeAfterBruteDampening) {
    safeReportsAfterBruteDampening += 1
  }
}

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] Safe reports: ' + safeReports)
console.log('[pt2] Safe reports after dampening: ' + safeReportsAfterDampening)
console.log('[pt2 BRUTE] Safe reports after brute dampening: ' + safeReportsAfterBruteDampening)
