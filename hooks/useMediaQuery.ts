import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => {
      setMatches(media.matches)
    }
    
    // Modern browsers support addEventListener on MediaQueryList, older use addListener
    if (media.addEventListener) {
        media.addEventListener("change", listener)
        return () => media.removeEventListener("change", listener)
    } else {
        // Fallback for older Safari/Browsers
        // @ts-ignore
        media.addListener(listener)
        // @ts-ignore
        return () => media.removeListener(listener)
    }
    
  }, [matches, query])

  return matches
}
