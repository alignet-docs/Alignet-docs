export const MigrationCheckout = ({ locale = "es" }) => {
  const sample = "378282246310005";
  const formatNumber = value => /^3[47]/.test(value) ? [value.slice(0, 4), value.slice(4, 10), value.slice(10, 15)].filter(Boolean).join(" ") : value.match(/.{1,4}/g)?.join(" ") || "";
  const testValues = () => ({ number: formatNumber(sample), expiry: "12/" + String(new Date().getFullYear() + 2).slice(-2), cvv: "1234", first: "Alex", last: "Demo", email: "alex@example.com" });
  const [language, setLanguage] = useState(locale);
  const [values, setValues] = useState({ number: "", expiry: "", cvv: "", first: "", last: "", email: "" });
  const [method, setMethod] = useState("card");
  const [phone, setPhone] = useState("900000000");
  const [approvalCode, setApprovalCode] = useState("123456");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [numberFocused, setNumberFocused] = useState(false);
  const en = language === "en";
  const t = (es, english) => en ? english : es;
  const digits = values.number.replace(/\D/g, "");
  const mastercard = /^5[1-5]/.test(digits) || (Number(digits.slice(0, 4)) >= 2221 && Number(digits.slice(0, 4)) <= 2720);
  const amex = /^3[47]/.test(digits);
  const maskedNumber = digits ? formatNumber(digits).replace(/\d(?=(?:\D*\d){4})/g, "*") : "**** **** **** ****";
  useEffect(() => {
    if (status !== "processing") return;
    const timer = setTimeout(() => { setStatus("approved"); setValues({ number: "", expiry: "", cvv: "", first: "", last: "", email: "" }); }, 1200);
    return () => clearTimeout(timer);
  }, [status]);
  const update = (key, value) => {
    if (key === "number") value = formatNumber(value.replace(/\D/g, "").slice(0, 16));
    if (key === "expiry") { const d = value.replace(/\D/g, "").slice(0, 4); value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }
    if (key === "cvv") value = value.replace(/\D/g, "").slice(0, amex ? 4 : 3);
    setValues(previous => ({ ...previous, [key]: value }));
    setError("");
  };
  const loadSample = () => {
    setValues(testValues());
    setPhone("900000000"); setApprovalCode("123456");
    setNumberFocused(false);
    setError(""); setStatus("idle");
  };
  const submit = () => {
    if (status !== "idle") return;
    if (method === "qr") { setError(""); setStatus("processing"); return; }
    if (method === "yape") {
      if (phone !== "900000000" || approvalCode !== "123456") { setError(t("Usa los datos ficticios: 900000000 y código 123456.", "Use fictional data: 900000000 and code 123456.")); return; }
      setError(""); setStatus("processing"); return;
    }
    if (digits !== sample) { setError(t("Usa «Cargar datos de prueba» para probar con la Amex ficticia.", "Use ‘Fill with test data’ to try the fictional Amex.")); return; }
    const [month, year] = values.expiry.split("/").map(Number);
    const now = new Date();
    if (!/^\d{2}\/\d{2}$/.test(values.expiry) || month < 1 || month > 12 || new Date(2000 + year, month, 1) <= now) { setError(t("Ingresa un vencimiento futuro válido (MM/AA).", "Enter a valid future expiry (MM/YY).")); return; }
    if (values.cvv.length !== 4 || !values.first.trim() || !values.last.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { setError(t("Completa los campos con datos ficticios. Código de seguridad de prueba: 1234.", "Complete the fields with fictional data. Test security code: 1234.")); return; }
    setError(""); setStatus("processing");
  };
  const field = (key, label, options = {}) => <input className="mig-field" aria-label={label} placeholder={label} value={values[key]} onChange={e => update(key, e.target.value)} autoComplete="off" spellCheck={false} disabled={status !== "idle"} maxLength={key === "email" ? 80 : 40} data-private="true" data-lpignore="true" data-1p-ignore="true" {...options} />;
  return <div className="mig-checkout-stage mig-interactive ph-no-capture" data-private="true">
    <div className="mig-demo-banner"><strong>DEMO</strong><span>{t("Datos ficticios · Sin cobros", "Fictional data · No charges")}</span></div>
    <div className="mig-checkout">
      <div className="mig-shop"><span className="mig-shop-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v10h16V10M3 7l2-4h14l2 4" /><path d="M3 7v2a3 3 0 0 0 6 0V7m0 2a3 3 0 0 0 6 0V7m0 2a3 3 0 0 0 6 0V7H3" /><path d="M9 20v-6h6v6M9 3 8 7m7-4 1 4" /></svg></span><div><strong>{t("Tu comercio", "Your store")}</strong><small>{t("Prueba la experiencia", "Try the experience")}</small></div><div className="mig-languages" aria-label={t("Idioma de la demo", "Demo language")}><button type="button" aria-pressed={!en} onClick={() => {setLanguage("es");setError("");}}>ES</button><button type="button" aria-pressed={en} onClick={() => {setLanguage("en");setError("");}}>EN</button></div></div>
      {status === "approved" ? <div className="mig-demo-success" role="status"><span className="mig-success-check" aria-hidden="true">✓</span><h3>{t("Pago de prueba aprobado", "Test payment approved")}</h3><strong>S/ 140.50</strong><p>{t("Simulación completada. No se realizó ningún cobro ni se enviaron datos de pago.", "Simulation complete. No charge was made and no payment data was sent.")}</p><button type="button" className="mig-pay" onClick={loadSample}>{t("Probar de nuevo", "Try again")}</button></div> : <div role="group" aria-label={t("Simulador de checkout", "Checkout simulator")} onKeyDown={e => { if (e.key === "Enter" && e.target.tagName === "INPUT") {e.preventDefault();submit();} }}>
        <div className="mig-method-layout">
          <nav className="mig-method-nav" aria-label={t("Métodos de la demo", "Demo payment methods")}>
            {[["card", t("Tarjeta", "Card"), <svg key="card-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg>], ["yape", "Yape", "Y"], ["qr", "QR", "▦"], ["installments", "Cuotéalo", "Ⅲ"], ["cash", "PagoEfectivo", "P"], ["bank", t("Transferencia", "Transfer"), "⌂"], ["google", "Google Pay", "G"]].map(([id, label, symbol]) => {
              const available = ["card", "yape", "qr"].includes(id);
              return <button key={id} type="button" disabled={!available || status !== "idle"} aria-pressed={method === id} aria-label={label + (!available ? t(" — no disponible en la demo", " — unavailable in this demo") : "")} title={label + (!available ? t(" · No disponible", " · Unavailable") : "")} onClick={() => {setMethod(id);setError("");setNumberFocused(false);}}><span aria-hidden="true">{id === "yape" ? <img className="mig-yape-nav-logo" src="/images/demo-yape-logo.png" alt="" /> : symbol}</span><small>{label}</small></button>;
            })}
          </nav>
          <div className="mig-method-content">
        <div className="mig-checkout-body">
          {method === "card" ? <>
          <div className={"mig-bank-card mig-card-with-chip" + (amex ? " mig-card-amex" : mastercard ? " mig-card-mastercard" : "")}>
            <div className="mig-card-top"><span>{digits ? t("TARJETA DE PRUEBA", "TEST CARD") : ""}</span>{amex ? <span className="mig-amex-mark" aria-label="American Express">AMERICAN<br />EXPRESS</span> : <span className="mig-card-brands" aria-label="Visa, Mastercard y American Express"><b>VISA</b><svg width="25" height="16" viewBox="0 0 48 30" aria-hidden="true"><circle cx="17" cy="15" r="14" fill="#eb001b" /><circle cx="31" cy="15" r="14" fill="#f79e1b" /></svg><strong>AM<br />EX</strong></span>}</div>
            <svg className="mig-card-chip" width="25" height="20" viewBox="0 0 25 20" fill="none" aria-hidden="true"><rect x=".5" y=".5" width="24" height="19" rx="4" fill="#f8f8f7" stroke="#aaa" /><path d="M9 1v5L6 8v4l3 2v5M16 1v5l3 2v4l-3 2v5M1 6h8m7 0h8M1 14h8m7 0h8M9 6h7v8H9Z" stroke="#aaa" strokeWidth=".7" /></svg>
            <div className="mig-card-number">{maskedNumber}</div><div className="mig-card-bottom"><span>{[values.first, values.last].filter(Boolean).join(" ").toUpperCase() || t("NOMBRE Y APELLIDO", "CARDHOLDER NAME")}</span><span>{values.expiry || t("MM/AA", "MM/YY")}</span></div>
          </div>
          <button className="mig-sample-button" type="button" onClick={loadSample} disabled={status !== "idle"}>{t("Cargar datos de prueba", "Fill with test data")}</button>
          {field("number", t("Número de tarjeta de prueba", "Test card number"), { inputMode: "numeric", maxLength: 19, value: digits && !numberFocused ? maskedNumber : values.number, onFocus: () => setNumberFocused(true), onBlur: () => setNumberFocused(false) })}
          <div className="mig-field-row">{field("expiry", t("MM/AA", "MM/YY"), { inputMode: "numeric", maxLength: 5 })}{field("cvv", amex ? "CID" : "CVV", { inputMode: "numeric", type: "password", maxLength: amex ? 4 : 3 })}</div>
          <div className="mig-field-row">{field("first", t("Nombre ficticio", "Fictional first name"))}{field("last", t("Apellido ficticio", "Fictional last name"))}</div>
          {field("email", t("Correo ficticio", "Fictional email"), { type: "email" })}
          </> : method === "yape" ? <div className="mig-wallet-view">
            <img className="mig-yape-logo" src="/images/demo-yape-logo.png" alt="Yape" />
            <h3>{t("Confirma tu pago con Yape", "Confirm your payment with Yape")}</h3>
            <p>{t("Vista de ejemplo · No abras tu billetera real.", "Sample view · Do not open your real wallet.")}</p>
            <label>{t("Celular ficticio", "Fictional phone number")}<input className="mig-field" inputMode="numeric" autoComplete="off" data-private="true" value={phone} maxLength={9} disabled={status !== "idle"} onChange={e => {setPhone(e.target.value.replace(/\D/g, "").slice(0,9));setError("");}} /></label>
            <label>{t("Código de prueba", "Test code")}<input className="mig-field mig-yape-code" inputMode="numeric" autoComplete="off" data-private="true" value={approvalCode} maxLength={6} disabled={status !== "idle"} onChange={e => {setApprovalCode(e.target.value.replace(/\D/g, "").slice(0,6));setError("");}} /></label>
            <p>{t("Usa 900000000 y 123456. No ingreses tu código real.", "Use 900000000 and 123456. Do not enter your real code.")}</p>
            <button className="mig-sample-button" type="button" onClick={loadSample} disabled={status !== "idle"}>{t("Restaurar datos de prueba", "Restore test data")}</button>
          </div> : <div className="mig-wallet-view mig-qr-view">
            <h3>{t("Pago con QR", "QR payment")}</h3>
            <p>{t("Así se presenta el pago desde una billetera digital.", "A preview of a digital-wallet payment.")}</p>
            <div className="mig-qr-placeholder">
              <img className="mig-qr-image" src="/images/demo-qr-reference.png" alt={t("Imagen QR de referencia para la demo", "Reference QR image for the demo")} />
            </div>
            <strong>{t("Solo demostración · No escanear", "Demo only · Do not scan")}</strong>
            <p>{t("Pulsa «Simular pago» para ver la confirmación. No se genera una orden ni un cobro real.", "Select ‘Simulate payment’ to see confirmation. No real order or charge is created.")}</p>
          </div>}
          <p className="mig-demo-error" role="alert">{error}</p>
        </div>
          </div>
        </div>
        <div className="mig-checkout-total"><span>{t("Monto de ejemplo", "Sample amount")}</span><strong>S/ 140.50</strong></div>
        <button className="mig-pay" type="button" disabled={status === "processing"} onClick={submit}>{status === "processing" ? <><span className="mig-demo-spinner" aria-hidden="true" />{t("Simulando…", "Simulating…")}</> : t("Simular pago", "Simulate payment")}</button>
        <span className="mig-sr-only" role="status">{status === "processing" ? t("Simulación en curso", "Simulation in progress") : ""}</span>
      </div>}
      <div className="mig-checkout-footer"><span>Alignet One</span><span>{t("Entorno demostrativo", "Demo environment")}</span></div>
    </div>
    <p className="mig-demo-note">{t("Prueba Tarjeta, Yape o QR. No ingreses datos reales.", "Try Card, Yape or QR. Do not enter real data.")}<br />{t("Esta demo no envía ni guarda tus datos.", "This demo does not send or save your data.")}</p>
  </div>;
};
