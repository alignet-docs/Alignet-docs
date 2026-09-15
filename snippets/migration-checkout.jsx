export const MigrationCheckout = ({ locale = "es" }) => {
  const samples = { visa: "4111111111111111", mastercard: "5555555555554444", amex: "378282246310005" };
  const formatNumber = value => /^3[47]/.test(value) ? [value.slice(0, 4), value.slice(4, 10), value.slice(10, 15)].filter(Boolean).join(" ") : value.match(/.{1,4}/g)?.join(" ") || "";
  const testValues = (brand = "amex") => ({ number: formatNumber(samples[brand]), expiry: "12/" + String(new Date().getFullYear() + 2).slice(-2), cvv: brand === "amex" ? "1234" : "123", first: "María", last: "Demo", email: "maria@example.com" });
  const [language, setLanguage] = useState(locale);
  const [values, setValues] = useState(() => testValues("mastercard"));
  const [method, setMethod] = useState("card");
  const [phone, setPhone] = useState("900000000");
  const [approvalCode, setApprovalCode] = useState("123456");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [numberFocused, setNumberFocused] = useState(false);
  const [cardShine, setCardShine] = useState(0);
  const en = language === "en";
  const t = (es, english) => en ? english : es;
  const digits = values.number.replace(/\D/g, "");
  const mastercard = /^5[1-5]/.test(digits) || (Number(digits.slice(0, 4)) >= 2221 && Number(digits.slice(0, 4)) <= 2720);
  const amex = /^3[47]/.test(digits);
  const visa = /^4/.test(digits);
  const amount = "USD 140.50";
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
  const loadSample = (brand = "amex") => {
    setCardShine(previous => previous + 1);
    setValues(brand === "none" ? { number: "", expiry: "", cvv: "", first: "", last: "", email: "" } : testValues(typeof brand === "string" && samples[brand] ? brand : "amex"));
    setPhone("900000000"); setApprovalCode("123456");
    setNumberFocused(false);
    setError(""); setStatus("idle");
  };
  const submit = () => {
    if (status !== "idle") return;
    if (method === "qr" || method === "google") { setError(""); setStatus("processing"); return; }
    if (method === "yape") {
      if (phone !== "900000000" || approvalCode !== "123456") { setError(t("Usa los datos ficticios: 900000000 y código 123456.", "Use fictional data: 900000000 and code 123456.")); return; }
      setError(""); setStatus("processing"); return;
    }
    if (!Object.values(samples).includes(digits)) { setError(t("Elige Visa, Mastercard o Amex para cargar una tarjeta ficticia.", "Choose Visa, Mastercard or Amex to load a fictional card.")); return; }
    const [month, year] = values.expiry.split("/").map(Number);
    const now = new Date();
    if (!/^\d{2}\/\d{2}$/.test(values.expiry) || month < 1 || month > 12 || new Date(2000 + year, month, 1) <= now) { setError(t("Ingresa un vencimiento futuro válido (MM/AA).", "Enter a valid future expiry (MM/YY).")); return; }
    if (values.cvv !== (amex ? "1234" : "123") || !values.first.trim() || !values.last.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { setError(t("Completa los campos con datos ficticios. Código de prueba: " + (amex ? "1234." : "123."), "Complete the fields with fictional data. Test security code: " + (amex ? "1234." : "123."))); return; }
    setError(""); setStatus("processing");
  };
  const field = (key, label, options = {}) => <input className="mig-field" aria-label={label} placeholder={label} value={values[key]} onChange={e => update(key, e.target.value)} autoComplete="off" spellCheck={false} disabled={status !== "idle"} maxLength={key === "email" ? 80 : 40} data-private="true" data-lpignore="true" data-1p-ignore="true" {...options} />;
  return <div className="mig-checkout-stage mig-interactive ph-no-capture" data-private="true">
    <div className="mig-demo-banner"><strong>DEMO</strong><span>{t("Datos ficticios · Sin cobros", "Fictional data · No charges")}</span></div>
    <div className={"mig-checkout" + (status === "approved" ? " mig-checkout-approved" : "")}>
      <div className="mig-shop"><span className="mig-shop-icon"><img className="mig-store-illustration" src="/images/demo-storefront.svg" width="25" height="25" alt={t("Tienda ilustrada con toldo", "Illustrated storefront with awning")} /></span><div><strong>{t("Tu comercio", "Your store")}</strong><small>{t("Prueba la experiencia", "Try the experience")}</small></div><div className="mig-languages" aria-label={t("Idioma de la demo", "Demo language")}><button type="button" aria-pressed={!en} onClick={() => {setLanguage("es");setError("");}}>ES</button><button type="button" aria-pressed={en} onClick={() => {setLanguage("en");setError("");}}>EN</button></div></div>
      {status === "approved" ? <div className="mig-demo-success" role="status"><span className="mig-success-check" aria-hidden="true"><svg width="68" height="68" viewBox="0 0 64 64" fill="none"><path d="m15 33 11 11 24-25" pathLength="1" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></span><h3>{t("Pago de prueba aprobado", "Test payment approved")}</h3><strong>{amount}</strong><p>{t("Simulación completada. No se realizó ningún cobro ni se enviaron datos de pago.", "Simulation complete. No charge was made and no payment data was sent.")}</p><button type="button" className="mig-pay" onClick={loadSample}>{t("Probar de nuevo", "Try again")}</button></div> : <div role="group" aria-label={t("Simulador de checkout", "Checkout simulator")} onKeyDown={e => { if (e.key === "Enter" && e.target.tagName === "INPUT") {e.preventDefault();submit();} }}>
        <div className="mig-method-layout">
          <nav className="mig-method-nav" aria-label={t("Métodos de la demo", "Demo payment methods")}>
            {[["card", t("Tarjeta", "Card"), <svg key="card-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg>], ["google", "G Pay", <img key="google-icon" className="mig-google-nav-logo" src="/images/demo-google-g.svg" alt="" />], ["qr", "QR", <svg key="qr-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><path d="M12 3v3m0 6h4v4h5m-9 5v-5m4 5h5v-2M3 12h3m3 0h1m10 0h1" /><path d="M6 6h.01M18 6h.01M6 18h.01" strokeWidth="2" /></svg>], ["yape", "Yape", "Y"]].map(([id, label, symbol]) => {
              const available = ["card", "google", "qr", "yape"].includes(id);
              return <button key={id} type="button" disabled={!available || status !== "idle"} aria-pressed={method === id} aria-label={label + (!available ? t(" — no disponible en la demo", " — unavailable in this demo") : "")} title={label + (!available ? t(" · No disponible", " · Unavailable") : "")} onClick={() => {setMethod(id);setError("");setNumberFocused(false);}}><span aria-hidden="true">{id === "yape" ? <img className="mig-yape-nav-logo" src="/images/demo-yape-logo.png" alt="" /> : symbol}</span><small>{label}</small></button>;
            })}
          </nav>
          <div className="mig-method-content">
        <div className="mig-checkout-body">
          {method === "card" ? <>
          <div className={"mig-bank-card mig-card-with-chip" + (amex ? " mig-card-amex" : mastercard ? " mig-card-mastercard" : visa ? " mig-card-visa" : "")}>
            <span key={cardShine} className="mig-card-shine" aria-hidden="true" />
            <div className="mig-card-top"><span>{digits ? t("TARJETA DE PRUEBA", "TEST CARD") : ""}</span>{amex || visa || mastercard ? <span className="mig-brand-image-badge"><img className="mig-brand-image" src={amex ? "/images/demo-brand-amex-hd.png" : visa ? "/images/demo-brand-visa.svg" : "/images/demo-brand-mastercard-hd.png"} alt={amex ? "American Express" : visa ? "Visa" : "Mastercard"} /></span> : <span className="mig-card-brands">{[["visa", "Visa"], ["mastercard", "Mastercard"], ["amex", "American Express"], ["diners", "Diners Club"]].map(([brand, label]) => <img key={brand} className="mig-brand-image-small" src={"/images/demo-brand-" + brand + (brand === "visa" ? ".svg" : brand === "amex" || brand === "mastercard" ? "-hd.png" : ".png")} alt={label} />)}</span>}</div>
            <img className="mig-card-chip mig-card-chip-image" src="/images/demo-card-chip.png" width="26" height="20" alt="" aria-hidden="true" />
            <div className="mig-card-number">{maskedNumber}</div><div className="mig-card-bottom"><span>{[values.first, values.last].filter(Boolean).join(" ").toUpperCase() || t("NOMBRE Y APELLIDO", "CARDHOLDER NAME")}</span><span>{values.expiry || t("MM/AA", "MM/YY")}</span></div>
          </div>
          <div className="mig-test-cards" role="group" aria-label={t("Cargar tarjeta de prueba", "Load a test card")}><span>{t("Cargar tarjeta de prueba:", "Load a test card:")} </span>{[["visa", "Visa"], ["mastercard", "Mastercard"], ["amex", "Amex"], ["none", t("sin tarjeta", "no card")]].map(([brand, label], index) => <span key={brand}>{index > 0 && ", "}<button type="button" disabled={status !== "idle"} aria-pressed={brand === "none" ? !digits : digits === samples[brand]} onClick={() => loadSample(brand)}>{label}</button></span>)}</div>
          {field("number", t("Número de tarjeta de prueba", "Test card number"), { inputMode: "numeric", maxLength: 19, value: digits && !numberFocused ? maskedNumber : values.number, onFocus: () => setNumberFocused(true), onBlur: () => setNumberFocused(false) })}
          <div className="mig-field-row">{field("expiry", t("MM/AA", "MM/YY"), { inputMode: "numeric", maxLength: 5 })}{field("cvv", amex ? "CID" : "CVV", { inputMode: "numeric", type: "password", maxLength: amex ? 4 : 3 })}</div>
          <div className="mig-field-row">{field("first", t("Nombre ficticio", "Fictional first name"))}{field("last", t("Apellido ficticio", "Fictional last name"))}</div>
          {field("email", t("Correo ficticio", "Fictional email"), { type: "email" })}
          </> : method === "google" ? <div className="mig-wallet-view mig-google-view">
            <img className="mig-google-logo" src="/images/demo-google-pay.png" alt="Google Pay" />
            <h3>{t("Paga con Google Pay", "Pay with Google Pay")}</h3>
            <p>{t("Usa tus tarjetas guardadas en tu cuenta de Google.", "Use the cards saved in your Google account.")}</p>
            <div className="mig-google-brands">{[["visa", "Visa"], ["mastercard", "Mastercard"], ["amex", "American Express"], ["diners", "Diners Club"]].map(([brand, label]) => <img key={brand} src={"/images/demo-brand-" + brand + (brand === "visa" ? ".svg" : brand === "amex" || brand === "mastercard" ? "-hd.png" : ".png")} alt={label} />)}</div>
            <small>{t("Solo simulación. No se conectará tu cuenta de Google.", "Simulation only. Your Google account will not be connected.")}</small>
          </div> : method === "yape" ? <div className="mig-wallet-view">
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
        <div className="mig-checkout-total"><span>{t("Monto de ejemplo", "Sample amount")}</span><strong>{amount}</strong></div>
        <button className={"mig-pay mig-pay-sequence" + (method === "google" ? " mig-google-pay" : "")} type="button" disabled={status === "processing"} onClick={submit}>{method === "card" && status === "idle" && <span key={cardShine} className="mig-pay-shine" aria-hidden="true" />}{status === "processing" ? <><span className="mig-demo-spinner" aria-hidden="true" />{t("Simulando…", "Simulating…")}</> : <span className="mig-pay-label">{method === "google" ? t("Simular pago con G Pay", "Simulate payment with G Pay") : t("Simular pago", "Simulate payment")}</span>}</button>
        <span className="mig-sr-only" role="status">{status === "processing" ? t("Simulación en curso", "Simulation in progress") : ""}</span>
      </div>}
      <div className="mig-checkout-footer"><span>Alignet One</span><span>{t("Entorno demostrativo", "Demo environment")}</span></div>
    </div>
    <p className="mig-demo-note">{t("Prueba Tarjeta, G Pay, QR o Yape. No ingreses datos reales.", "Try Card, G Pay, QR or Yape. Do not enter real data.")}<br />{t("Esta demo no envía ni guarda tus datos.", "This demo does not send or save your data.")}</p>
  </div>;
};
