# Shift 09 ECG illustrations

Generator and validator for the eleven constructed ECG images used by Shift 09 ("The Quiet Complaint"). These are teaching illustrations, not patient recordings, and they are not part of the app bundle. The app uses only the PNGs written to `frontend/src/modules/the-shift/shift9/assets/`.

```bash
pip install -r tools/shift9-ecg/requirements.txt
python tools/shift9-ecg/generate.py   # images + manifest.json + stored signals
python tools/shift9-ecg/validate.py   # validation-report.json (signal and pixel measurements)
```

- `ecg_model.py`: the beat model (each beat's QT follows its preceding R-R by the Framingham formula) and the measurement functions.
- `generate.py`: renders every image at true paper scale (25 mm/s, 10 mm/mV, square grid) with fixed seeds. Set `SHIFT9_ECG_OUT=/some/dir` for a trial run that leaves the repo untouched.
- `validate.py`: measures each image from its signal and from its PNG's pixels. `--legacy DIR` measures older images from pixels only.
- `manifest.json`, `validation-report.json`, `*_signals.npz`: generated files; commit them together with the images. `frontend/tests/shift9-ecg.test.mjs` fails if an image doesn't match its manifest or its measurements leave the clinical bounds.

Results and the specialist review checklist: `docs/SHIFT_009_ECG_VALIDATION.md`. Automated measurement is not specialist ECG validation.
