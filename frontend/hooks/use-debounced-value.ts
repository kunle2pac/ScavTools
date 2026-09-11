import { useEffect, useState } from "react"

// Delays updating the returned value until `delayMs` has passed without a
// new change, so callers (e.g. a live search filter) can avoid firing a
// network request on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
