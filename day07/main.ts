#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'
import { _ } from '../helpers/lodash.ts'

function repeatedPermutations(inputArr:string[], desiredLength:number):string[][] {
  const result:string[][] = [];

  function generate(perm) {
    if (perm.length === desiredLength) {
      result.push([...perm]);
      return;
    }

    for (let i = 0; i < inputArr.length; i++) {
      perm.push(inputArr[i]);
      generate(perm);
      perm.pop();
    }
  }

  generate([]);
  return result;
}

const permuteArray = _.memoize(
  (inputArr:string[]) => {
    const inputStr = inputArr.join('')
    const permutationStrs = permuteStr(inputStr)
    return permutationStrs.map((str) => str.split(''))
  },
  (inputArr:string[]) => inputArr.join('')
)

// https://www.tutorialspoint.com/creating-all-possible-unique-permutations-of-a-string-in-javascript
const permuteStr = (str = '') => {
  if (!!str.length && str.length < 2 ){
     return [str]
  }
  const arr:string[] = [];
  for (let i = 0; i < str.length; i++){
     let char = str[i]
     if (str.indexOf(char) != i)
        continue
        let remainder = str.slice(0, i) + str.slice(i + 1, str.length)
        for (let permutation of permuteStr(remainder)){
           arr.push(char + permutation)
        }
  }
  return arr
}

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: /[:\s]+/ })

let answerPt1 = 0
let answerPt2 = 0

for await (const row of rowReader) {
  //console.debug(JSON.stringify(row))
  const [result, ...inputs] = row.map(n => Number.parseInt(n, 10))

  if (Number.isNaN(result) || result.toString() !== row[0]) {
    throw new Error(`Invalid or overflowing result value: ${row[0]}`)
  }

  const operatorCount = inputs.length - 1

  let attemptedResult1 = 0
  const allPermutations1 = repeatedPermutations(['+', '*'], operatorCount)
  for (let operatorsPerm of allPermutations1) {
    attemptedResult1 = inputs[0]
    for (let i = 1; i < inputs.length; i++) {
      const operator = operatorsPerm[i - 1]
      const nextInput = inputs[i]
      if (operator === '+') {
        attemptedResult1 += nextInput
      } else if (operator === '*') {
        attemptedResult1 *= nextInput
      } else if (operator === '|') {
        attemptedResult1 = Number.parseInt(attemptedResult1.toString() + nextInput.toString(), 10)
      } else {
        throw new Error(`Invalid operator: ${operator}`)
      }
    }

    if (result === attemptedResult1) {
      //console.debug(`Successful permutation (1): ${result} == ${_.zip(inputs, operatorsPerm.map(op => op === '|' ? '||' : op)).flat().join(' ')}`)
      answerPt1 += result
      break
    }
  }

  let attemptedResult2 = 0
  const allPermutations2 = repeatedPermutations(['+', '*', '|'], operatorCount)
  for (let operatorsPerm of allPermutations2) {
    attemptedResult2 = inputs[0]
    for (let i = 1; i < inputs.length; i++) {
      const operator = operatorsPerm[i - 1]
      const nextInput = inputs[i]
      if (operator === '+') {
        attemptedResult2 += nextInput
      } else if (operator === '*') {
        attemptedResult2 *= nextInput
      } else if (operator === '|') {
        attemptedResult2 = Number.parseInt(attemptedResult2.toString() + nextInput.toString(), 10)
      } else {
        throw new Error(`Invalid operator: ${operator}`)
      }
    }

    if (result === attemptedResult2) {
      //console.debug(`Successful permutation (2): ${result} == ${_.zip(inputs, operatorsPerm.map(op => op === '|' ? '||' : op)).flat().join(' ')}`)
      answerPt2 += result
      break
    }
  }
}

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
