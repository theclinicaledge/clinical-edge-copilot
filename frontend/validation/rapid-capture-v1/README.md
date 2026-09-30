# Rapid Capture Validation Corpus v1

This synthetic corpus measures deterministic extraction safety at the field/claim level.

- `inputs.json` contains narratives only.
- `answer-key.json` contains independently authored expected claims.
- `run-validation.mjs` executes and scores the extractor.
- `baseline-v1.json` is the immutable first run and must not be overwritten.

Run from `frontend/`:

```sh
node validation/rapid-capture-v1/run-validation.mjs validation/rapid-capture-v1/results.json
```

The runner refuses to overwrite an existing result. Use a new output path for every subsequent run.

Run the regression quality gate without writing an artifact:

```sh
npm run validate:rapid-capture
```

The gate runs the original corpus and both holdout generations. It requires zero P0 findings and false-positive claims, at least 99% precision, at least 90% recall and temporal fidelity, and at least 95% routing of intentionally ambiguous cases.
