import { useState, useEffect, useRef } from "react";

// ── Icons (inline SVG) ──────────────────────────────────────────────
const IconQR = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3.5" y="3.5" width="3" height="3" fill="currentColor"/>
    <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="13.5" y="3.5" width="3" height="3" fill="currentColor"/>
    <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3.5" y="13.5" width="3" height="3" fill="currentColor"/>
    <rect x="12" y="12" width="2.5" height="2.5" fill="currentColor" rx="0.5"/>
    <rect x="16" y="12" width="2" height="2" fill="currentColor" rx="0.5"/>
    <rect x="12" y="16" width="2" height="2" fill="currentColor" rx="0.5"/>
    <rect x="15.5" y="15.5" width="2.5" height="2.5" fill="currentColor" rx="0.5"/>
  </svg>
);

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" fill="#22C55E" fillOpacity="0.12"/>
    <path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="#FBBF24">
    <path d="M7 1l1.5 4h4.2L9.6 7.5l1.3 4L7 9.2 3.1 11.5l1.3-4L1.3 5h4.2L7 1z"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 1C4.134 1 1 4.134 1 8c0 1.26.33 2.44.9 3.46L1 15l3.63-.87A7 7 0 108 1zm0 12.6a5.6 5.6 0 11.001-11.2A5.6 5.6 0 018 13.6zm2.95-4.13c-.16-.08-1-.49-1.15-.54-.15-.06-.26-.08-.37.08-.11.16-.43.54-.52.65-.1.11-.2.12-.36.04-.16-.08-.68-.25-1.3-.8a4.9 4.9 0 01-.9-1.12c-.1-.16-.01-.25.07-.33.07-.07.16-.18.24-.28.08-.09.1-.16.16-.27.05-.11.03-.2-.01-.28-.04-.08-.37-.9-.51-1.23-.13-.32-.27-.28-.37-.28h-.31c-.11 0-.29.04-.44.2-.15.16-.58.57-.58 1.38 0 .82.59 1.61.67 1.72.08.11 1.17 1.78 2.82 2.5.4.17.7.27.94.35.4.12.76.1 1.04.07.32-.05 1-.41 1.14-.8.14-.4.14-.73.1-.8-.04-.07-.14-.11-.3-.19z" fill="currentColor"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="11.5" cy="4.5" r="0.75" fill="currentColor"/>
  </svg>
);

const IconLocation = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5a4.5 4.5 0 014.5 4.5c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const IconStar2 = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5l1.7 4.5H14l-3.5 2.5 1.3 4.3L8 10l-3.8 2.8 1.3-4.3L2 6h4.3L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 7v6M5 5v0M9 13V9.5C9 8.7 9.7 8 10.5 8s1.5.7 1.5 1.5V13M9 7v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ── QR Code Visual ──────────────────────────────────────────────────
const QRCodeVisual = ({ size = 120, color = "#111827" }: { size?: number; color?: string }) => {
  // 7x7 grid representing a simplified QR code pattern
  const pattern = [
    [1,1,1,1,1,1,1, 0, 1,0,1,0,1, 0, 1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1, 0, 0,1,0,1,0, 0, 1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1, 0, 1,0,0,0,1, 0, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0, 0,0,1,0,0, 0, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0, 1,1,0,1,1, 0, 1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1, 0, 0,1,0,0,0, 0, 1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1, 0, 1,0,1,0,1, 0, 1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1, 0, 0,1,1,0,1, 0, 1,0,0,1,1,0,1],
    [0,1,0,0,1,1,0, 0, 1,0,0,1,0, 0, 0,1,1,0,0,1,0],
    [1,1,1,0,1,0,1, 0, 0,1,0,0,1, 0, 1,0,1,1,0,0,1],
    [0,0,0,1,0,1,0, 0, 1,1,1,0,0, 0, 0,1,0,0,1,1,0],
    [1,0,1,0,1,1,1, 0, 0,0,1,1,0, 0, 1,1,1,0,1,0,1],
    [0,0,0,0,0,0,0, 0, 1,0,0,0,1, 0, 0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1, 0, 0,1,0,1,0, 0, 1,0,1,0,1,1,0],
    [1,0,0,0,0,0,1, 0, 1,0,1,0,0, 0, 0,1,0,1,0,0,1],
    [1,0,1,1,1,0,1, 0, 0,0,0,1,0, 0, 1,1,1,0,0,1,0],
    [1,0,1,1,1,0,1, 0, 1,1,0,0,1, 0, 0,0,0,1,1,0,1],
    [1,0,1,1,1,0,1, 0, 0,0,1,0,0, 0, 1,0,0,0,1,1,0],
    [1,0,0,0,0,0,1, 0, 1,0,0,1,1, 0, 0,1,1,0,0,0,1],
    [1,1,1,1,1,1,1, 0, 0,1,0,0,0, 0, 1,0,1,1,0,1,0],
  ];

  const cellSize = size / 21;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, ri) =>
        row.map((cell, ci) =>
          cell ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize}
              y={ri * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill={color}
              rx={cellSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
};

// ── Phone Mockup ────────────────────────────────────────────────────
const PhoneMockup = ({ children, small = false }: { children: React.ReactNode; small?: boolean }) => (
  <div style={{
    background: "#111827",
    borderRadius: small ? 32 : 44,
    padding: small ? 8 : 12,
    boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.07)",
    width: small ? 180 : 260,
    flexShrink: 0,
  }}>
    {/* Notch */}
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
      <div style={{ width: 60, height: 6, background: "#374151", borderRadius: 3 }} />
    </div>
    <div style={{
      background: "#fff",
      borderRadius: small ? 26 : 34,
      overflow: "hidden",
      minHeight: small ? 280 : 440,
    }}>
      {children}
    </div>
  </div>
);

// ── Menu Phone Content ──────────────────────────────────────────────
const MenuContent = () => (
  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
    {/* Header */}
    <div style={{ background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)", padding: "20px 14px 14px", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, background: "#22C55E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🍔</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13 }}>Burguer House</div>
          <div style={{ color: "#9ca3af", fontSize: 10 }}>Hamburgers & Combos</div>
        </div>
      </div>
      {/* Categories */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {["Burgers", "Combos", "Bebidas", "Sobremesas"].map((cat, i) => (
          <div key={cat} style={{
            background: i === 0 ? "#22C55E" : "rgba(255,255,255,0.1)",
            color: i === 0 ? "#fff" : "#9ca3af",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>{cat}</div>
        ))}
      </div>
    </div>
    {/* Products */}
    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { name: "Classic Bacon", desc: "Pão brioche, 180g, queijo, bacon", price: "R$ 32,90", highlight: true },
        { name: "Double Smash", desc: "Duplo smash, cheddar, picles", price: "R$ 38,90" },
        { name: "Crispy Chicken", desc: "Frango crocante, alface, molho", price: "R$ 29,90" },
      ].map((item) => (
        <div key={item.name} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: item.highlight ? "#f0fdf4" : "#f9fafb",
          borderRadius: 10, padding: "8px 10px",
          border: item.highlight ? "1px solid #bbf7d0" : "1px solid transparent",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
            background: item.highlight
              ? "linear-gradient(135deg, #86efac, #22C55E)"
              : "linear-gradient(135deg, #e5e7eb, #d1d5db)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>
            {item.highlight ? "🥩" : item.name.includes("Chicken") ? "🍗" : "🍔"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#111827" }}>{item.name}</div>
            <div style={{ color: "#6b7280", fontSize: 9.5, marginTop: 1 }}>{item.desc}</div>
          </div>
          <div style={{ fontWeight: 800, color: "#22C55E", fontSize: 11, whiteSpace: "nowrap" }}>{item.price}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── Digital Card Content ────────────────────────────────────────────
const CardContent = () => (
  <div style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Banner */}
    <div style={{
      background: "linear-gradient(135deg, #0d1117 0%, #1a2332 100%)",
      padding: "28px 14px 16px",
      textAlign: "center",
      color: "#fff",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: "#22C55E",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, margin: "0 auto 10px",
      }}>✂️</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Studio Bloo</div>
      <div style={{ color: "#9ca3af", fontSize: 10.5 }}>Barbearia & Estilo</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 }}>
        {[1,2,3,4,5].map(s => <IconStar key={s} />)}
        <span style={{ color: "#9ca3af", fontSize: 9.5, marginLeft: 2 }}>4.9 (128 avaliações)</span>
      </div>
    </div>
    {/* Action buttons */}
    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
      {[
        { icon: "📅", label: "Agendar horário", primary: true },
        { icon: "💬", label: "WhatsApp" },
        { icon: "📸", label: "Instagram" },
        { icon: "📍", label: "Como chegar" },
        { icon: "⭐", label: "Avaliar no Google" },
      ].map(btn => (
        <div key={btn.label} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: btn.primary ? "#22C55E" : "#f9fafb",
          borderRadius: 10, padding: "9px 12px",
          border: btn.primary ? "none" : "1px solid #e5e7eb",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 14 }}>{btn.icon}</span>
          <span style={{
            fontWeight: 600, fontSize: 11.5,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: btn.primary ? "#fff" : "#374151",
          }}>{btn.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Navbar ──────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid #e5e7eb" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{
            width: 34, height: 34, background: "#22C55E", borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(34,197,94,0.4)", color: "#fff",
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="3.5" y="3.5" width="3" height="3" fill="white"/>
              <rect x="12" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="13.5" y="3.5" width="3" height="3" fill="white"/>
              <rect x="2" y="12" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="3.5" y="13.5" width="3" height="3" fill="white"/>
              <rect x="12" y="12" width="2.5" height="2.5" fill="white" rx="0.5"/>
              <rect x="16" y="12" width="2" height="2" fill="white" rx="0.5"/>
              <rect x="12" y="16" width="2" height="2" fill="white" rx="0.5"/>
              <rect x="15.5" y="15.5" width="2.5" height="2.5" fill="white" rx="0.5"/>
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: "#111827", letterSpacing: "-0.02em" }}>QR</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: "#22C55E", letterSpacing: "-0.02em" }}>Portal</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Recursos", "Como funciona", "Modelos", "Para quem é", "FAQ"].map(item => (
            <a key={item} className="nav-link">{item}</a>
          ))}
        </div>

        {/* CTA */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a className="nav-link" style={{ fontWeight: 600 }}>Entrar</a>
          <a className="btn-primary" style={{ padding: "9px 20px", fontSize: "0.875rem", borderRadius: 10 }}>
            Criar grátis
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#374151", padding: 4 }}
          className="mobile-menu-btn"
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "#fff", borderTop: "1px solid #e5e7eb",
          padding: "16px 24px 20px",
        }}>
          {["Recursos", "Como funciona", "Modelos", "Para quem é", "FAQ"].map(item => (
            <div key={item} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
              <a className="nav-link" style={{ fontSize: "1rem", fontWeight: 600 }}>{item}</a>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <a className="btn-ghost" style={{ justifyContent: "center" }}>Entrar</a>
            <a className="btn-primary" style={{ justifyContent: "center" }}>Criar grátis</a>
          </div>
        </div>
      )}
    </nav>
  );
};

// ── Hero ────────────────────────────────────────────────────────────
const Hero = () => (
  <section style={{
    paddingTop: 120,
    paddingBottom: 80,
    background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%)",
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Background dots */}
    <div style={{
      position: "absolute", inset: 0, opacity: 0.03,
      backgroundImage: "radial-gradient(circle, #22C55E 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      pointerEvents: "none",
    }} />

    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Left — Copy */}
        <div>
          <div className="section-label" style={{ marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, background: "#22C55E", borderRadius: "50%", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            Gratuito para começar
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
            lineHeight: 1.1, color: "#0d1117",
            letterSpacing: "-0.03em", marginBottom: 20,
          }}>
            Seu negócio a um<br />
            <span style={{ color: "#22C55E" }}>scan de distância.</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
            Crie seu cardápio digital, cartão de visitas e QR Code personalizado em poucos minutos. Sem programação e sem complicação.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
            <a className="btn-primary" style={{ fontSize: "1rem", padding: "15px 28px" }}>
              Criar minha página grátis <IconArrow />
            </a>
            <a className="btn-ghost" style={{ fontSize: "1rem" }}>
              <span>▶</span> Ver demonstração
            </a>
          </div>

          <p style={{ fontSize: "0.83rem", color: "#9ca3af" }}>
            ✓ Grátis para começar &nbsp;·&nbsp; ✓ Não precisa de cartão de crédito
          </p>
        </div>

        {/* Right — Visual */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 520 }}>
          {/* Phone */}
          <div style={{ position: "relative", zIndex: 2 }} className="float-card">
            <PhoneMockup>
              <MenuContent />
            </PhoneMockup>
          </div>

          {/* Floating cards */}
          <div className="float-card-delay" style={{
            position: "absolute", left: -30, top: "15%", zIndex: 3,
            background: "#fff", borderRadius: 14, padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb",
            minWidth: 160,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QRCodeVisual size={20} color="#22C55E" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Escaneie para acessar</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: 8, padding: 6 }}>
              <QRCodeVisual size={64} color="#111827" />
            </div>
          </div>

          <div className="float-card-delay2" style={{
            position: "absolute", right: -24, top: "20%", zIndex: 3,
            background: "#fff", borderRadius: 12, padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb",
          }}>
            <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>Acessos hoje</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: "#111827" }}>1.284</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 700 }}>↑ +23%</span>
              <span style={{ color: "#9ca3af", fontSize: 10 }}>vs. ontem</span>
            </div>
          </div>

          <div className="float-card" style={{
            position: "absolute", right: -10, bottom: "18%", zIndex: 3,
            background: "#111827", borderRadius: 12, padding: "9px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>QR atualizado</span>
            </div>
          </div>

          <div className="float-card-delay" style={{
            position: "absolute", left: -10, bottom: "22%", zIndex: 3,
            background: "#f0fdf4", borderRadius: 12, padding: "9px 14px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)", border: "1px solid #bbf7d0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>🎨</span>
              <span style={{ color: "#166534", fontWeight: 700, fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Personalize suas cores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Business Types Strip ────────────────────────────────────────────
const BusinessStrip = () => {
  const items = [
    { icon: "🍔", label: "Restaurantes" },
    { icon: "☕", label: "Cafeterias" },
    { icon: "🍕", label: "Pizzarias" },
    { icon: "✂️", label: "Barbearias" },
    { icon: "🛍️", label: "Lojas" },
    { icon: "🍰", label: "Docerias" },
    { icon: "🚚", label: "Food Trucks" },
    { icon: "💼", label: "Profissionais" },
  ];

  return (
    <section style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "28px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#9ca3af", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 18 }}>
          Feito para negócios que querem estar mais próximos de seus clientes
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px 28px" }}>
          {items.map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7, color: "#4b5563" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Features Bento ──────────────────────────────────────────────────
const Features = () => (
  <section id="recursos" style={{ padding: "96px 24px", background: "#fff" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div className="section-label" style={{ display: "inline-flex" }}>Recursos</div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Tudo o que você precisa<br />para colocar seu negócio online.
        </h2>
      </div>

      {/* Bento Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto", gap: 16 }}>
        {/* Card 1 — Large */}
        <div className="bento-card" style={{ gridColumn: "span 2", padding: 32, background: "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)", display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: 40, height: 40, background: "#22C55E", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#0d1117", marginBottom: 10 }}>Cardápio digital</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.6 }}>Organize seus produtos em categorias, adicione imagens, preços, descrições e mantenha tudo atualizado em poucos segundos.</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", width: 180 }}>
              {[
                { name: "Classic Bacon", price: "R$ 32,90", tag: "⭐" },
                { name: "Double Smash", price: "R$ 38,90", tag: "" },
                { name: "Crispy Chicken", price: "R$ 29,90", tag: "" },
              ].map((p, i) => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 10.5, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#111827" }}>{p.tag} {p.name}</div>
                  </div>
                  <div style={{ color: "#22C55E", fontWeight: 800, fontSize: 10.5 }}>{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 — QR */}
        <div className="bento-card" style={{ padding: 28, background: "#0d1117", display: "flex", flexDirection: "column" }}>
          <div style={{ width: 40, height: 40, background: "rgba(34,197,94,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <QRCodeVisual size={22} color="#22C55E" />
          </div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: 8 }}>QR Code personalizado</h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 20, flex: 1 }}>Crie um QR Code com a identidade do seu negócio e direcione seus clientes diretamente para sua página.</p>
          <div style={{ display: "flex", justifyContent: "center", background: "#fff", borderRadius: 12, padding: 12 }}>
            <QRCodeVisual size={80} color="#22C55E" />
          </div>
        </div>

        {/* Card 3 — Personalização */}
        <div className="bento-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>🎨</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0d1117", marginBottom: 8 }}>Personalização</h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 16 }}>Escolha cores, imagens, estilo e layouts para deixar a página com a cara da sua marca.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["#22C55E", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#0d1117"].map(c => (
              <div key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, boxShadow: "0 2px 6px rgba(0,0,0,0.15)", cursor: "pointer" }} />
            ))}
          </div>
        </div>

        {/* Card 4 — Cartão digital */}
        <div className="bento-card" style={{ padding: 28, background: "linear-gradient(135deg, #0d1117 0%, #1e293b 100%)" }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>💳</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: 8 }}>Cartão digital</h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 16 }}>Reúna WhatsApp, Instagram, localização e horário de funcionamento em uma única página.</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ icon: "💬", label: "WhatsApp" }, { icon: "📸", label: "Instagram" }, { icon: "📍", label: "Maps" }].map(btn => (
              <div key={btn.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{btn.icon}</span>
                <span style={{ color: "#d1d5db", fontSize: 10, fontWeight: 600 }}>{btn.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 5 — Atualização */}
        <div className="bento-card" style={{ padding: 28, background: "#f0fdf4" }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>⚡</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0d1117", marginBottom: 8 }}>Atualização instantânea</h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6 }}>Alterou um produto, preço ou informação? A página é atualizada automaticamente para todos os seus clientes.</p>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: "6px 12px", border: "1px solid #bbf7d0", fontSize: 11, fontWeight: 700, color: "#166534" }}>Editou</div>
            <div style={{ flex: 1, height: 1, background: "#22C55E" }} />
            <div style={{ background: "#22C55E", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "#fff" }}>✓ Publicado</div>
          </div>
        </div>

        {/* Card 6 — Mobile */}
        <div className="bento-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>📱</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0d1117", marginBottom: 8 }}>Funciona no celular</h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6 }}>Desenvolvido pensando primeiro na experiência de quem escaneia seu QR Code pelo smartphone.</p>
        </div>
      </div>
    </div>
  </section>
);

// ── How It Works ────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Crie sua conta", desc: "Cadastre-se gratuitamente e crie o perfil do seu negócio em minutos.", icon: "👤" },
    { num: "02", title: "Monte sua página", desc: "Adicione informações, produtos, imagens, categorias e redes sociais.", icon: "📝" },
    { num: "03", title: "Personalize", desc: "Escolha o visual, as cores e o estilo que combinam com sua marca.", icon: "🎨" },
    { num: "04", title: "Compartilhe seu QR", desc: "Baixe seu QR Code e coloque onde seus clientes possam escanear.", icon: "📲" },
  ];

  return (
    <section id="como-funciona" style={{ padding: "96px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ display: "inline-flex" }}>Como funciona</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
            Do cadastro ao QR Code<br />em poucos minutos.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: 36, left: "12.5%", right: "12.5%",
            height: 2, background: "linear-gradient(90deg, #22C55E, #bbf7d0)",
            zIndex: 0,
          }} />

          {steps.map((step, i) => (
            <div key={step.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: i === 3 ? "#22C55E" : "#fff",
                border: `2px solid ${i === 3 ? "#22C55E" : "#e5e7eb"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: i === 3 ? "0 8px 24px rgba(34,197,94,0.3)" : "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: 26,
                transition: "all 0.2s",
              }}>
                {step.icon}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "0.7rem", color: "#22C55E", letterSpacing: "0.1em", marginBottom: 6 }}>
                {step.num}
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d1117", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: "#6b7280", fontSize: "0.87rem", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Editor Preview ──────────────────────────────────────────────────
const EditorPreview = () => {
  const [primaryColor, setPrimaryColor] = useState("#22C55E");
  const [btnStyle, setBtnStyle] = useState("Arredondado");
  const [showLogo, setShowLogo] = useState(true);

  const colors = ["#22C55E", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <section style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left — Copy */}
          <div>
            <div className="section-label">Editor</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
              A sua marca,<br />do seu jeito.
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.7, marginBottom: 32 }}>
              Personalize sua página sem precisar editar código ou contratar um designer. Você altera de um lado e vê o resultado imediatamente.
            </p>

            {/* Editor Panel */}
            <div style={{ background: "#f9fafb", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#111827", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                🎨 Aparência
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, marginBottom: 8 }}>Cor principal</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {colors.map(c => (
                    <button key={c} onClick={() => setPrimaryColor(c)} style={{
                      width: 30, height: 30, borderRadius: 8, background: c, border: "none", cursor: "pointer",
                      boxShadow: primaryColor === c ? `0 0 0 3px ${c}40, 0 0 0 1.5px ${c}` : "0 2px 6px rgba(0,0,0,0.15)",
                      transform: primaryColor === c ? "scale(1.15)" : "scale(1)",
                      transition: "all 0.15s",
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, marginBottom: 8 }}>Estilo dos botões</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Arredondado", "Quadrado", "Pílula"].map(s => (
                    <button key={s} onClick={() => setBtnStyle(s)} style={{
                      padding: "5px 12px", borderRadius: 8, border: "1.5px solid",
                      borderColor: btnStyle === s ? primaryColor : "#e5e7eb",
                      background: btnStyle === s ? `${primaryColor}15` : "#fff",
                      color: btnStyle === s ? primaryColor : "#6b7280",
                      fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      transition: "all 0.15s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>Mostrar logo</div>
                <button onClick={() => setShowLogo(!showLogo)} style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: showLogo ? primaryColor : "#d1d5db",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background 0.2s",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: showLogo ? 21 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Right — Phone Preview */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="float-card">
              <PhoneMockup>
                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div style={{ background: primaryColor, padding: "20px 14px 14px", color: "#fff", textAlign: "center" }}>
                    {showLogo && (
                      <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.25)", borderRadius: 12, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍔</div>
                    )}
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Burguer House</div>
                    <div style={{ opacity: 0.8, fontSize: 10 }}>Hamburgers & Combos</div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    {[
                      { label: "Ver cardápio", primary: true },
                      { label: "WhatsApp", primary: false },
                      { label: "Como chegar", primary: false },
                    ].map(btn => (
                      <div key={btn.label} style={{
                        background: btn.primary ? primaryColor : "#f3f4f6",
                        borderRadius: btnStyle === "Pílula" ? 100 : btnStyle === "Quadrado" ? 6 : 10,
                        padding: "9px 12px", marginBottom: 7,
                        color: btn.primary ? "#fff" : "#374151",
                        fontWeight: 700, fontSize: 11.5,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textAlign: "center",
                      }}>{btn.label}</div>
                    ))}
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Dynamic QR ──────────────────────────────────────────────────────
const DynamicQR = () => (
  <section style={{ padding: "96px 24px", background: "#0d1117" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Visual */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            {/* QR with scan animation */}
            <div style={{
              background: "#fff", borderRadius: 20, padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              position: "relative", overflow: "hidden",
            }}>
              <QRCodeVisual size={160} color="#0d1117" />
              <div className="scan-line" />
            </div>
            {/* Arrows & destinations */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12, gap: 4 }}>
              <div style={{ color: "#22C55E", fontSize: 20 }}>↓</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Cardápio", icon: "🍽️" },
                  { label: "Cartão digital", icon: "💳" },
                  { label: "Mini-site", icon: "🌐" },
                ].map(dest => (
                  <div key={dest.label} style={{
                    background: "#1f2937", borderRadius: 10, padding: "8px 12px",
                    border: "1px solid #374151", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{dest.icon}</div>
                    <div style={{ color: "#d1d5db", fontSize: 10, fontWeight: 600 }}>{dest.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <div className="section-label">QR Code dinâmico</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
            Imprima uma vez.<br />
            <span style={{ color: "#22C55E" }}>Atualize quando quiser.</span>
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
            Seu QR Code continua o mesmo mesmo quando você atualiza produtos, informações ou o destino da página. Sem precisar imprimir novos QR Codes toda vez que algo mudar.
          </p>

          {[
            "Mudou o preço de um produto? Só editar.",
            "Trocou o horário de funcionamento? Já atualizado.",
            "Quer redirecionar para outra página? Sem problema.",
          ].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <span style={{ color: "#22C55E", fontSize: 11, fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ color: "#d1d5db", fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ── Use Cases ───────────────────────────────────────────────────────
const UseCases = () => {
  const cases = [
    { icon: "🪑", title: "Mesa de restaurante", desc: "QR Code no display de mesa para clientes acessarem o cardápio." },
    { icon: "🏪", title: "Balcão", desc: "Próximo ao caixa para pedidos e informações rápidas." },
    { icon: "📦", title: "Embalagem", desc: "QR Code aplicado em embalagens e sacolas do negócio." },
    { icon: "💳", title: "Cartão de visitas", desc: "Imprima seu QR Code no cartão e direcione para seu perfil." },
    { icon: "🪟", title: "Adesivo / Vitrine", desc: "Cole na janela ou vitrine do estabelecimento." },
    { icon: "📱", title: "Redes sociais", desc: "Compartilhe o link nas suas redes e Stories." },
  ];

  return (
    <section style={{ padding: "96px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ display: "inline-flex" }}>Usos</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em" }}>
            Um QR Code. Várias possibilidades.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {cases.map(c => (
            <div key={c.title} className="bento-card" style={{ padding: "24px 28px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, background: "#f0fdf4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0d1117", marginBottom: 4 }}>{c.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Digital Menu Section ────────────────────────────────────────────
const DigitalMenu = () => (
  <section style={{ padding: "96px 24px", background: "#fff" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <div className="section-label">Cardápio digital</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
            Um cardápio bonito, rápido<br />e sempre atualizado.
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
            Seus clientes visualizam produtos organizados em categorias, com imagens e preços. Você atualiza quando quiser, diretamente do celular.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Categorias organizadas (Burgers, Bebidas, Sobremesas...)",
              "Imagens e descrições para cada produto",
              "Preço normal e preço promocional",
              "Produtos em destaque",
              "Marcar como disponível ou indisponível",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconCheck />
                <span style={{ color: "#374151", fontSize: "0.9rem" }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <a className="btn-primary">Criar meu cardápio <IconArrow /></a>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhoneMockup>
            <MenuContent />
          </PhoneMockup>
        </div>
      </div>
    </div>
  </section>
);

// ── Digital Card Section ────────────────────────────────────────────
const DigitalCard = () => (
  <section style={{ padding: "96px 24px", background: "#0d1117" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", order: 1 }}>
          <PhoneMockup>
            <CardContent />
          </PhoneMockup>
        </div>
        <div style={{ order: 2 }}>
          <div className="section-label">Cartão digital</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
            Seu QRPortal pode ser o<br />
            <span style={{ color: "#22C55E" }}>cartão digital do seu negócio.</span>
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
            Centralize todas as formas de encontrar e entrar em contato com sua empresa. Perfeito para barbearias, salões, profissionais autônomos e muito mais.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "WhatsApp, Instagram e redes sociais",
              "Botão de agendamento",
              "Localização e horário de funcionamento",
              "Link para avaliação no Google",
              "Funciona para qualquer tipo de negócio",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ color: "#d1d5db", fontSize: "0.9rem" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Templates ───────────────────────────────────────────────────────
const Templates = () => {
  const [active, setActive] = useState(0);

  const templates = [
    {
      name: "Fresh",
      desc: "Claro e minimalista",
      bg: "#ffffff",
      accent: "#22C55E",
      textDark: "#0d1117",
      textLight: "#6b7280",
      headerBg: "#f0fdf4",
    },
    {
      name: "Urban",
      desc: "Escuro e moderno",
      bg: "#0d1117",
      accent: "#22C55E",
      textDark: "#ffffff",
      textLight: "#9ca3af",
      headerBg: "#1f2937",
    },
    {
      name: "Classic",
      desc: "Elegante e sofisticado",
      bg: "#fefcf8",
      accent: "#b45309",
      textDark: "#1c1917",
      textLight: "#78716c",
      headerBg: "#292524",
    },
    {
      name: "Bold",
      desc: "Cores fortes e impactante",
      bg: "#fff",
      accent: "#7c3aed",
      textDark: "#0d1117",
      textLight: "#6b7280",
      headerBg: "#7c3aed",
    },
  ];

  const t = templates[active];

  return (
    <section id="modelos" style={{ padding: "96px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label" style={{ display: "inline-flex" }}>Templates</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em" }}>
            Escolha um estilo que combine<br />com seu negócio.
          </h2>
          <p style={{ color: "#6b7280", marginTop: 8 }}>Mais modelos serão adicionados constantemente.</p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {templates.map((t, i) => (
            <button key={t.name} onClick={() => setActive(i)} style={{
              padding: "10px 20px", borderRadius: 12,
              border: `2px solid ${active === i ? "#22C55E" : "#e5e7eb"}`,
              background: active === i ? "#f0fdf4" : "#fff",
              color: active === i ? "#166534" : "#374151",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: "0.9rem",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {t.name}
              <span style={{ display: "block", fontWeight: 400, fontSize: "0.75rem", color: active === i ? "#15803d" : "#9ca3af" }}>{t.desc}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="float-card">
            <PhoneMockup>
              <div style={{ background: t.bg, minHeight: 440, fontFamily: "'Inter', sans-serif" }}>
                <div style={{ background: t.headerBg, padding: "20px 14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍔</div>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: t.name === "Urban" || t.name === "Bold" ? "#fff" : t.textDark }}>Burguer House</div>
                      <div style={{ fontSize: 10, color: t.name === "Urban" ? "#9ca3af" : "#9ca3af" }}>Hamburgers & Combos</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Burgers", "Combos", "Bebidas"].map((cat, ci) => (
                      <div key={cat} style={{
                        background: ci === 0 ? t.accent : "rgba(255,255,255,0.15)",
                        color: ci === 0 ? "#fff" : "rgba(255,255,255,0.7)",
                        borderRadius: 20, padding: "3px 10px", fontSize: 9.5, fontWeight: 600,
                      }}>{cat}</div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  {[
                    { name: "Classic Bacon", price: "R$ 32,90", highlight: true },
                    { name: "Double Smash", price: "R$ 38,90" },
                    { name: "Crispy Chicken", price: "R$ 29,90" },
                  ].map((item) => (
                    <div key={item.name} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 10px", borderRadius: 8, marginBottom: 6,
                      background: item.highlight ? `${t.accent}18` : t.name === "Urban" ? "#1f2937" : "#f9fafb",
                      border: item.highlight ? `1px solid ${t.accent}40` : "1px solid transparent",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 10.5, color: t.name === "Urban" ? "#e5e7eb" : t.textDark }}>{item.name}</span>
                      <span style={{ fontWeight: 800, fontSize: 10.5, color: t.accent }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a className="btn-ghost">Explorar modelos</a>
        </div>
      </div>
    </section>
  );
};

// ── Analytics Coming Soon ───────────────────────────────────────────
const Analytics = () => (
  <section style={{ padding: "96px 24px", background: "#fff" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fef9c3", border: "1px solid #fde68a", color: "#92400e", fontSize: "0.75rem", fontWeight: 700, borderRadius: 100, padding: "4px 12px", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
          ⏳ Em breve
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em" }}>
          Entenda como seus clientes<br />chegam até você.
        </h2>
        <p style={{ color: "#6b7280", marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
          O QRPortal está sendo preparado para ajudar você a entender como sua página é utilizada.
        </p>
      </div>

      <div style={{ background: "#f9fafb", borderRadius: 24, border: "1px solid #e5e7eb", padding: 32, maxWidth: 720, margin: "0 auto", opacity: 0.7, filter: "saturate(0.6)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Acessos totais", value: "1.284", sub: "últimos 30 dias" },
            { label: "Via QR Code", value: "840", sub: "65% do total" },
            { label: "Link direto", value: "444", sub: "35% do total" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#0d1117" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#22C55E", fontWeight: 600 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Fake chart bars */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: 12, fontWeight: 500 }}>Acessos por dia</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
            {[35, 60, 45, 80, 55, 70, 90, 65, 75, 85, 50, 95, 70, 88].map((h, i) => (
              <div key={i} style={{ flex: 1, background: `rgba(34,197,94,${0.2 + (h/100)*0.5})`, borderRadius: "3px 3px 0 0", height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Pricing ─────────────────────────────────────────────────────────
const Pricing = () => (
  <section style={{ padding: "96px 24px", background: "#fafafa" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
      <div className="section-label" style={{ display: "inline-flex" }}>Plano</div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#0d1117", letterSpacing: "-0.025em", marginBottom: 12 }}>
        Comece gratuitamente.
      </h2>
      <p style={{ color: "#6b7280", maxWidth: 480, margin: "0 auto 48px" }}>
        Estamos começando e queremos que você faça parte dessa fase do QRPortal.
      </p>

      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{
          background: "#fff", borderRadius: 24, border: "2px solid #22C55E",
          padding: "40px 36px", boxShadow: "0 8px 40px rgba(34,197,94,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0d1117" }}>QRPortal Free</span>
            <div className="badge">✨ Gratuito</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "3rem", color: "#0d1117", letterSpacing: "-0.04em" }}>R$ 0</span>
            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}> / para sempre</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
            {[
              "Criação da sua página",
              "Cardápio digital",
              "Cartão digital",
              "Cadastro de produtos",
              "QR Code personalizado",
              "Personalização visual",
              "Acesso pelo celular",
              "Atualizações ilimitadas da página",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconCheck />
                <span style={{ color: "#374151", fontSize: "0.9rem" }}>{item}</span>
              </div>
            ))}
          </div>

          <a className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "1rem" }}>
            Criar minha conta grátis <IconArrow />
          </a>

          <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 12 }}>
            Planos adicionais poderão ser oferecidos futuramente para recursos avançados.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ── FAQ ─────────────────────────────────────────────────────────────
const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: "O QRPortal é gratuito?", a: "Sim. Durante a fase inicial, você pode criar sua página, cardápio e QR Code completamente gratuito. Sem cobranças surpresa." },
    { q: "Preciso saber programação?", a: "Não. Todo o processo é feito através de uma interface simples e intuitiva. Se você sabe usar um smartphone, consegue usar o QRPortal." },
    { q: "Posso atualizar meu cardápio depois?", a: "Sim. Você poderá alterar produtos, preços, imagens e informações sempre que precisar, direto pelo celular ou computador." },
    { q: "Preciso gerar outro QR Code quando atualizar minha página?", a: "Não. As alterações na sua página podem ser feitas sem precisar substituir o QR Code já utilizado. Imprima uma vez e atualize à vontade." },
    { q: "Posso usar o QRPortal mesmo sem ter restaurante?", a: "Sim. Além de cardápios digitais, o QRPortal funciona para barbearias, salões, lojas, profissionais autônomos e qualquer tipo de negócio que queira ter uma presença digital." },
    { q: "Posso personalizar minha página?", a: "Sim. Você pode personalizar cores, imagens, estilo visual e layout. Seu negócio terá uma identidade visual própria." },
    { q: "O QR Code pode ser personalizado?", a: "Sim. A plataforma permite configurações visuais para o QR Code como cor, formato e adição de logo, para ele fazer parte da identidade da sua marca." },
  ];

  return (
    <section id="faq" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ display: "inline-flex" }}>FAQ</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#0d1117", letterSpacing: "-0.025em" }}>
            Dúvidas frequentes
          </h2>
        </div>

        {faqs.map((faq, i) => (
          <div key={i} className="accordion-item">
            <button className="accordion-btn" onClick={() => setOpen(open === i ? null : i)}>
              <span>{faq.q}</span>
              <IconChevron open={open === i} />
            </button>
            <div className="accordion-content" style={{ maxHeight: open === i ? 200 : 0 }}>
              <p style={{ color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.7, paddingBottom: 20 }}>
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Final CTA ───────────────────────────────────────────────────────
const FinalCTA = () => (
  <section style={{
    padding: "96px 24px",
    background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Background pattern */}
    <div style={{
      position: "absolute", inset: 0, opacity: 0.05,
      backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      pointerEvents: "none",
    }} />

    <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            Seu negócio já merece<br />um QRPortal.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 520, marginBottom: 32 }}>
            Crie sua página gratuitamente e transforme qualquer QR Code em uma porta de entrada para o seu negócio.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a style={{ background: "#fff", color: "#166534", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, borderRadius: 12, padding: "15px 28px", fontSize: "1rem", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "transform 0.15s" }}>
              Criar minha página grátis <IconArrow />
            </a>
            <a style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, borderRadius: 12, padding: "15px 24px", fontSize: "1rem", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              Ver demonstração
            </a>
          </div>
        </div>
        {/* QR illustration */}
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 24, padding: 28, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
            <QRCodeVisual size={120} color="#166534" />
          </div>
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: "0.78rem", fontWeight: 600, marginTop: 10 }}>
            Escaneie e acesse
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Footer ──────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: "#0d1117", color: "#9ca3af", padding: "64px 24px 32px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, background: "#22C55E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QRCodeVisual size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
              QR<span style={{ color: "#22C55E" }}>Portal</span>
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
            Seu negócio a um scan de distância.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ icon: <IconInstagram />, label: "Instagram" }, { icon: <IconLinkedIn />, label: "LinkedIn" }].map(s => (
              <button key={s.label} title={s.label} style={{
                width: 36, height: 36, borderRadius: 9, background: "#1f2937", border: "1px solid #374151",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af",
                cursor: "pointer", transition: "background 0.2s, color 0.2s",
              }}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          { title: "Produto", links: ["Recursos", "Cardápio digital", "Cartão digital", "QR Code", "Modelos"] },
          { title: "Empresa", links: ["Sobre", "Contato"] },
          { title: "Suporte", links: ["Central de ajuda", "FAQ"] },
          { title: "Legal", links: ["Termos de uso", "Política de privacidade"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff", marginBottom: 16 }}>{col.title}</div>
            {col.links.map(link => (
              <a key={link} style={{ display: "block", fontSize: "0.85rem", color: "#6b7280", marginBottom: 10, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#22C55E")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #1f2937", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: "0.82rem" }}>© 2025 QRPortal. Todos os direitos reservados.</span>
        <span style={{ fontSize: "0.82rem" }}>Feito com ♥ para pequenos negócios</span>
      </div>
    </div>
  </footer>
);

// ── App ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <main>
        <Hero />
        <BusinessStrip />
        <Features />
        <HowItWorks />
        <EditorPreview />
        <DynamicQR />
        <UseCases />
        <DigitalMenu />
        <DigitalCard />
        <Templates />
        <Analytics />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
