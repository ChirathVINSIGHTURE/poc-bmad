export type ApiErrorShape = {
  code: string;
  message: string;
};

export function apiError(code: string, message: string): { error: ApiErrorShape } {
  return { error: { code, message } };
}

