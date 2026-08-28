import { HttpBackend, HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { finalize, map, Observable, shareReplay, switchMap } from "rxjs";
import { ApiClient } from "./api-client.service";

@Injectable({ providedIn: "root" })
class CsrfTokenService {
  private readonly http: HttpClient;
  private pending: Observable<string> | null = null;

  constructor(backend: HttpBackend, private readonly api: ApiClient) {
    this.http = new HttpClient(backend);
  }

  get(): Observable<string> {
    if (this.pending) return this.pending;
    this.pending = this.http.get<{ token: string }>(this.api.url("/auth/csrf"), { withCredentials: true }).pipe(
      map((response) => response.token),
      finalize(() => (this.pending = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.pending;
  }

}

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const api = inject(ApiClient);
  if (!request.url.startsWith(api.baseUrl)) return next(request);

  const credentialed = request.clone({ withCredentials: true });
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return next(credentialed);

  return inject(CsrfTokenService).get().pipe(
    switchMap((token) => next(credentialed.clone({ setHeaders: { "X-CSRF-TOKEN": token } }))),
  );
};
