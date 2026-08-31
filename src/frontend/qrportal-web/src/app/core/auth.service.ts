import { Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, shareReplay, tap } from "rxjs";
import { ApiClient } from "./api-client.service";
import { ExternalRegistrationRequest, MeResponse, OnboardingState, RegistrationRequest, UserSession } from "./models";
import type { LoginRequest } from "./generated";

@Injectable({ providedIn: "root" })
export class AuthService {
  readonly user = signal<UserSession | null | undefined>(undefined);
  readonly onboarding = signal<OnboardingState | null>(null);
  private restoreRequest: Observable<UserSession | null> | null = null;

  constructor(private readonly api: ApiClient) {}

  restore(): Observable<UserSession | null> {
    if (this.user() !== undefined) return of(this.user() ?? null);
    if (this.restoreRequest) return this.restoreRequest;
    this.restoreRequest = this.api.http.get<MeResponse>(this.api.url("/me")).pipe(
      tap((response) => { this.user.set(response.user); this.onboarding.set(response.onboarding); }),
      map((response) => response.user),
      catchError(() => { this.user.set(null); this.onboarding.set(null); return of(null); }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.restoreRequest;
  }

  refresh(): Observable<MeResponse> {
    return this.api.http.get<MeResponse>(this.api.url("/me")).pipe(
      tap((response) => { this.user.set(response.user); this.onboarding.set(response.onboarding); }),
    );
  }

  login(email: string, password: string, rememberMe: boolean): Observable<UserSession> {
    const request: LoginRequest = { email, password, rememberMe };
    return this.api.http.post<UserSession>(this.api.url("/auth/login"), request).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  register(request: RegistrationRequest): Observable<UserSession> {
    return this.api.http.post<UserSession>(this.api.url("/auth/register"), request).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  completeGoogleRegistration(request: ExternalRegistrationRequest): Observable<UserSession> {
    return this.api.http.post<UserSession>(this.api.url("/auth/google/register"), request).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  updateProfile(fullName: string, phoneNumber: string): Observable<UserSession> {
    return this.api.http.patch<UserSession>(this.api.url("/me"), { fullName, phoneNumber }).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  logout(): Observable<void> {
    return this.api.http.post<void>(this.api.url("/auth/logout"), {}).pipe(
      tap(() => { this.user.set(null); this.onboarding.set(null); this.restoreRequest = null; }),
    );
  }
}
