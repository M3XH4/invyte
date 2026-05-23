export async function safeRun<T>(
  fn: () => Promise<T>,
  fallbackMessage = 'Something went wrong.',
  onError?: (message: string, error: unknown) => void,
) {
  try {
    return await fn();
  } catch (error: any) {
    const message = error?.message || fallbackMessage;
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.error(fallbackMessage, error?.stack || error);
    }
    onError?.(message, error);
    return undefined;
  }
}
