/* ---------- chat media: photos, videos, voice messages, round videos ---------- */
Object.assign(T.ru, { lv_attach: "Фото или видео", lv_voice: "Голосовое", lv_circle: "Кружок", lv_uploading: "Отправляется…", lv_media_gone: "Файл удалён", lv_up_fail: "Не получилось отправить файл. Попробуйте ещё раз.",
  lv_rec_cancel: "Отмена", lv_rec_send: "Отправить", lv_rec: "Запись", lv_circle_t: "Кружок", lv_circle_start: "Начать запись", lv_circle_stop: "Стоп", lv_circle_again: "Переснять", lv_circle_hint: "До 60 секунд. Смотрите в камеру.",
  lv_no_mic: "Нет доступа к микрофону. Разрешите его в настройках браузера.", lv_no_cam: "Нет доступа к камере. Разрешите её в настройках браузера.", lv_no_rec: "Этот браузер не умеет записывать. Попробуйте Chrome или Safari.",
  lv_too_big: mb => "Файл больше " + mb + " МБ", lv_report_msg: "Пожаловаться на сообщение" });
Object.assign(T.en, { lv_attach: "Photo or video", lv_voice: "Voice", lv_circle: "Round video", lv_uploading: "Sending…", lv_media_gone: "File removed", lv_up_fail: "Could not send the file. Please try again.",
  lv_rec_cancel: "Cancel", lv_rec_send: "Send", lv_rec: "Recording", lv_circle_t: "Round video", lv_circle_start: "Start recording", lv_circle_stop: "Stop", lv_circle_again: "Record again", lv_circle_hint: "Up to 60 seconds. Look at the camera.",
  lv_no_mic: "No access to the microphone. Allow it in the browser settings.", lv_no_cam: "No access to the camera. Allow it in the browser settings.", lv_no_rec: "This browser cannot record. Try Chrome or Safari.",
  lv_too_big: mb => "The file is larger than " + mb + " MB", lv_report_msg: "Report message" });
Object.assign(T.ru.lv_err, { media_off: "Отправка файлов пока недоступна.", bad_media: "Такой файл отправить нельзя.", media_big: "Файл слишком большой.", media_long: "Запись слишком длинная.", upload_gone: "Загрузка устарела, отправьте файл ещё раз.", gone: "Уже удалено." });
Object.assign(T.en.lv_err, { media_off: "Sending files is not available yet.", bad_media: "This file cannot be sent.", media_big: "The file is too large.", media_long: "The recording is too long.", upload_gone: "The upload expired, send the file again.", gone: "Already removed." });

const MIC_SVG = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const CLIP_SVG = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>';
const CIRCLE_SVG = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/></svg>';
const MB_ = 1048576, LIMITS = { photo: 10, voice: 5, video: 50, circle: 20 };
let REC = null;   // active voice recording { rec, stream, chunks, t0, timer, cancel }

const fmtDur = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function mediaButtons() {
  return `<input type="file" id="mediaFile" accept="image/*,video/*" hidden><button type="button" class="iconbtn lv-mb" data-action="lv-attach" aria-label="${esc(t("lv_attach"))}" title="${esc(t("lv_attach"))}">${CLIP_SVG}</button>`;
}
function msgBody(m) {
  const md = m.media; if (!md) return esc(m.text);
  const cap = m.text ? `<span class="lv-cap">${esc(m.text)}</span>` : "", u = md.url ? esc(md.url) : "";
  let h;
  if (!u) h = `<span class="lv-gone">${esc(t("lv_media_gone"))}</span>`;
  else if (md.kind === "photo") h = `<button type="button" class="lv-ph" data-action="lv-photo" data-src="${u}"><img src="${u}" alt="" loading="lazy"${md.w && md.h ? ` width="${md.w}" height="${md.h}"` : ""}></button>`;
  else if (md.kind === "voice") h = `<span class="lv-voice">${MIC_SVG}<audio controls preload="none" src="${u}"></audio>${md.dur ? `<span class="lv-dur">${fmtDur(md.dur)}</span>` : ""}</span>`;
  else if (md.kind === "video") h = `<video class="lv-vid" controls preload="metadata" playsinline src="${u}"></video>`;
  else h = `<button type="button" class="lv-circ" data-action="lv-circle-play" aria-label="${esc(t("lv_circle"))}"><video playsinline preload="metadata" src="${u}"></video>${md.dur ? `<span class="lv-dur">${fmtDur(md.dur)}</span>` : ""}</button>`;
  const flag = !m.me && !m.pending && md.url ? `<button type="button" class="lv-flag" data-action="lv-report-msg" data-mid="${esc(m.id)}" aria-label="${esc(t("lv_report_msg"))}" title="${esc(t("lv_report_msg"))}">${ICON.flag}</button>` : "";
  return h + cap + (m.pending ? `<span class="lv-up">${esc(t("lv_uploading"))}</span>` : "") + flag;
}
function mediaPlaying() { return $$("#msgs audio, #msgs video").some(x => !x.paused && !x.ended); }
function renderChat() {
  // do not interrupt a voice message or a video that is playing; redraw when it stops
  if (S.active && mediaPlaying()) { LV.chatDirty = true; return; }
  LV.chatDirty = false;
  renderChatCore();
  const f = $("#composer"); if (!f) return;
  if (!f.querySelector('[data-action="lv-voice"]')) {
    const send = f.querySelector('button[type="submit"]');
    (send || f).insertAdjacentHTML(send ? "beforebegin" : "beforeend", `<button type="button" class="iconbtn lv-mb" data-action="lv-circle" aria-label="${esc(t("lv_circle"))}" title="${esc(t("lv_circle"))}">${CIRCLE_SVG}</button><button type="button" class="iconbtn lv-mb" data-action="lv-voice" aria-label="${esc(t("lv_voice"))}" title="${esc(t("lv_voice"))}">${MIC_SVG}</button>`);
  }
  if (REC) recBar();
}
document.addEventListener("pause", e => { if (LV.chatDirty && e.target.closest && e.target.closest("#msgs")) setTimeout(() => { if (!mediaPlaying()) renderChat(); }, 50); }, true);
document.addEventListener("ended", e => { if (LV.chatDirty && e.target.closest && e.target.closest("#msgs")) setTimeout(() => { if (!mediaPlaying()) renderChat(); }, 50); }, true);

async function sendMedia(kind, blob, meta) {
  const id = S.active, c = id ? S.chats[id] : null; if (!c) return;
  const type = (blob.type || "").split(";")[0];
  if (blob.size > LIMITS[kind] * MB_) { toast(t("lv_too_big", LIMITS[kind])); return; }
  const local = URL.createObjectURL(blob), tmp = { id: "tmp" + Date.now(), me: true, text: "", t: Date.now(), pending: true, media: Object.assign({ kind, url: local }, meta) };
  c.msgs.push(tmp); renderChat();
  const fail = msg => { const k = c.msgs.indexOf(tmp); if (k >= 0) c.msgs.splice(k, 1); if (S.active === id) renderChat(); toast(msg); URL.revokeObjectURL(local); };
  const slot = await api("POST", "/chats/" + encodeURIComponent(id) + "/upload", Object.assign({ kind, type, size: blob.size }, meta));
  if (!slot.ok) { fail(errText(slot)); return; }
  let put;
  try { put = await fetch(slot.url, { method: "PUT", headers: { "Content-Type": type }, body: new Blob([blob], { type }) }); } catch (e) { put = null; }
  if (!put || !put.ok) { fail(t("lv_up_fail")); return; }
  const r = await api("POST", "/chats/" + encodeURIComponent(id), { media: slot.key });
  if (!r.ok) { fail(errText(r)); return; }
  const k = c.msgs.indexOf(tmp); if (k >= 0) c.msgs[k] = r.msg;
  c.last = { photo: "📷", voice: "🎤", video: "🎬", circle: "⏺" }[kind]; c.t = r.msg.t; c.from = ME.id;
  if (S.active === id) renderChat();
  setTimeout(() => URL.revokeObjectURL(local), 60000);
}
// photos are shrunk to 1600 px before sending
function shrinkPhoto(file) {
  return new Promise(res => {
    if (file.type === "image/gif") { res({ blob: file, w: 0, h: 0 }); return; }
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(u);
      cv.toBlob(b => res({ blob: b || file, w, h }), "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(u); res({ blob: file, w: 0, h: 0 }); };
    img.src = u;
  });
}
function videoDuration(file) {
  return new Promise(res => { const v = document.createElement("video"), u = URL.createObjectURL(file); v.preload = "metadata"; v.onloadedmetadata = () => { URL.revokeObjectURL(u); res({ dur: isFinite(v.duration) ? v.duration : 0, w: v.videoWidth, h: v.videoHeight }); }; v.onerror = () => { URL.revokeObjectURL(u); res({ dur: 0, w: 0, h: 0 }); }; v.src = u; });
}
async function pickedFile(file) {
  if (!file) return;
  if (file.type.startsWith("image/")) { const x = await shrinkPhoto(file); sendMedia("photo", x.blob, { w: x.w || undefined, h: x.h || undefined }); return; }
  if (file.type.startsWith("video/")) {
    if (file.size > LIMITS.video * MB_) { toast(t("lv_too_big", LIMITS.video)); return; }
    const m = await videoDuration(file); sendMedia("video", file, { dur: Math.round(m.dur) || undefined, w: m.w || undefined, h: m.h || undefined }); return;
  }
  toast(t("lv_err").bad_media);
}
function pickMime(kind) {
  if (!window.MediaRecorder) return null;
  const list = kind === "audio" ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"] : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return list.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || "";
}

/* voice: tap the mic, then send or cancel */
async function startVoice() {
  if (REC) return;
  const mime = pickMime("audio"); if (mime === null) { toast(t("lv_no_rec")); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { toast(t("lv_no_mic")); return; }
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined), chunks = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  REC = { rec, stream, chunks, t0: Date.now(), cancel: false };
  rec.onstop = () => {
    const r = REC; REC = null; clearInterval(r.timer); r.stream.getTracks().forEach(x => x.stop()); renderChat();
    if (r.cancel || !chunks.length) return;
    const blob = new Blob(chunks, { type: (rec.mimeType || mime || "audio/webm").split(";")[0] }), dur = (Date.now() - r.t0) / 1000;
    if (dur < 1) return;
    sendMedia("voice", blob, { dur: Math.round(dur) });
  };
  rec.start(250);
  REC.timer = setInterval(() => { const el = $("#recT"); if (el) el.textContent = fmtDur((Date.now() - REC.t0) / 1000); if ((Date.now() - REC.t0) > 300000) stopVoice(false); }, 250);
  recBar();
}
function stopVoice(cancel) { if (!REC) return; REC.cancel = cancel; try { REC.rec.stop(); } catch (e) {} }
function recBar() {
  const f = $("#composer"); if (!f || !REC) return;
  f.innerHTML = `<span class="lv-rec"><i class="lv-dot"></i>${esc(t("lv_rec"))} <b id="recT" class="mono">${fmtDur((Date.now() - REC.t0) / 1000)}</b></span><button type="button" class="btn ghost small" data-action="lv-rec-cancel">${esc(t("lv_rec_cancel"))}</button><button type="button" class="btn primary small" data-action="lv-rec-send">${ICON.send}${esc(t("lv_rec_send"))}</button>`;
}

/* round video: camera preview in a circle, up to 60 seconds */
async function circleSheet() {
  const mime = pickMime("video"); if (mime === null) { toast(t("lv_no_rec")); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } }, audio: { echoCancellation: true } }); } catch (e) { toast(t("lv_no_cam")); return; }
  const chat = S.active; let rec = null, chunks = [], t0 = 0, timer = null, blob = null;
  const stop = () => stream.getTracks().forEach(x => x.stop());
  openSheet(t("lv_circle_t"), `<div class="lv-cwrap"><video id="cPrev" class="lv-cprev" autoplay muted playsinline></video><svg class="lv-cring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" pathLength="100" id="cRing"/></svg></div><p class="hint" style="text-align:center" id="cHint">${esc(t("lv_circle_hint"))}</p>`,
    `<button class="btn ghost" id="cAgain" hidden>${esc(t("lv_circle_again"))}</button><button class="btn primary" id="cGo">${esc(t("lv_circle_start"))}</button>`, ov => {
      const v = ov.querySelector("#cPrev"), go = ov.querySelector("#cGo"), again = ov.querySelector("#cAgain"), ring = ov.querySelector("#cRing");
      v.srcObject = stream;
      const begin = () => {
        chunks = []; blob = null; rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 900000 } : undefined);
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => { clearInterval(timer); blob = new Blob(chunks, { type: (rec.mimeType || mime || "video/webm").split(";")[0] }); v.srcObject = null; v.src = URL.createObjectURL(blob); v.muted = false; v.loop = true; v.play().catch(() => {}); go.textContent = t("lv_rec_send"); again.hidden = false; };
        rec.start(250); t0 = Date.now(); go.textContent = t("lv_circle_stop"); again.hidden = true;
        timer = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / 60000); ring.style.strokeDasharray = (k * 100) + " 100"; if (k >= 1) rec.stop(); }, 100);
      };
      go.addEventListener("click", () => {
        if (blob) { const dur = Math.round((Date.now() - t0) / 1000); stop(); closeModal(); if (S.active !== chat) openChat(chat); sendMedia("circle", blob, { dur: Math.min(60, Math.max(1, Math.round(v.duration && isFinite(v.duration) ? v.duration : dur))) }); return; }
        if (rec && rec.state === "recording") { rec.stop(); return; }
        begin();
      });
      again.addEventListener("click", () => { if (v.src) URL.revokeObjectURL(v.src); v.removeAttribute("src"); v.srcObject = stream; v.muted = true; ring.style.strokeDasharray = "0 100"; begin(); });
      const obs = new MutationObserver(() => { if (!document.body.contains(ov)) { obs.disconnect(); clearInterval(timer); try { if (rec && rec.state === "recording") rec.stop(); } catch (e) {} stop(); } });
      obs.observe(document.body, { childList: true, subtree: true });
    });
}
function reportMsgSheet(mid) {
  const id = S.active; if (!id) return;
  const rs = t("reasons");
  openSheet(t("lv_report_msg"), `<div style="display:grid;gap:8px">${Object.keys(rs).map((k, i) => `<label class="reason"><input type="radio" name="rm" value="${k}"${i === 0 ? " checked" : ""}> ${esc(rs[k])}</label>`).join("")}</div>`,
    `<button class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button><button class="btn primary" id="rmGo">${esc(t("report_send"))}</button>`, ov => {
      ov.querySelector("#rmGo").addEventListener("click", async () => {
        const reason = (ov.querySelector('input[name="rm"]:checked') || {}).value || "toxic";
        const r = await api("POST", "/chats/" + encodeURIComponent(id) + "/report", { msg: mid, reason });
        closeModal(); toast(r.ok ? t("reported") : errText(r));
      });
    });
}
document.addEventListener("click", e => {
  const a = e.target.closest("[data-action]"); if (!a) return;
  const act = a.dataset.action, H = {
    "lv-attach": () => { const f = $("#mediaFile"); if (f) { f.value = ""; f.click(); } },
    "lv-voice": startVoice, "lv-rec-cancel": () => stopVoice(true), "lv-rec-send": () => stopVoice(false), "lv-circle": circleSheet,
    "lv-photo": () => openSheet("", `<img src="${esc(a.dataset.src)}" alt="" style="width:100%;border-radius:12px;display:block">`, ""),
    "lv-circle-play": () => { const v = a.querySelector("video"); if (!v) return; if (v.paused) { v.muted = false; v.currentTime = v.ended ? 0 : v.currentTime; v.play().catch(() => {}); a.classList.add("on"); } else { v.pause(); a.classList.remove("on"); } },
    "lv-report-msg": () => reportMsgSheet(a.dataset.mid)
  };
  if (H[act]) { e.preventDefault(); e.stopPropagation(); H[act](); }
}, true);
document.addEventListener("change", e => { if (e.target && e.target.id === "mediaFile") pickedFile(e.target.files && e.target.files[0]); });
