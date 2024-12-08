export function printGrid(grid:string[][]|number[][]): string {
  return grid.map(row => row.join('')).join('\n')
}
