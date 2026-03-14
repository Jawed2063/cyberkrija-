# ⚔ CyberForge Ultra

> **The most comprehensive interactive cybersecurity tools reference.**

A fully offline-capable single-page application featuring **133+ real-world cybersecurity tools**, **20+ interactive guided labs**, curated resources, and a cyberpunk UI — built for security professionals, students, and CTF players.

---

## 🚀 Features

| Feature | Detail |
|---|---|
| 🛠 **133+ Tools** | Real tools with descriptions, difficulty, commands, tags |
| 🔬 **20+ Interactive Labs** | Step-through terminal simulations with real commands |
| 🔍 **Live Search** | Filter by name, description, or tag instantly |
| 📂 **Category Sidebar** | Browse by Information Gathering, Web, Exploitation, Forensics… |
| 💡 **Tool Modal** | Click any tool for full details + copy-able commands |
| 🌙 **Dark / Light Theme** | Toggle between cyberpunk dark and clean light mode |
| 📶 **Offline / PWA** | Service worker caches all assets for offline use |
| 🟩 **Matrix Rain** | Animated canvas background |
| 📚 **Resources Page** | Platforms, certs, CVE sites, vulnerable labs |

---

## 📁 File Structure

```
cyberkrija-/
├── index.html          # SPA shell
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline support)
├── assets/
│   ├── styles.css      # Cyberpunk dark theme + responsive layout
│   ├── app.js          # All UI logic — search, modals, labs, routing
│   └── matrix.js       # Matrix rain canvas animation
└── data/
    ├── tools.json      # 133+ cybersecurity tools dataset
    ├── labs.json       # 20+ interactive lab definitions
    └── provenance.md   # Data sources and attribution
```

---

## 🖥 Usage

Just open `index.html` in any modern browser — no build step, no dependencies, no server required.

```bash
# Option 1 — open directly
open index.html

# Option 2 — serve locally (recommended for PWA / service worker)
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## 🔬 Tool Categories

- Information Gathering · Web Application · Exploitation
- Password Attacks · Vulnerability Scanning · Wireless
- Sniffing & Spoofing · Forensics · Reverse Engineering
- Social Engineering · Cryptography · Steganography

---

## ⚠ Disclaimer

All tools and techniques documented here are for **authorized security testing and educational purposes only**.
Never use these tools on systems you do not own or do not have explicit written permission to test.

---

## 📄 Data Provenance

See [`data/provenance.md`](data/provenance.md) for sources and attribution.
