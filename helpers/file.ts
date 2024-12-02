import * as path from 'https://deno.land/std/path/mod.ts'
import { TextLineStream } from 'https://deno.land/std/streams/text_line_stream.ts'
import { DelimiterStream } from 'https://deno.land/std/streams/delimiter_stream.ts'

// Figure out the file path relative to the main executing script file
export function resolvePath(relativePath:string): string {
  const mainModuleDir = path.dirname(path.fromFileUrl(Deno.mainModule))
  return path.resolve(mainModuleDir, relativePath)
}

export function getInputText(relativePath:string): Promise<string> {
  const inputFilePath = resolvePath(relativePath)
  return Deno.readTextFile(inputFilePath)
}

export async function getInputStream(relativePath:string): Promise<ReadableStream<Uint8Array>> {
  const inputFilePath = resolvePath(relativePath)

  // Try opening the input file; if it fails, let the error propagate
  const inputFile = await Deno.open(inputFilePath, { read: true })

  // Build a readable stream so the file doesn't have to be fully loaded into
  // memory while we send it
  return inputFile.readable
}

export async function getInputCharStream(relativePath:string): Promise<ReadableStream<string>> {
  const inputReader = await getInputStream(relativePath)
  return inputReader!
    // convert Uint8Array to string
    .pipeThrough(new TextDecoderStream())
    // transform into a stream of individual characters
    .pipeThrough(new TransformStream({
      transform: (chunk:string, controller) => {
        for (const char of chunk) {
          controller.enqueue(char)
        }
      }
    }))
}

export async function getInputLineStream(relativePath:string): Promise<ReadableStream<string>> {
  const inputReader = await getInputStream(relativePath)
  return inputReader!
    // convert Uint8Array to string
    .pipeThrough(new TextDecoderStream())
    // transform into a stream where each chunk is divided by a newline
    .pipeThrough(new TextLineStream())
}

export async function getInputRowStream(relativePath:string, options?: { delimiter?:string|RegExp, includeEmptyRows?:boolean }): Promise<ReadableStream<string[]>> {
  const splitDelimiter = options?.delimiter ?? /\s+/
  const omitEmptyRows = options?.includeEmptyRows !== true
  const lineReader = await getInputLineStream(relativePath)
  return lineReader!
    .pipeThrough(new TransformStream({
      transform: (row:string, controller) => {
        const trimmedRow = row.trim()

        // Omit empty rows?
        const isEmptyRow = trimmedRow === ''
        if (omitEmptyRows && isEmptyRow) return

        const cells = isEmptyRow ? [] : trimmedRow.split(splitDelimiter)
        controller.enqueue(cells)
      }
    }))
}

export async function getInputSectionStream(relativePath:string, options?: { sectionDelimiter?:string, lineDelimiter?:string }): Promise<ReadableStream<string[]>> {
  const inputStream = await getInputStream(relativePath)
  return inputStream!
    // transform into a stream where each chunk is divided by two newlines
    .pipeThrough(new DelimiterStream(new TextEncoder().encode(options?.sectionDelimiter ?? '\n\n')))
    // convert Uint8Array to string
    .pipeThrough(new TextDecoderStream())
    // transform each section into an array of lines, divided by one newline
    .pipeThrough(new TransformStream({
      // ⚠️ This transformation has potential performance issues as it buffers lines into memory for each section
      transform: (section:string, controller) => {
        const lines = section.split(options?.lineDelimiter ?? '\n')
        controller.enqueue(lines)
      }
    }))
}
