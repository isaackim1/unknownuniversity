/**
 * Public founder-coaching endpoints for Unknown Digital Campus.
 * <p>
 * The root {@code com.example.unknown} package declares {@code @RequiresUser} as a global default.
 * This package-level {@link io.fluxzero.sdk.tracking.handling.authentication.NoUserRequired} is more
 * specific and overrides that default, so the demo coaching flow needs no authentication.
 */
@NoUserRequired
package com.example.unknown.coaching;

import io.fluxzero.sdk.tracking.handling.authentication.NoUserRequired;
