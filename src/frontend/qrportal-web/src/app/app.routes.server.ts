import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  { path: "", renderMode: RenderMode.Prerender },
  { path: "sobre", renderMode: RenderMode.Prerender },
  { path: "como-funciona", renderMode: RenderMode.Prerender },
  { path: "clientes", renderMode: RenderMode.Prerender },
  { path: "planos", renderMode: RenderMode.Prerender },
  { path: "contato", renderMode: RenderMode.Prerender },
  { path: "**", renderMode: RenderMode.Client },
];
