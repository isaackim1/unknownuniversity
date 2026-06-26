/**
 * Request, response, and query payloads for the coaching endpoints.
 * <p>
 * Marked {@link io.fluxzero.sdk.tracking.handling.authentication.NoUserRequired} so these payloads do
 * not inherit the {@code @RequiresUser} default from the root {@code com.example.unknown} package when
 * dispatched as web requests or Fluxzero queries.
 */
@NoUserRequired
package com.example.unknown.coaching.api;

import io.fluxzero.sdk.tracking.handling.authentication.NoUserRequired;
