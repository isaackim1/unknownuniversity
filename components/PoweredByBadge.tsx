interface PoweredByBadgeProps {
  poweredBy?: string
}

/**
 * Honest provenance badge. Only claims Fluxzero when the response actually came
 * from the Fluxzero backend. Anything else (e.g. the Next.js local fallback)
 * renders as a muted note so the demo never falsely advertises Fluxzero.
 */
export default function PoweredByBadge({ poweredBy }: PoweredByBadgeProps) {
  if (poweredBy === 'fluxzero') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-unknown-yellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-unknown-black">
        <span aria-hidden="true">⚡</span> Powered by Fluxzero
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/40">
      Local fallback
    </span>
  )
}
