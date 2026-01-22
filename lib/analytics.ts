"use client";

import posthog from "posthog-js";

/**
 * Event prefix for all analytics events
 */
const EVENT_PREFIX = "DEV_EVENTS__";

/**
 * Type definition for event properties
 */
type EventProperties = Record<string, any>;

/**
 * Client-side analytics facade for PostHog
 * Automatically prefixes all event names with "DEV_EVENTS_"
 *
 * @example
 * ```typescript
 * import { analytics } from '@/lib/analytics';
 *
 * analytics.capture('page_view', { page: 'home' });
 * // Sent as "DEV_EVENTS_page_view"
 * ```
 */
export const analytics = {
  /**
   * Capture an analytics event with automatic prefix
   * @param eventName - The name of the event (will be prefixed with "DEV_EVENTS_")
   * @param properties - Optional properties to attach to the event
   */
  capture: (eventName: string, properties?: EventProperties) => {
    const prefixedEventName = `${EVENT_PREFIX}${eventName}`;
    posthog.capture(prefixedEventName, properties);
    console.log(
      `Captured event: ${prefixedEventName} with properties: ${JSON.stringify(properties)}`,
    );
  },

  /**
   * Identify a user
   * @param distinctId - Unique identifier for the user
   * @param properties - Optional user properties
   */
  identify: (distinctId: string, properties?: EventProperties) => {
    posthog.identify(distinctId, properties);
  },

  /**
   * Reset the user session
   */
  reset: () => {
    posthog.reset();
  },

  /**
   * Set user properties
   * @param properties - User properties to set
   */
  setPersonProperties: (properties: EventProperties) => {
    posthog.setPersonProperties(properties);
  },

  /**
   * Capture an error event
   * @param error - The error to capture
   */
  captureException: (error: Error, properties?: EventProperties) => {
    posthog.captureException(error, {
      prefix: EVENT_PREFIX,
      ...properties,
    });
  },
};
/**
 * Re-export the PostHog instance for advanced use cases
 * Use this only when you need direct access to PostHog methods
 * not covered by the analytics facade
 */
export { posthog };
