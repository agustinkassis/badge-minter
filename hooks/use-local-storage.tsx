import { useState, useCallback, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error)
      return initialValue
    }
  }, [key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
          return valueToStore
        })
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error)
      }
    },
    [key]
  )

  const remove = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key “${key}”:`, error)
    }
  }, [key])

  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  return [storedValue, setValue, remove] as const
}

export default useLocalStorage
