import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideQrCode } from "@lucide/angular";

@Component({
  selector: "app-brand",
  imports: [RouterLink, LucideQrCode],
  template: `
    <a routerLink="/" class="inline-flex items-center gap-2.5 font-extrabold tracking-[-0.035em] text-ink" aria-label="QRPortal — início">
      <span class="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_7px_20px_rgba(22,182,93,.24)]">
        <svg lucideQrCode size="20" strokeWidth="2.4" aria-hidden="true"></svg>
      </span>
      <span class="text-xl">QR<span class="text-brand-600">Portal</span></span>
    </a>
  `,
})
export class BrandComponent {}
