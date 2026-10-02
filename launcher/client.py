"""Abis istemcisi. Once guncelleme bakar, sonra oyunu acar."""

from __future__ import annotations

import json
import urllib.request
import webbrowser

LOCAL_VERSION = "1.0.0"
MANIFEST = "https://abis-sonsuz-gece.grok.me/version.json"
FALLBACK_GAME = "https://abis-sonsuz-gece.grok.me"


def check() -> tuple[str, str, str]:
    try:
        with urllib.request.urlopen(MANIFEST, timeout=8) as res:
            data = json.loads(res.read().decode("utf-8"))
        remote = str(data.get("version") or "")
        game = str(data.get("game") or FALLBACK_GAME)
        if not remote:
            return "Sunucuya ulasilamadi. Yerel surumle devam.", game, "offline"
        if remote != LOCAL_VERSION:
            return f"Guncelleme var: {remote} (sende {LOCAL_VERSION}).", game, "update"
        return "Guncel surum.", game, "ok"
    except Exception:
        return "Sunucuya ulasilamadi. Yerel surumle devam.", FALLBACK_GAME, "offline"


def main() -> None:
    note, game, state = check()
    try:
        import tkinter as tk
    except Exception:
        print(note)
        input("Oyunu baslatmak icin Enter: ")
        webbrowser.open(game)
        return

    root = tk.Tk()
    root.title("Abis: Sonsuz Gece")
    root.geometry("720x220")
    root.configure(bg="#0b0c0e")
    tk.Label(root, text="ABIS  ·  SONSUZ GECE", fg="#e8e6e1", bg="#0b0c0e", font=("Times New Roman", 22)).pack(pady=(28, 8))
    status = tk.Label(root, text="Guncellemeler kontrol ediliyor...", fg="#8b919a", bg="#0b0c0e")
    status.pack()
    bar = tk.Canvas(root, width=420, height=16, bg="#0b0c0e", highlightthickness=0)
    bar.pack(pady=16)
    rect = bar.create_rectangle(0, 0, 40, 16, fill="#3ad4e4", width=0)

    def finish() -> None:
        status.config(text=note)
        bar.coords(rect, 0, 0, 420, 16)
        btn.config(state="normal")

    def start() -> None:
        webbrowser.open(game)

    btn = tk.Button(root, text="Oyunu Baslat", state="disabled", command=start, bg="#141518", fg="#e8e6e1")
    btn.pack()
    root.after(400, finish)
    root.mainloop()
    del state


if __name__ == "__main__":
    main()
