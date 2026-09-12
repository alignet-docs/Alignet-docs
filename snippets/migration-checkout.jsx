export const MigrationCheckout = ({ locale = "es" }) => {
  const [language, setLanguage] = useState(locale);
  const [values, setValues] = useState({ number: "", expiry: "", cvv: "", first: "", last: "", email: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [numberFocused, setNumberFocused] = useState(false);
  const en = language === "en";
  const t = (es, english) => en ? english : es;
  const digits = values.number.replace(/\D/g, "");
  const amex = /^3[47]/.test(digits);
  const sample = "378282246310005";
  const formatNumber = value => [value.slice(0, 4), value.slice(4, 10), value.slice(10, 15)].filter(Boolean).join(" ");
  const maskedNumber = digits ? formatNumber(digits.slice(0, -4).replace(/./g, "•") + digits.slice(-4)) : "•••• •••••• •••••";
  useEffect(() => {
    if (status !== "processing") return;
    const timer = setTimeout(() => { setStatus("approved"); setValues({ number: "", expiry: "", cvv: "", first: "", last: "", email: "" }); }, 1200);
    return () => clearTimeout(timer);
  }, [status]);
  const update = (key, value) => {
    if (key === "number") value = formatNumber(value.replace(/\D/g, "").slice(0, 15));
    if (key === "expiry") { const d = value.replace(/\D/g, "").slice(0, 4); value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }
    if (key === "cvv") value = value.replace(/\D/g, "").slice(0, 4);
    setValues(previous => ({ ...previous, [key]: value }));
    setError("");
  };
  const loadSample = () => {
    setValues({ number: formatNumber(sample), expiry: "12/" + String(new Date().getFullYear() + 2).slice(-2), cvv: "1234", first: "Alex", last: "Demo", email: "alex@example.com" });
    setNumberFocused(false);
    setError(""); setStatus("idle");
  };
  const submit = () => {
    if (status !== "idle") return;
    if (digits !== sample) { setError(t("Usa «Cargar datos de prueba» para probar con la Amex ficticia.", "Use ‘Fill with test data’ to try the fictional Amex.")); return; }
    const [month, year] = values.expiry.split("/").map(Number);
    const now = new Date();
    if (!/^\d{2}\/\d{2}$/.test(values.expiry) || month < 1 || month > 12 || new Date(2000 + year, month, 1) <= now) { setError(t("Ingresa un vencimiento futuro válido (MM/AA).", "Enter a valid future expiry (MM/YY).")); return; }
    if (values.cvv.length !== 4 || !values.first.trim() || !values.last.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { setError(t("Completa los campos con datos ficticios. Código de seguridad de prueba: 1234.", "Complete the fields with fictional data. Test security code: 1234.")); return; }
    setError(""); setStatus("processing");
  };
  const field = (key, label, options = {}) => <input className="mig-field" aria-label={label} placeholder={label} value={values[key]} onChange={e => update(key, e.target.value)} autoComplete="off" spellCheck={false} disabled={status !== "idle"} maxLength={key === "email" ? 80 : 40} data-private="true" data-lpignore="true" data-1p-ignore="true" {...options} />;
  return <div className="mig-checkout-stage mig-interactive ph-no-capture" data-private="true">
    <div className="mig-demo-banner"><strong>{t("DEMO INTERACTIVA", "INTERACTIVE DEMO")}</strong><span>{t("Solo datos ficticios · Sin cobros", "Fictional data only · No charges")}</span></div>
    <div className="mig-checkout">
      <div className="mig-shop"><span className="mig-shop-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v10h16V10M3 7l2-4h14l2 4" /><path d="M3 7v2a3 3 0 0 0 6 0V7m0 2a3 3 0 0 0 6 0V7m0 2a3 3 0 0 0 6 0V7H3" /><path d="M9 20v-6h6v6M9 3 8 7m7-4 1 4" /></svg></span><div><strong>{t("Tu comercio", "Your store")}</strong><small>{t("Prueba la experiencia", "Try the experience")}</small></div><div className="mig-languages" aria-label={t("Idioma de la demo", "Demo language")}><button type="button" aria-pressed={!en} onClick={() => {setLanguage("es");setError("");}}>ES</button><button type="button" aria-pressed={en} onClick={() => {setLanguage("en");setError("");}}>EN</button></div></div>
      {status === "approved" ? <div className="mig-demo-success" role="status"><span className="mig-success-check" aria-hidden="true">✓</span><h3>{t("Pago de prueba aprobado", "Test payment approved")}</h3><strong>S/ 140.50</strong><p>{t("Simulación completada. No se realizó ningún cobro ni se enviaron datos de pago.", "Simulation complete. No charge was made and no payment data was sent.")}</p><button type="button" className="mig-pay" onClick={() => {setStatus("idle");setError("");}}>{t("Probar de nuevo", "Try again")}</button></div> : <div role="group" aria-label={t("Simulador de checkout", "Checkout simulator")} onKeyDown={e => { if (e.key === "Enter" && e.target.tagName === "INPUT") {e.preventDefault();submit();} }}>
        <div className="mig-checkout-body">
          <div className={"mig-bank-card" + (amex ? " mig-card-amex" : "")}><div className="mig-card-top"><span>{t("TARJETA DE PRUEBA", "TEST CARD")}</span><span className="mig-amex-mark" aria-label={amex ? "American Express" : undefined}>{amex ? <>AMERICAN<br />EXPRESS</> : "▱"}</span></div><div className="mig-card-number">{maskedNumber}</div><div className="mig-card-bottom"><span>{[values.first, values.last].filter(Boolean).join(" ").toUpperCase() || t("NOMBRE Y APELLIDO", "CARDHOLDER NAME")}</span><span>{values.expiry || t("MM/AA", "MM/YY")}</span></div></div>
          <button className="mig-sample-button" type="button" onClick={loadSample} disabled={status !== "idle"}>{t("Cargar datos de prueba", "Fill with test data")}</button>
          {field("number", t("Número de tarjeta de prueba", "Test card number"), { inputMode: "numeric", maxLength: 17, value: digits && !numberFocused ? maskedNumber : values.number, onFocus: () => setNumberFocused(true), onBlur: () => setNumberFocused(false) })}
          <div className="mig-field-row">{field("expiry", t("MM/AA", "MM/YY"), { inputMode: "numeric", maxLength: 5 })}{field("cvv", "CID / CVV", { inputMode: "numeric", type: "password", maxLength: 4 })}</div>
          <div className="mig-field-row">{field("first", t("Nombre ficticio", "Fictional first name"))}{field("last", t("Apellido ficticio", "Fictional last name"))}</div>
          {field("email", t("Correo ficticio", "Fictional email"), { type: "email" })}
          <p className="mig-demo-error" role="alert">{error}</p>
        </div>
        <div className="mig-checkout-total"><span>{t("Monto de ejemplo", "Sample amount")}</span><strong>S/ 140.50</strong></div>
        <button className="mig-pay" type="button" disabled={status === "processing"} onClick={submit}>{status === "processing" ? <><span className="mig-demo-spinner" aria-hidden="true" />{t("Simulando…", "Simulating…")}</> : t("Simular pago", "Simulate payment")}</button>
        <span className="mig-sr-only" role="status">{status === "processing" ? t("Simulación en curso", "Simulation in progress") : ""}</span>
      </div>}
      <div className="mig-checkout-footer"><span>Alignet One</span><span>{t("Entorno demostrativo", "Demo environment")}</span></div>
    </div>
    <p className="mig-demo-note">{t("Carga la Amex de prueba. No ingreses datos reales.", "Load the test Amex. Do not enter real data.")}<br />{t("Esta demo no envía ni guarda tus datos.", "This demo does not send or save your data.")}</p>
  </div>;
};
