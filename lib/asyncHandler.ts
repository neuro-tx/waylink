type Result<T, E = Error> = [T, null] | [null, E];
type PromiseResult<T, E> = Promise<Result<T, E>>;

export async function asyncHandler<T, E = Error>(
  promise: Promise<T>,
): PromiseResult<T, E> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}
