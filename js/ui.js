"use strict";
/* ---------- ui.js (toast + modal) ---------- */
const Toast = {
  show(msg, icon = "i-check"){
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<svg class="ic"><use href="#${icon}"/></svg><span>${esc(msg)}</span>`;
    $("#toastStack").appendChild(el);
    setTimeout(() => { el.classList.add("leaving"); setTimeout(() => el.remove(), 320); }, 3200);
  },
};
const Modal = {
  open({ title, body, confirmText = "Confirm", danger = false, onConfirm }){
    const scrim = $("#modalScrim");
    scrim.innerHTML = `<div class="modal" role="document">
      <h3 id="modalTitle" class="h3">${esc(title)}</h3>
      <p class="small" style="color:var(--muted-foreground)">${body}</p>
      <div style="display:flex;justify-content:flex-end;gap:.6rem;margin-top:1.4rem">
        <button class="btn btn-ghost btn-sm" data-m="cancel">Cancel</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"} btn-sm" data-m="ok">${esc(confirmText)}</button>
      </div></div>`;
    scrim.classList.add("open");
    const close = () => { scrim.classList.remove("open"); document.removeEventListener("keydown", onKey); };
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    scrim.addEventListener("click", e => { if (e.target === scrim) close(); }, { once:true });
    $('[data-m="cancel"]', scrim).onclick = close;
    $('[data-m="ok"]', scrim).onclick = () => { close(); onConfirm && onConfirm(); };
    $('[data-m="ok"]', scrim).focus();
  },
  close(){ $("#modalScrim").classList.remove("open"); },
};
