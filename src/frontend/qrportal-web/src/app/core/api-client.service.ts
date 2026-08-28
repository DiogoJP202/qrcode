import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiProblem } from "./models";

@Injectable({ providedIn: "root" })
export class ApiClient {
  readonly baseUrl = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/api/v1"
    : "https://api.qrportal.com/api/v1";

  constructor(readonly http: HttpClient) {}

  url(path: string): string { return `${this.baseUrl}${path}`; }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ApiProblem | undefined;
    return problem?.errors?.[0] ?? problem?.detail ?? problem?.title ?? "Não foi possível concluir. Tente novamente.";
  }
  return "Não foi possível concluir. Tente novamente.";
}
