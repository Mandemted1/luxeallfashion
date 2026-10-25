import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Starts undefined (not the real width) on purpose: the server has no
  // concept of viewport, so it always renders the desktop branch. If this
  // read the real window width on the client's first render instead, a
  // narrow window would disagree with what the server sent and React
  // would throw a hydration mismatch — the first render has to match the
  // server exactly, and only the effect below is allowed to correct it
  // after that.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above the useState call: this is the correct SSR-safe pattern for a window-dependent value, not an anti-pattern to avoid.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
