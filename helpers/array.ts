export function sortAscending(array:number[]): void {
  array.sort((a, b) => a - b)
}

export function sortDescending(array:number[]): void {
  array.sort((a, b) => b - a)
}
