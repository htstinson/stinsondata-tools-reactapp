{/* ── my-login-app/src/components/footer.jsx ── */}

const Footer = () => {
  const linkStyle = { color: 'var(--color-text-muted)', textDecoration: "none" };
  const onEnter = e => e.target.style.color = "#fff";
  const onLeave = e => e.target.style.color = 'var(--color-text-muted)';

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
      background: 'var(--color-footer-bg)', 
      backdropFilter: "blur(10px)",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      height: "40px", minHeight: "40px", maxHeight: "40px",
      padding: "0 2rem", overflow: "hidden",
      display: "flex", alignItems: "center", 
      justifyContent: "space-between",
      fontSize: "0.8rem"
    }}>
      <span style={{ color: 'var(--color-text-muted)', whiteSpace: "nowrap" }}>
        © {new Date().getFullYear()} Stinson Data LLC
      </span>
      <span style={{ display: "flex", gap: "1.25rem" }}>
        <a href="mailto:support@stinsondata.com" style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
          support@stinsondata.com
        </a>
        <a href="tel:+15733033724" style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
          (573) 303-3724
        </a>
      </span>
      <span style={{ display: "flex", gap: "1.25rem" }}>
        {[["Home", "/"], ["Contact", "/contact"], ["Login", "/login"]].map(([label, href]) => (
          <a key={label} href={href} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
            {label}
          </a>
        ))}
      </span>
    </div>
  );
};

export default Footer;