/** Kitchen-local calendar date (YYYY-MM-DD). */
export function kitchenToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
  }).format(new Date());
}
