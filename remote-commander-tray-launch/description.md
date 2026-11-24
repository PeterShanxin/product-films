# Release description

## Title

Remote Commander Tray: no console window, always ready in your tray

## Body (YouTube / LinkedIn / GitHub Release / Microsoft Store trailer)

Running Desktop Commander Remote on Windows usually means keeping a PowerShell
window open all day, because closing it takes your PC offline.

Remote Commander Tray runs `desktop-commander remote` for you with no console
window and lives in the notification area instead:

- Starts when you sign in to Windows, if you turn on Launch at sign-in.
- One status icon, five states: Online, Connecting, Authentication required, Offline, Stopped.
- Restarts the agent if it crashes (5s → 15s → 30s → 60s backoff).
- Silent through ordinary reconnects. It notifies you only when you need to act,
  for example when sign-in has expired, and then you re-authenticate in one click.
- Restart, stop, re-authenticate, open logs and copy diagnostics from the right-click menu.
- Microsoft Store or single-file portable .exe, native x64 and ARM64, no admin rights.
- Never reads or stores your OAuth credentials: sign-in stays with the official CLI.

Get it:
Microsoft Store: https://apps.microsoft.com/detail/9PK9DMKPH68Q
GitHub (portable, source, MIT): https://github.com/PeterShanxin/Remote-Commander-Tray

Requirements: Windows 10 (2004+ for the Store edition, 1809+ for portable) or
Windows 11; Node.js (22.12+ for the Store edition) and the official CLI
(`npm install -g @wonderwhy-er/desktop-commander`); a Desktop Commander Remote
account. Only the portable edition can fetch a missing CLI through npx. The
interface is in English. Remote Commander Tray is an independent, free and
open-source companion, not an official Desktop Commander product.

The machine name, times and sign-in prompt in the film are an illustrative
example with fictional data. Some waits are shortened.

Music: original score arranged in code from CC0 recorded samples (VCSL and VSCO 2
Community Edition by Versilian Studios). Key sounds: "Keyboard Soundpack 1" by
unicaegames (CC0).

## Short post (X)

The window you can't close, gone. Remote Commander Tray runs Desktop Commander
Remote from your Windows tray: starts at sign-in, restarts after crashes, and
speaks up only when you need to sign in. Free on Microsoft Store and GitHub.
https://github.com/PeterShanxin/Remote-Commander-Tray
