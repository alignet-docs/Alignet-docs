export const PaymentStateMap = ({ locale = "es" }) => {
  const en = locale === "en";
  const t = (es, english) => en ? english : es;
  const englishStates = {
    registered: ["Registered", "Received and validated", "The transaction was received, validated and recorded in the database. It is not an authorized payment yet."],
    pending: ["Pending", "Payment in progress", "The transaction was sent to the processor for payment. Its result is still pending."],
    invalid: ["Invalid", "Could not continue", "A rule, validation or error stopped the transaction. This can happen during registration or while it is pending."],
    canceled: ["Cancelled", "Cancelled by the user", "The user cancelled the operation or attempt before authorization. This is not the same as reversing an authorized payment."],
    expired: ["Expired", "Validity period ended", "The customer did not respond within the deadline, so authorization can no longer continue. This depends on the payment method and usually applies to non-card methods."],
    authorized: ["Authorized", "Payment approved", "The payment was successful and authorized. The operation can proceed to settlement or be reversed if it meets the conditions."],
    denied: ["Declined", "Rejected by the issuer", "The issuer declined authorization. This attempt was not approved; its outcome is retained within the operation."],
    settled: ["Settled", "Submitted to the network", "The authorized operation is submitted to the card network for BASE2 processing. This does not necessarily mean funds have been deposited into the merchant's account."],
    reversed: ["Reversed", "Authorization voided", "An authorized operation is voided at the user's request during the first day and before settlement. The amount returned takes applicable administrative fees into account."]
  };
  const states = [
    { id: "registered", name: "Registrado", hint: "Recibido y validado", x: 275, y: 20, tone: "neutral", text: "La transacción llegó correctamente, se validó y quedó registrada en la base de datos. Todavía no es un pago autorizado." },
    { id: "pending", name: "Pendiente", hint: "Pago en proceso", x: 205, y: 125, tone: "wait", text: "La transacción se envió a la procesadora para realizar el pago. Aún se espera su resultado." },
    { id: "invalid", name: "Inválido", hint: "No pudo continuar", x: 435, y: 125, tone: "stop", text: "Una regla, una validación o un error detuvo la transacción. Puede ocurrir al registrarla o mientras está pendiente." },
    { id: "canceled", name: "Cancelado", hint: "El usuario canceló", x: 15, y: 255, tone: "stop", text: "El usuario canceló la operación o el intento antes de la autorización. No equivale a extornar un pago autorizado." },
    { id: "expired", name: "Expirado", hint: "Se agotó la vigencia", x: 175, y: 255, tone: "stop", text: "No hubo respuesta del cliente dentro del plazo y ya no se puede continuar con la autorización. Depende del método de pago; suele aplicar a métodos distintos de tarjeta." },
    { id: "authorized", name: "Autorizado", hint: "Pago aprobado", x: 335, y: 255, tone: "ok", text: "El pago fue exitoso y se autorizó. La operación puede continuar a liquidación o ser extornada si cumple las condiciones." },
    { id: "denied", name: "Denegado", hint: "Rechazado por el emisor", x: 495, y: 255, tone: "stop", text: "El emisor denegó la autorización. Este intento no fue aprobado; su resultado se conserva dentro de la operación." },
    { id: "settled", name: "Liquidado", hint: "Presentado a la marca", x: 255, y: 385, tone: "ok", text: "La operación autorizada se presenta a la marca para su procesamiento en BASE2. No significa necesariamente que el dinero ya esté abonado al comercio." },
    { id: "reversed", name: "Extornado", hint: "Autorización anulada", x: 435, y: 385, tone: "stop", text: "Se anula una operación autorizada durante el primer día y antes de que sea liquidada, a solicitud del usuario. La restitución considera los gastos administrativos aplicables." }
  ].map(state => en ? { ...state, name: englishStates[state.id][0], hint: englishStates[state.id][1], text: englishStates[state.id][2] } : state);
  const routes = { settled: ["registered", "pending", "authorized", "settled"], reversed: ["registered", "pending", "authorized", "reversed"], denied: ["registered", "pending", "denied"], expired: ["registered", "pending", "expired"], canceled: ["registered", "pending", "canceled"], invalid: ["registered", "invalid"], invalidPending: ["registered", "pending", "invalid"] };
  const [selected, setSelected] = useState("registered");
  const [scenario, setScenario] = useState("settled");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setReduced(media.matches); if (media.matches) setPlaying(false); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const path = routes[scenario];
    if (step >= path.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => { setStep(step + 1); setSelected(path[step + 1]); }, 3200);
    return () => clearTimeout(timer);
  }, [playing, step, scenario]);
  const goTo = next => { setPlaying(false); setStep(next); setSelected(routes[scenario][next]); };
  const choose = id => { setScenario(id); setPlaying(false); setStep(0); setSelected("registered"); };
  const active = states.find(state => state.id === selected);
  const path = routes[scenario];
  const scenarios = [
    ["settled", t("Pago aprobado", "Approved payment"), t("Hasta la liquidación", "Through settlement")],
    ["denied", t("Pago denegado", "Declined payment"), t("El emisor lo rechaza", "The issuer declines")],
    ["reversed", t("Pago extornado", "Reversed payment"), t("Se anula tras autorizar", "Voided after authorization")],
    ["canceled", t("Cancelación", "Cancellation"), t("El usuario lo detiene", "Stopped by the user")],
    ["expired", t("Expiración", "Expiration"), t("Se agota el plazo", "The deadline passes")],
    ["invalid", t("Validación fallida", "Failed validation"), t("El intento no continúa", "The attempt stops")]
  ];
  const takeaway = {
    registered: t("Recibir una transacción no significa aprobar el pago.", "Receiving a transaction does not mean approving the payment."),
    pending: t("Espera el resultado antes de considerar el pago aprobado.", "Wait for the result before treating the payment as approved."),
    authorized: t("El pago ya está aprobado. La liquidación es una etapa posterior.", "The payment is approved. Settlement is a later stage."),
    settled: t("Liquidado no confirma un abono en la cuenta del comercio.", "Settled does not confirm a deposit into the merchant's account."),
    reversed: t("Extornar requiere una autorización previa; cancelar, no.", "Reversal requires a prior authorization; cancellation does not."),
    denied: t("Este intento terminó sin autorización.", "This attempt ended without authorization."),
    canceled: t("La cancelación ocurre antes de autorizar el pago.", "Cancellation occurs before payment authorization."),
    expired: t("La expiración depende del método de pago.", "Expiration depends on the payment method."),
    invalid: t("Puede ocurrir desde Registrado o desde Pendiente.", "It can happen from Registered or Pending.")
  };
  return <div className="psg not-prose">
    <div className="psg-heading"><div><span className="psg-eyebrow">{t("EXPLORA UN PAGO", "EXPLORE A PAYMENT")}</span><h3>{t("¿Qué ocurre en cada paso?", "What happens at each step?")}</h3><div className="psg-summary">{t("Elige un escenario y sigue un solo intento, de principio a fin.", "Choose a scenario and follow one attempt from start to finish.")}</div></div><span className="psg-demo">{t("Ejemplo interactivo", "Interactive example")}</span></div>
    <div className="psg-scenarios" role="group" aria-label={t("Escenarios de pago", "Payment scenarios")}>{scenarios.map(([id, label, hint]) => <button type="button" key={id} aria-pressed={scenario === id || id === "invalid" && scenario === "invalidPending"} onClick={() => choose(id)}><strong>{label}</strong><span>{hint}</span></button>)}</div>
    <div className="psg-stage">
      <div className="psg-stage-top"><span>{t("UN INTENTO · UN RECORRIDO", "ONE ATTEMPT · ONE JOURNEY")}</span><span>{t("Paso", "Step")} {step + 1} / {path.length}</span></div>
      <ol className="psg-track">{path.map((id, index) => { const state = states.find(item => item.id === id); return <li key={id} className={(index < step ? "is-done" : index === step ? "is-current" : "") + " psg-tone-" + state.tone}><button type="button" onClick={() => goTo(index)} aria-current={index === step ? "step" : undefined}><span className="psg-dot" aria-hidden="true">{index < step ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>{state.name}</strong><small>{state.hint}</small></button></li>; })}</ol>
      <div className="psg-explanation" aria-live="polite" aria-atomic="true"><div><span className={"psg-status psg-tone-" + active.tone}>{active.name}</span><h4>{active.hint}</h4><div className="psg-description">{active.text}</div></div><aside><span>{t("QUÉ DEBES RECORDAR", "KEY TAKEAWAY")}</span><div className="psg-takeaway">{takeaway[active.id]}</div></aside></div>
      {(scenario === "invalid" || scenario === "invalidPending") && <label className="psg-invalid-choice">{t("El error también puede aparecer…", "The error can also occur…")}<select value={scenario} onChange={event => choose(event.target.value)}><option value="invalid">{t("Al registrar", "At registration")}</option><option value="invalidPending">{t("Mientras está pendiente", "While pending")}</option></select></label>}
      <div className="psg-controls"><button type="button" className="psg-play" onClick={() => { if (reduced) {goTo(step === path.length - 1 ? 0 : step + 1);return;} if (playing) {setPlaying(false);return;} if (step === path.length - 1) {setStep(0);setSelected(path[0]);} setPlaying(true); }}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>{reduced ? t("Avanzar un paso", "Advance one step") : playing ? t("Pausar", "Pause") : step === path.length - 1 ? t("Volver a reproducir", "Replay") : t("Reproducir", "Play")}</button><div><button type="button" disabled={step === 0} onClick={() => goTo(step - 1)} aria-label={t("Paso anterior", "Previous step")}>←</button><button type="button" disabled={step === path.length - 1} onClick={() => goTo(step + 1)}>{t("Siguiente", "Next")} →</button></div></div>
    </div>
    <div className="psg-legend"><strong>{t("Cómo leer el recorrido", "How to read the journey")}</strong><div className="psg-summary">{t("Cada escenario muestra una alternativa. Un intento no pasa por todos los estados.", "Each scenario shows one alternative. An attempt does not go through every state.")}</div><div className="psg-keys"><span><i className="psg-tone-neutral" />{t("Inicio", "Start")}</span><span><i className="psg-tone-wait" />{t("En proceso", "In progress")}</span><span><i className="psg-tone-ok" />{t("Autorización / liquidación", "Authorization / settlement")}</span><span><i className="psg-tone-stop" />{t("Detención / anulación", "Stopped / voided")}</span></div></div>
  </div>;
};
