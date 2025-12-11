/**!
 * Copyright 2025 Pho Thin Maung <phothinmg@disroot.org>
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS
 * ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL,
 * DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
 * WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH
 * THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * */
"use strict";

var jp = (function () {
  var utils = {
    /**
     * Check if a given date is in the Gregorian calendar.
     *
     * @param {number} year - The year of the date.
     * @param {number} month - The month of the date.
     * @param {number} day - The day of the month of the date.
     * @returns {boolean} True if the date is in the Gregorian calendar, false otherwise.
     */
    isGregorian(year, month, day) {
      return (
        year > 1582 ||
        (year === 1582 && (month > 10 || (month === 10 && day > 14)))
      );
    },
    /**
     * Adjusts January and February to months 13 and 14 of the previous year in the style of Meeus and Zeller.
     *
     * @param {number} year - The year of the date.
     * @param {number} month - The month of the date.
     * @param {number} day - The day of the month of the date.
     * @returns {{year:number;month:number;day:number}} An object containing the adjusted year, month, and day.
     */
    adjustJanFeb(year, month, day) {
      // Adjust Jan/Feb to months 13/14 of previous year (Meeus / Zeller style)
      if (month < 3) {
        year -= 1;
        month += 12;
      }
      return { year, month, day };
    },
    /**
     * Returns the integer truncation of a given number.
     * If the number is greater than 0, it returns the floor of the number.
     * If the number is less than 0, it rounds towards zero.
     * If the number is equal to its floor, it returns the number as is.
     *
     * @param {number} d - The number to be truncated.
     * @returns {number} The truncated number.
     */
    integerTruncation(d) {
      //integer truncation
      if (d > 0) {
        return Math.floor(d);
      }
      if (d === Math.floor(d)) {
        return d;
      }
      // moves toward zero
      return Math.floor(d) + 1;
    },
    /**
     * Century Anchor (Gregorian correction factor).
     * Returns the Century Anchor value for the given date (2 - A + [A/4] where A is the year divided by 100).
     * If the date is not in the Gregorian calendar, returns 0.
     *
     * @param {number} year - The year of the date.
     * @param {number} month - The month of the date.
     * @param {number} day - The day of the month of the date.
     * @returns {number} The Century Anchor value for the given date.
     */
    gregorianCorrectionFactor(year, month, day) {
      // Century Anchor
      const A = utils.integerTruncation(year / 100);
      let B = 0;
      if (utils.isGregorian(year, month, day)) {
        B = 2 - A + utils.integerTruncation(A / 4);
      }
      return B;
    },
    /**
     * Converts a time given in hours, minutes, and seconds to a fractional day.
     *
     * @param {number} h - The hour of the time.
     * @param {number} m - The minute of the time.
     * @param {number} s - The second of the time.
     * @returns {number} The time converted to a fractional day (0..1).
     */
    hms2f(h, m, s) {
      return h / 24 + m / 1440 + s / 86400;
    },
    /**
     * Returns the result of a mathematical modulo operation (n % m) which
     * is defined as the remainder of n divided by m. This function
     * handles negative values of n correctly, and returns a value
     * in the range [0, m-1].
     * @param {number} n - The number to be taken modulo m.
     * @param {number} m - The number to take the modulo of.
     * @returns {number} The result of the modulo operation.
     */
    mod(n, m) {
      // Mathematical modulo that returns a value in [0, m-1] for any integer n (including negatives)
      return ((n % m) + m) % m;
    },
  };
  var _ = {
    /**
     * Computes the position of a year within the 28-year Solar Cycle (1..28).
     * This function handles BCE (negative/zero years) correctly.
     *
     * @param {number} year - The year for which to compute the solar number.
     * @returns {number} The position of the year within the 28-year Solar Cycle (1..28).
     */
    solarNumber(year) {
      // Position of a year within the 28-year Solar Cycle (1..28), handles BCE (negative/zero years)
      return utils.mod(year + 8, 28) + 1;
    },
    /**
     * Computes the position of a year within the 19-year Metonic (Lunar) cycle (1..19).
     * This function handles BCE (negative/zero years) correctly.
     *
     * @param {number} year - The year for which to compute the lunar number.
     * @returns {number} The position of the year within the 19-year Metonic (Lunar) cycle (1..19).
     */
    lunarNumber(year) {
      // Position of a year within the 19-year Metonic (Lunar) cycle (1..19), handles BCE
      return utils.mod(year, 19) + 1;
    },
    /**
     * Computes the position of a year within the 15-year Indiction cycle (1..15).
     * This function handles BCE (negative/zero years) correctly.
     *
     * @param {number} year - The year for which to compute the indiction number.
     * @returns {number} The position of the year within the 15-year Indiction cycle (1..15).
     */
    indictionNumber(year) {
      // Position of a year within the 15-year Indiction cycle (1..15), handles BCE
      return utils.mod(year + 2, 15) + 1;
    },
    /**
     * Computes the position of a year within the Julian Period (length 15*19*28 = 7980 years),
     * returning a value in 1..7980 and correctly handling BCE years.
     *
     * @param {number} year - The year for which to compute the Julian Period year number.
     * @returns {number} The position of the year within the Julian Period (1..7980).
     */
    julianPeriodYearNumber(year) {
      // Compute position within the Julian Period (length 15*19*28 = 7980 years),
      // returning a value in 1..7980 and correctly handling BCE years.
      const C15 = 15;
      const C19 = 19;
      const C28 = 28;
      const N = C15 * C19 * C28; // 7980

      // Use zero-based cycle positions for linear combination, then map to 1..N
      const ind0 = _.indictionNumber(year) - 1; // 0..14
      const lun0 = _.lunarNumber(year) - 1; // 0..18
      const sol0 = _.solarNumber(year) - 1; // 0..27

      // Coefficients as in original formula, combine and reduce modulo N
      const combined = 6916 * ind0 + 4200 * lun0 + 4845 * sol0;
      return utils.mod(combined, N) + 1;
    },
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
    g2jd(year, month, day, hour = 12, minute = 0, second = 0) {
      if (
        !Number.isFinite(month) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        throw new RangeError("month must be an integer in 1..12");
      }
      if (
        !Number.isFinite(day) ||
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
      ) {
        throw new RangeError("day must be an integer in 1..31");
      }
      if (!Number.isFinite(hour) || hour < 0 || hour >= 24) {
        throw new RangeError("hour must be in 0..23");
      }
      if (!Number.isFinite(minute) || minute < 0 || minute >= 60) {
        throw new RangeError("minute must be in 0..59");
      }
      if (!Number.isFinite(second) || second < 0 || second >= 60) {
        throw new RangeError("second must be in 0..59");
      }

      var adjusted = utils.adjustJanFeb(year, month, day);
      year = adjusted.year;
      month = adjusted.month;
      day = adjusted.day;
      var B = utils.gregorianCorrectionFactor(year, month, day);
      var dayFraction = utils.hms2f(hour, minute, second);
      // Meeus algorithm (JDN has fractional .5 offset included)
      let julianDay =
        utils.integerTruncation(365.25 * (year + 4716)) +
        utils.integerTruncation(30.6001 * (month + 1)) +
        day +
        B -
        1524.5;
      return julianDay + dayFraction;
    },
    /**
     * Convert a Julian Day Number (JDN) to a Gregorian calendar date with UTC time components.
     * The function takes a JDN as input, and returns an object with year, month, day, hour, minute, and second properties.
     * The function applies the timezone offset (tzOffset in hours) to obtain the local time.
     *
     * @param {number} jd - The Julian Day Number to be converted.
     * @returns {{year: number; month: number; day: number; hour: number; minute: number; second: string}} An object containing the Gregorian calendar date and UTC time components.
     * @throws {TypeError} If the given JDN is not a finite number.
     */
    jd2g(jd) {
      if (!Number.isFinite(jd)) {
        throw new TypeError("jd must be a finite number");
      }

      // Apply timezone offset (tzOffset in hours). local = UT + tzOffset
      const temp = jd + 0.5;
      const Z = utils.integerTruncation(temp);
      const F = temp - Z;
      let A = Z;
      if (Z >= 2299161) {
        const alpha = utils.integerTruncation((Z - 1867216.25) / 36524.25);
        A = Z + 1 + alpha - utils.integerTruncation(alpha / 4);
      }
      const B = A + 1524;
      const C = utils.integerTruncation((B - 122.1) / 365.25);
      const D = utils.integerTruncation(365.25 * C);
      const E = utils.integerTruncation((B - D) / 30.6001);

      // Day (integer) and fractional day
      const dayWithFrac = B - D - utils.integerTruncation(30.6001 * E) + F;
      let day = utils.integerTruncation(dayWithFrac);
      let month = E < 14 ? E - 1 : E - 13;
      let year = month > 2 ? C - 4716 : C - 4715;
      const dayFraction = dayWithFrac - day; // fraction of the day [0,1)

      // Compute time components from fractional day with millisecond precision
      let totalSeconds = dayFraction * 86400; // seconds in the fractional day
      // Round to milliseconds to avoid floating noise
      totalSeconds = Math.round(totalSeconds * 1000) / 1000;

      let hour = Math.trunc(totalSeconds / 3600);
      totalSeconds -= hour * 3600;
      let minute = Math.trunc(totalSeconds / 60);
      let second = +(totalSeconds - minute * 60).toFixed(3);

      // Normalize carries (second -> minute -> hour -> day)
      if (second >= 60) {
        second -= 60;
        minute += 1;
      }
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      if (hour >= 24) {
        hour -= 24;
        day += 1;
      }

      // Helpers for month/day overflow using appropriate leap rules
      const _isGregorian = utils.isGregorian({
        year,
        month,
        day,
      });
      const isLeap = (y, greg) =>
        greg ? y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) : y % 4 === 0;

      const daysInMonth = (y, m, greg) => {
        if (m === 2) return isLeap(y, greg) ? 29 : 28;
        if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
        return 31;
      };

      // Normalize day/month/year if day overflowed after carry
      const dim = daysInMonth(year, month, _isGregorian);
      if (day > dim) {
        day = 1;
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }

      // Final shape matches GregorianDateTime interface
      return {
        year,
        month,
        day,
        hour,
        minute,
        second,
      };
    },
  };

  return _;
})();

if (typeof window !== "undefined") {
  window.jp = jp;
} else if (
  "undefined" !== typeof module &&
  module.exports &&
  (module.exports = jp)
) {
  Object.defineProperty(exports, "__esModule", { value: true });
} else {
  global.jp = jp;
}
