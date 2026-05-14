# App Store Screenshots — Drop Files Here

Place your 5 real Clinical Edge app screenshots in this folder with the **exact filenames** below.
PNG or JPG both work — the composition scales to fit automatically.

| Filename           | Which screen to capture                                          |
|--------------------|------------------------------------------------------------------|
| `home.png`         | Home screen — scenario typed in input box, before submitting     |
| `urgency.png`      | Response — Urgency badge + "What this could be" cards            |
| `assessments.png`  | Response — "What to assess next" + "Possible concerns" cards     |
| `actions.png`      | Response — action buttons + "Anything change?" dark panel        |
| `sbar.png`         | SBAR handoff draft screen                                        |

Use the real screenshots you attached in the conversation — save each one with the filename above.

## After placing files
```bash
cd my-video
npm run start                  # preview in Remotion Studio (AppStoreShot1–5)
./render-app-store-shots.sh    # render all 5 as PNG → out/app-store/
```
