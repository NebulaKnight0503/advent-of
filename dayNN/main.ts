#!/usr/bin/env -S deno run --allow-read

import { getInputRowStream } from '../helpers/file.ts'
import { getInputFileName } from '../helpers/args.ts'

// Get a readable stream from the input file doesn't have to be fully loaded into memory
const rowReader = await getInputRowStream(getInputFileName(), {  delimiter: '' })

let answerPt1 = 0
let answerPt2 = 0

// TODO

console.log('\n')
//console.log('Values: ' + JSON.stringify(values))
console.log('[pt1] ' + answerPt1)
console.log('[pt2] ' + answerPt2)
