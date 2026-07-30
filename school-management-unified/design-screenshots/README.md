# UI Screenshot Catalog — Designer Handoff

Auto-generated labeled screenshots of the Zinat Al-Haya Kindergarten management app.

## Browse

Open **`index.html`** in a browser for a visual gallery of all captures.

## Structure (flat — 4 folders only)

```
design-screenshots/
├── index.html
├── manifest.json
├── public/          ← landing, login, subscribe, enrollment
├── admin/           ← all admin screens, modals, tabs
├── teacher/         ← teacher screens
└── parent/          ← parent portal screens
```

**No nested subfolders.** Each filename describes the screen:

| Filename pattern | Meaning |
|------------------|---------|
| `dashboard__base.png` | Main page view |
| `users__modal-add-user.png` | Add-user popup |
| `notification-templates__tab-english.png` | Tab state |
| `students--add-parent__nav-tab-…png` | Tab inside a modal |

## Label bar (top of every image)

```
[ROLE] Page Name — /route/path — variant
```

## Re-run after UI changes

```bash
cd school-management-unified
npm run screenshots   # outputs directly into the 4 flat folders
```
