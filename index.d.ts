declare module "ptmjp" {
  export function g2jd(
    year: number,
    month: number,
    day: number,
    hour?: number | undefined,
    minute?: number | undefined,
    second?: number | undefined
  ): number;

  export function jd2g(jd: number): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  export function solarNumber(year: number): number;
  export function lunarNumber(year: number): number;
  export function indictionNumber(year: number): number;
  export function julianPeriodYearNumber(year: number): number;
}
