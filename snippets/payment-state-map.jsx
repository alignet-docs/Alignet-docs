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
  const edges = [["registered", "pending"], ["registered", "invalid"], ["pending", "invalid"], ["pending", "canceled"], ["pending", "expired"], ["pending", "authorized"], ["pending", "denied"], ["authorized", "settled"], ["authorized", "reversed"]];
  const routes = { settled: ["registered", "pending", "authorized", "settled"], reversed: ["registered", "pending", "authorized", "reversed"], denied: ["registered", "pending", "denied"], expired: ["registered", "pending", "expired"], canceled: ["registered", "pending", "canceled"], invalid: ["registered", "invalid"] };
  const [selected, setSelected] = useState("registered");
  const [scenario, setScenario] = useState("settled");
  const [step, setStep] = useState(-1);
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
    const timer = setTimeout(() => { setStep(step + 1); setSelected(path[step + 1]); }, 1400);
    return () => clearTimeout(timer);
  }, [playing, step, scenario]);
  const advance = () => { const next = step >= routes[scenario].length - 1 ? 0 : step + 1; setStep(next); setSelected(routes[scenario][next]); };
  const active = states.find(state => state.id === selected);
  const visited = step < 0 ? [] : routes[scenario].slice(0, step + 1);
  return <div className="psm not-prose">
    <div className="psm-toolbar"><label>{t("Recorrido de ejemplo", "Example journey")}<select value={scenario} onChange={event => {setScenario(event.target.value);setStep(-1);setPlaying(false);setSelected("registered");}}><option value="settled">{t("Pago autorizado y liquidado", "Authorized and settled payment")}</option><option value="reversed">{t("Pago autorizado y extornado", "Authorized and reversed payment")}</option><option value="denied">{t("Intento denegado", "Declined attempt")}</option><option value="expired">{t("Intento expirado", "Expired attempt")}</option><option value="canceled">{t("Intento cancelado", "Cancelled attempt")}</option><option value="invalid">{t("Intento inválido", "Invalid attempt")}</option></select></label><button type="button" onClick={() => { if (reduced) {advance();return;} if (playing) {setPlaying(false);return;} if (step < 0 || step >= routes[scenario].length - 1) {setStep(0);setSelected("registered");} setPlaying(true); }}>{reduced ? t("Siguiente paso →", "Next step →") : playing ? t("Pausar", "Pause") : t("Reproducir recorrido →", "Play journey →")}</button></div>
    <div className="psm-scroll" tabIndex="0" aria-label={t("Diagrama de estados; desplázate horizontalmente en pantallas pequeñas", "State diagram; scroll horizontally on small screens")}><div className="psm-canvas">
      <svg viewBox="0 0 650 470" aria-hidden="true" className="psm-lines">{edges.map(([from, to]) => {
        const a = states.find(state => state.id === from), b = states.find(state => state.id === to), side = a.y === b.y;
        const x1 = side ? a.x + 140 : a.x + 70, y1 = side ? a.y + 31 : a.y + 62, x2 = side ? b.x : b.x + 70, y2 = side ? b.y + 31 : b.y;
        const lit = visited.indexOf(from) >= 0 && visited.indexOf(to) === visited.indexOf(from) + 1;
        return <g key={from + to} className={lit ? "psm-edge psm-edge-active" : "psm-edge"}><path d={"M" + x1 + " " + y1 + " L" + x2 + " " + y2} /><path d="M-4 -5 0 0 4 -5" transform={"translate(" + x2 + " " + y2 + ") rotate(" + (Math.atan2(y2-y1,x2-x1)*180/Math.PI-90) + ")"} /></g>;
      })}</svg>
      {states.map(state => <button type="button" key={state.id} className={"psm-node psm-" + state.tone + (selected === state.id ? " psm-selected" : "")} style={{left: state.x, top: state.y}} aria-pressed={selected === state.id} onClick={() => {setSelected(state.id);setPlaying(false);setStep(-1);}}><strong>{state.name}</strong><span>{state.hint}</span></button>)}
      <span className="psm-stage-label">{t("DESPUÉS DE AUTORIZAR · OPERACIÓN", "AFTER AUTHORIZATION · OPERATION")}</span>
    </div></div>
    <div className={"psm-detail psm-" + active.tone} aria-live="polite" aria-atomic="true"><strong>{active.name}</strong><p>{active.text}</p></div>
    <p className="psm-caption">{t("Las flechas muestran alternativas, no pasos obligatorios. La expiración y las acciones disponibles dependen del método de pago.", "Arrows show alternatives, not mandatory steps. Expiration and available actions depend on the payment method.")}</p>
  </div>;
};
