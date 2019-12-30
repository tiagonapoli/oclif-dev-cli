import _ = require('lodash')

export function castArray<T>(input?: T | T[]): T[] {
  if (input === undefined) return []
  return Array.isArray(input) ? input : [input]
}

export function uniqBy<T>(arr: T[], fn: (cur: T) => any): T[] {
  return arr.filter((a, i) => {
    const aVal = fn(a)
    return !arr.find((b, j) => j > i && fn(b) === aVal)
  })
}

export function compact<T>(a: (T | undefined)[]): T[] {
  return a.filter((a): a is T => Boolean(a))
}

export function sortBy<T>(arr: T[], fn: (i: T) => sort.Types | sort.Types[]): T[] {
  function compare(a: sort.Types | sort.Types[], b: sort.Types | sort.Types[]): number {
    a = a === undefined ? 0 : a
    b = b === undefined ? 0 : b

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length === 0 && b.length === 0) return 0
      const diff = compare(a[0], b[0])
      if (diff !== 0) return diff
      return compare(a.slice(1), b.slice(1))
    }

    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  return arr.sort((a, b) => compare(fn(a), fn(b)))
}

export const sortAndUniq = <T>(arr: T[], fn: (i: T) => sort.Types | sort.Types[]): T[] => {
  return sortBy(uniqBy(arr, fn), fn)
}

export namespace sort {
  export type Types = string | number | undefined | boolean
}

export const template = (context: any) => (t: string | undefined): string => _.template(t || '')(context)
