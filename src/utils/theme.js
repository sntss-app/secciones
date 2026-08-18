// ===== TEMA GLOBAL - Diseño glassmorphism claro (con adaptación a modo oscuro) =====
// Los colores de superficie usan variables CSS (--sn-*) definidas en index.css
// para que el modo oscuro (prefers-color-scheme) se aplique automáticamente.

export const theme = {
    // Acentos (colores fijos, funcionan en ambos modos)
    primary: '#2563EB',
    primaryStrong: '#1D4ED8',
    primaryLight: '#3B82F6',
    emerald: '#10B981',
    emeraldStrong: '#059669',
    orange: '#F97316',
    orangeStrong: '#EA580C',
    // Textos y superficies (variables → modo oscuro automático)
    text: 'var(--sn-text)',
    textMuted: 'var(--sn-text-muted)',
    surface: 'var(--sn-surface)',
    shadow: '0 12px 35px -8px rgba(15, 23, 42, 0.08)',
};

// Contenedor de cristal (header, hero, footer)
export const glass = {
    background: 'var(--sn-glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--sn-glass-border)',
    boxShadow: '0 12px 35px -8px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
};

// Tarjeta de cristal (cards, sidebars, tablas)
export const glassCard = {
    background: 'var(--sn-glass-card-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--sn-glass-card-border)',
    boxShadow: '0 8px 25px -5px rgba(30, 41, 59, 0.06)',
};

// Encabezado de página (reemplaza los héroes oscuros antiguos)
export const pageHeader = {
    ...glass,
    borderRadius: '24px',
    padding: '1.5rem 2rem',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
};

// Título de página con degradado
export const pageTitle = {
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, var(--sn-text) 30%, var(--sn-primary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};

// Botón primario (píldora)
export const primaryBtn = {
    backgroundColor: 'var(--sn-primary)',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.4rem',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '0.95rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 22px -3px rgba(37, 99, 235, 0.38)',
};

// Caja de icono de título de sección (cuadrado azul con sombra)
export const sectionIconBox = {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    backgroundColor: 'var(--sn-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: '0 8px 22px -3px rgba(37, 99, 235, 0.35)',
    flexShrink: 0,
};

// Título de sección (icono + texto + línea)
export const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--sn-text)',
    marginBottom: '1.5rem',
};

// Línea de relleno después del título de sección
export const sectionTitleLine = {
    flex: 1,
    height: '2px',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.4), transparent)',
    marginLeft: '0.5rem',
};

// Degradados para cajas de icono de calculadoras (como el mockup)
export const iconGradients = {
    blue: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    emerald: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    orange: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
};

// Sombras de color para iconos (como el mockup)
export const iconShadows = {
    blue: '0 10px 22px -3px rgba(37, 99, 235, 0.38)',
    emerald: '0 10px 22px -3px rgba(16, 185, 129, 0.38)',
    orange: '0 10px 22px -3px rgba(249, 115, 22, 0.38)',
};