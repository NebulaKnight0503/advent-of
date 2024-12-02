export function usingSampleData(): boolean {
  return ['-s', '--sample'].includes(Deno.args[0])
}

export function getInputFileName(): string {
  return usingSampleData() ? 'sample.txt' : 'input.txt'
}
