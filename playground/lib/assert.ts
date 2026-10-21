/** Exact type equality (stricter than assignability). */
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

export const expect = <T extends true>() => {};
