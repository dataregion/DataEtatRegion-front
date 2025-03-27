export interface TOrError<T> {
  data?: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: Error | any;
}
