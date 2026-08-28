import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { AuthPage } from "./auth.page";

describe("AuthPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { mode: "register" } } } },
      ],
    }).compileComponents();
  });

  it("rejects invalid email and weak password", () => {
    const page = TestBed.createComponent(AuthPage).componentInstance;
    page.form.patchValue({ email: "not-an-email", password: "weak" });

    expect(page.form.invalid).toBe(true);
    expect(page.form.controls.email.hasError("email")).toBe(true);
    expect(page.form.controls.password.invalid).toBe(true);
  });

  it("accepts the password policy used by Identity", () => {
    const page = TestBed.createComponent(AuthPage).componentInstance;
    page.form.patchValue({ email: "owner@qrportal.test", password: "StrongPass123" });

    expect(page.form.valid).toBe(true);
  });
});
