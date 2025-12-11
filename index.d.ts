declare module "ptmjp" {
  /**
   * Compute the Julian Day Number (JDN) from a Gregorian calendar date.
   * The JDN is a count of days since November 16, 4713 BCE (Julian Period epoch).
   * The function takes a Gregorian calendar date as input, and returns the
   * corresponding JDN as a floating-point number. The fractional part of the
   * JDN is the day fraction (time of day in UTC, as a fraction of a day from
   * 0 to 1).
   *
   * @param {number} year - The year of the date.
   * @param {number} month - The month of the date (1..12).
   * @param {number} day - The day of the month of the date (1..31).
   * @param {number} [hour=12] - The hour of the day (0..23).
   * @param {number} [minute=0] - The minute of the hour (0..59).
   * @param {number} [second=0] - The second of the minute (0..59).
   * @returns {number} The Julian Day Number for the given date and time.
   * @throws {RangeError} If month, day, hour, minute, or second is out of range.
   */
  export function g2jd(
    year: number,
    month: number,
    day: number,
    hour?: number | undefined,
    minute?: number | undefined,
    second?: number | undefined
  ): number;
  /**
   * Convert a Julian Day Number (JDN) to a Gregorian calendar date with UTC time components.
   * The function takes a JDN as input, and returns an object with year, month, day, hour, minute, and second properties.
   * The function applies the timezone offset (tzOffset in hours) to obtain the local time.
   *
   * @param {number} jd - The Julian Day Number to be converted.
   * @returns {{year: number; month: number; day: number; hour: number; minute: number; second: string}} An object containing the Gregorian calendar date and UTC time components.
   * @throws {TypeError} If the given JDN is not a finite number.
   */
  export function jd2g(jd: number): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  /**
   * Computes the position of a year within the 28-year Solar Cycle (1..28).
   * This function handles BCE (negative/zero years) correctly.
   *
   * @param {number} year - The year for which to compute the solar number.
   * @returns {number} The position of the year within the 28-year Solar Cycle (1..28).
   */
  export function solarNumber(year: number): number;
  /**
   * Computes the position of a year within the 19-year Metonic (Lunar) cycle (1..19).
   * This function handles BCE (negative/zero years) correctly.
   *
   * @param {number} year - The year for which to compute the lunar number.
   * @returns {number} The position of the year within the 19-year Metonic (Lunar) cycle (1..19).
   */
  export function lunarNumber(year: number): number;
  /**
   * Computes the position of a year within the 15-year Indiction cycle (1..15).
   * This function handles BCE (negative/zero years) correctly.
   *
   * @param {number} year - The year for which to compute the indiction number.
   * @returns {number} The position of the year within the 15-year Indiction cycle (1..15).
   */
  export function indictionNumber(year: number): number;
  /**
   * Computes the position of a year within the Julian Period (length 15*19*28 = 7980 years),
   * returning a value in 1..7980 and correctly handling BCE years.
   *
   * @param {number} year - The year for which to compute the Julian Period year number.
   * @returns {number} The position of the year within the Julian Period (1..7980).
   */
  export function julianPeriodYearNumber(year: number): number;
}
