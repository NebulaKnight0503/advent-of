export function usingSampleData(): boolean {
  return ['-s', '--sample'].includes(Deno.args[0])
}

export function usingSampleDataNumber(): number|null {
  return usingSampleData() && (Deno.args[1] || '').match(/^\d+$/) ? Number.parseInt(Deno.args[1], 10) : null
}

export function getInputFileName(): string {
  if (usingSampleData()) {
    const sampleNumber = usingSampleDataNumber()
    if (sampleNumber) {
      return `sample${sampleNumber}.txt`
    }
    return 'sample.txt'
  }

  return 'input.txt'
}
