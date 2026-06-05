// Shared so both the real fetch wrapper (api.ts) and the mock layer (mocks/) can
// throw the same type — components check `err instanceof ApiError`.
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}
