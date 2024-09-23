import { GoFuncs } from "./goFuncs";

declare global {
  export interface Window extends GoFuncs {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Go: any;
  }
}

export { };
