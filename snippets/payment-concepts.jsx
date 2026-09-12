export const OperationDemo = ({ locale = "es" }) => {
  const [step, setStep] = useState(0);
  const en = locale === "en";
  const t = (es, english) => en ? english : es;
  const attempts = [
    { id: "TX-01", method: "Visa", state: "DENEGADO", reason: t("Primer intento rechazado", "First attempt declined") },
    { id: "TX-02", method: "Mastercard", state: "DENEGADO", reason: t("Segundo intento rechazado", "Second attempt declined") },
    { id: "TX-03", method: "Yape", state: "AUTORIZADO", reason: t("Pago autorizado y confirmado en este ejemplo", "Payment authorized and confirmed in this example") }
  ];
  const descriptions = [t("La sesión de compra está identificada. Todavía no hay intentos en este ejemplo.", "The purchase session is identified. There are no attempts yet in this example."), t("El intento con Visa fue rechazado. Conserva su resultado: no representa otra compra.", "The Visa attempt was declined. Keep its result: it is not another purchase."), t("Hay dos intentos rechazados dentro de la misma operación. No son dos pedidos fallidos.", "Two declined attempts belong to the same operation. They are not two failed orders."), t("El tercer intento se autoriza. Son tres transacciones y una sola compra pagada, no tres ventas.", "The third attempt is authorized. There are three transactions and one paid purchase, not three sales.")];
  return <div className="pc-demo not-prose">
    <div className="pc-demo-heading"><span>{t("EJEMPLO INTERACTIVO", "INTERACTIVE EXAMPLE")}</span><span>{step} / 3</span></div>
    <div className="pc-operation"><div><small>{t("OPERACIÓN · SESIÓN DE COMPRA", "OPERATION · PURCHASE SESSION")}</small><strong>OP-1001 <span>· S/ 50.00</span></strong><p>{t("Pedido de tu tienda", "Your store order")}: PED-1001</p></div><span className={"pc-badge " + (step === 3 ? "pc-ok" : "pc-pending")}>{step === 3 ? "AUTORIZADO" : step === 0 ? "REGISTRADO" : "PENDIENTE"}</span></div>
    <ol className="pc-attempts">{attempts.slice(0, step).map(a => <li key={a.id}><span className="pc-branch" aria-hidden="true">↳</span><div><strong>{a.id} · {a.method}</strong><p>{a.reason}</p></div><span className={"pc-badge " + (a.state === "AUTORIZADO" ? "pc-ok" : "pc-error")}>{a.state}</span></li>)}</ol>
    {step === 0 && <p className="pc-empty">{t("Los intentos aparecerán aquí, dentro de la operación.", "Attempts will appear here, inside the operation.")}</p>}
    <div className="pc-totals"><span><strong>1</strong> {t("operación", "operation")}</span><span><strong>{step}</strong> {t("transacciones", "transactions")}</span><span><strong>{step === 3 ? "S/ 50.00" : "S/ 0.00"}</strong> {t("pago confirmado en el ejemplo", "confirmed payment in this example")}</span></div>
    <p className="pc-explanation" role="status">{descriptions[step]}</p>
    <div className="pc-controls"><button type="button" onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step === 3}>{step === 0 ? t("1. Intentar con Visa", "1. Try Visa") : step === 1 ? t("2. Reintentar con Mastercard", "2. Retry with Mastercard") : step === 2 ? t("3. Pagar con Yape", "3. Pay with Yape") : t("Ejemplo completado", "Example complete")}</button><button type="button" className="pc-reset" onClick={() => setStep(0)}>{t("Reiniciar", "Reset")}</button></div>
    <p className="pc-caption">{t("IDs y recorrido ilustrativos; no representan todas las transiciones posibles. No se ejecutan pagos.", "Illustrative IDs and journey; not every possible transition is represented. No payments are executed.")}</p>
  </div>;
};

export const StateExplorer = ({ locale = "es" }) => {
  const [selected, setSelected] = useState(0);
  const en = locale === "en";
  const t = (es, english) => en ? english : es;
  const scenarios = [
    { label: t("QR generado", "QR generated"), state: "PENDIENTE", tone: "pc-pending", answer: t("Todavía no hay pago confirmado.", "There is no confirmed payment yet."), detail: t("La petición fue procesada y el QR está disponible, pero el cliente aún debe pagar. Espera la confirmación o consulta desde tu backend.", "The request was processed and the QR is available, but the customer still needs to pay. Wait for confirmation or query from your backend.") },
    { label: t("Intento rechazado", "Declined attempt"), state: "DENEGADO", tone: "pc-error", answer: t("Este intento no pagó la compra.", "This attempt did not pay for the purchase."), detail: t("Conserva el rechazo en esta transacción. No cierres toda la compra por inferencia: revisa la operación y los demás intentos antes de ofrecer un nuevo pago.", "Keep the decline on this transaction. Do not infer that the whole purchase is closed: check the operation and other attempts before offering another payment.") },
    { label: t("Pago autorizado", "Authorized payment"), state: "AUTORIZADO", tone: "pc-ok", answer: t("La transacción fue autorizada.", "The transaction was authorized."), detail: t("Valida desde backend la operación, el importe, la moneda y el intento. La autorización no demuestra que el dinero ya fue abonado en la cuenta bancaria del comercio.", "Validate the operation, amount, currency and attempt from your backend. Authorization does not prove that funds have reached the merchant bank account.") },
    { label: t("Pago extornado", "Voided payment"), state: "EXTORNADO", tone: "pc-neutral", answer: t("La autorización anterior fue anulada.", "The previous authorization was voided."), detail: t("No sigas tratando ese intento como un pago vigente solo porque antes estuvo autorizado. Conserva el historial y concilia el resultado actualizado.", "Do not keep treating that attempt as a valid payment just because it was previously authorized. Keep the history and reconcile the updated result.") }
  ];
  const s = scenarios[selected];
  return <div className="pc-demo not-prose"><div className="pc-demo-heading"><span>{t("MISMA RESPUESTA TÉCNICA. DISTINTO RESULTADO DE PAGO.", "SAME TECHNICAL RESPONSE. DIFFERENT PAYMENT OUTCOME.")}</span></div><div className="pc-scenarios" role="group" aria-label={t("Escenarios de transacción", "Transaction scenarios")}>{scenarios.map((x,i)=><button key={x.state} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}>{x.label}</button>)}</div><div className="pc-state-facts"><div><small>meta.status.code</small><strong>00</strong><span>{t("Petición procesada", "Request processed")}</span></div><div><small>transaction.state</small><strong className={"pc-badge "+s.tone}>{s.state}</strong><span>{t("Resultado del intento", "Attempt outcome")}</span></div></div><div className="pc-explanation" role="status"><strong>{s.answer}</strong><p>{s.detail}</p></div><p className="pc-caption">{t("Ejemplos simplificados de interpretación, no respuestas completas ni una secuencia obligatoria de estados.", "Simplified interpretation examples, not complete responses or a mandatory state sequence.")}</p></div>;
};
