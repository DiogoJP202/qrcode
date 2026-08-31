import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiProblem } from "./models";

@Injectable({ providedIn: "root" })
export class ApiClient {
  // A API é sempre consumida na mesma origem do frontend: em desenvolvimento pelo
  // proxy.conf.json e em produção pelo rewrite da hospedagem. Manter o caminho relativo
  // preserva os cookies HttpOnly `SameSite=Lax`, que não seriam enviados entre sites.
  readonly baseUrl = "/api/v1";

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
