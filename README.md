# 🟦 Traecord

**Traecord** is a lightweight and powerful Visual Studio Code (made for Trae) extension that brings your code presence to life — directly on Discord.

Display what you're working on in real time: file names, programming languages, and workspace info. Whether you're focused, exploring settings, or just idling, Traecord keeps your Discord status in sync with your coding.

---

## ✨ Features

- 🎯 **File Detection**  
  Automatically shows the current file name and language you're working on.

- 🗂 **Workspace Awareness**  
  Displays the name of your active workspace/project.

- ⚙️ **Smart Status**  
  - “Idling” when no file is open.
  - “Editing” when you're working on a file.

- 🎨 **Rich Presence Icons**  
  Automatically detects language-specific icons from a customizable asset folder.

- 🧠 **Minimal & Non-intrusive**  
  Updates your status in the background — no distractions.

---

## ⚙️ Configuration

Access settings through `Preferences → Settings → Extensions → Traecord` or edit via `settings.json`:

```json
"traecord.showFileName": true,
"traecord.showWorkspace": true
