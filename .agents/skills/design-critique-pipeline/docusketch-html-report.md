# DocuSketch° HTML critique report recipe

Use this file whenever a design critique skill creates its required HTML artifact.

## Required artifact behavior

1. Write a self-contained HTML file to `/tmp/design-critiques/<slug>-<YYYYMMDD-HHMMSS>.html`.
2. Do not link external stylesheets, scripts, fonts, or images required for the report chrome. Inline CSS in a `<style>` block.
3. If target evidence includes a local image and embedding is practical, embed it as a data URI or include a local `file://` reference with a clear label. If embedding is not practical, list it in Target evidence instead.
4. Lightly validate before opening:
   - file exists
   - contains `<!doctype html>`
   - contains `<title>`
   - contains at least one severity section or a clear “No findings” section
   - contains no external `<link rel="stylesheet">` or external `<script src=...>`
5. Open the file best-effort:
   - macOS: `open <path>`
   - Linux: `xdg-open <path>`
   - Windows PowerShell: `Start-Process <path>`
   - Windows cmd: `start "" <path>`
6. If opening fails, still complete and report the file path.

## Visual direction

The report should look like a DocuSketch° artifact, not a generic Markdown export.

Use:

- Warm page background.
- IBM Plex Sans-style system stack.
- Dark olive/ash text.
- White report cards with fine neutral borders and soft radius.
- Small uppercase metadata pills.
- Calm severity badges.
- Dense but readable finding cards.
- Clear separation between summary, target evidence, findings, patterns, and no-action/working sections.

Do not run a DocuSketch design-system compliance audit unless the user explicitly asks for that. This recipe supplies report style and artifact structure only.

## Severity labels

Pipeline, UI design, and interaction design reports use:

- Critical
- Warning
- Info

Individual content-design reports use:

- Blocking
- Confusing
- Needs finesse

When the pipeline includes content findings, map:

- Blocking → Critical
- Confusing → Warning
- Needs finesse → Info

## Evidence basis labels

Each finding includes one evidence-basis label:

- `Direct` — visible in inspected screenshot, code, rendered text, or supplied strings.
- `Inferred` — likely from partial evidence but dependent on context not fully inspected.
- `Needs runtime check` — motion, hover, loading, focus, responsive behavior, or multi-step state must be observed.
- `Not inspected` — user supplied a URL/Figma/path that could not be accessed; only the existence of that input is known.

Use source references only when available: `src/File.tsx:42`, `pasted copy line 3`, `screenshot: header`, etc. Do not invent file/line references.

## Required HTML structure

Every report should include:

1. Header with title, target, date/time, lens, and scope metadata.
2. Summary card with the most important conclusion first.
3. Target evidence section:
   - inspected files, images, strings, URLs, or descriptions
   - provided-but-not-inspected inputs
   - relevant limitations
4. Severity sections, each with finding cards.
5. Patterns observed for repeated issues that should not be duplicated as many findings.
6. What’s working / No action for good patterns worth preserving or a clean pass.
7. Optional next steps, phrased as critique follow-up only, not source edits already performed.

## Compact skeleton

Adapt this skeleton. Keep it self-contained.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DocuSketch° design critique — TARGET</title>
<style>
:root {
  --neutral-white:#FFFFFF; --neutral-light:#F9F9F5; --neutral-warm:#F4F3EA;
  --neutral-stroke:#E2E0D3; --neutral-ash:#1A1905; --text-secondary:#5D5E52;
  --eucalyptus:#C0BC90; --eucalyptus-dark:#6F6D41; --eucalyptus-light:#E6E4D2;
  --red:#E92F2F; --red-light:#FFD6BD; --yellow:#DFBB3A; --yellow-light:#FEF2C3;
  --blue:#549CD3; --blue-light:#D4E6F4; --green:#64B56E; --green-light:#EBFAC1;
  --shadow:0 10px 30px rgba(26,25,5,.08),0 1px 2px rgba(26,25,5,.05);
  --font:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --mono:'JetBrains Mono','SF Mono',Consolas,monospace;
}
*{box-sizing:border-box} body{margin:0;background:var(--neutral-light);color:var(--neutral-ash);font-family:var(--font);line-height:1.45}
.page{max-width:1180px;margin:0 auto;padding:48px 32px 96px}.hero{display:grid;gap:14px;padding-bottom:22px;border-bottom:1px solid var(--neutral-stroke);margin-bottom:24px}
.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);font-weight:600}.hero h1{font-size:30px;line-height:34px;margin:0;font-weight:600;letter-spacing:-.02em}.lead{max-width:820px;font-size:17px;color:var(--text-secondary);margin:0}
.meta{display:flex;flex-wrap:wrap;gap:8px}.pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--neutral-stroke);background:#fff;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)}
.grid{display:grid;gap:18px}.card{background:#fff;border:1px solid var(--neutral-stroke);border-radius:22px;padding:22px;box-shadow:var(--shadow)}.card h2{font-size:18px;line-height:24px;margin:0 0 12px;font-weight:600}.card p{margin:0;color:var(--text-secondary)}
.section{margin-top:26px}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.section h2{font-size:22px;line-height:28px;margin:0;font-weight:600}.count{color:var(--text-secondary);font-size:13px}
.finding{background:#fff;border:1px solid var(--neutral-stroke);border-radius:18px;padding:18px;margin-bottom:12px}.finding h3{font-size:16px;margin:0 0 8px;font-weight:600}.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.tag{font-size:12px;border-radius:999px;padding:4px 8px;background:var(--neutral-warm);color:var(--text-secondary);font-weight:600}.tag.critical,.tag.blocking{background:var(--red-light);color:#4A1404}.tag.warning,.tag.confusing{background:var(--yellow-light);color:#5F3100}.tag.info,.tag.finesse{background:var(--blue-light);color:#0B3855}.tag.ok{background:var(--green-light);color:#243805}
.dl{display:grid;grid-template-columns:110px 1fr;gap:8px 14px}.dt{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary);font-weight:600}.dd{margin:0}.code{font-family:var(--mono);font-size:13px;background:var(--neutral-light);border:1px solid var(--neutral-stroke);border-radius:10px;padding:10px;overflow:auto}.empty{border-style:dashed;color:var(--text-secondary)}
@media(max-width:760px){.page{padding:28px 18px 72px}.dl{grid-template-columns:1fr}.dt{margin-top:8px}}
</style>
</head>
<body>
<main class="page">
  <header class="hero">
    <div class="eyebrow">DocuSketch° design critique</div>
    <h1>TARGET</h1>
    <p class="lead">One-sentence outcome summary.</p>
    <div class="meta"><span class="pill">Lens: full pipeline</span><span class="pill">Generated: DATE</span></div>
  </header>

  <section class="card"><h2>Summary</h2><p>Highest-impact conclusion first.</p></section>
  <section class="section"><div class="section-head"><h2>Target evidence</h2></div><div class="card"><p>Inputs inspected and limitations.</p></div></section>
  <section class="section"><div class="section-head"><h2>Critical</h2><span class="count">N findings</span></div><!-- finding cards --></section>
  <section class="section"><div class="section-head"><h2>Warning</h2><span class="count">N findings</span></div><!-- finding cards --></section>
  <section class="section"><div class="section-head"><h2>Info</h2><span class="count">N findings</span></div><!-- finding cards --></section>
  <section class="section"><div class="section-head"><h2>Patterns observed</h2></div><div class="card"><p>Systemic notes.</p></div></section>
  <section class="section"><div class="section-head"><h2>What’s working</h2></div><div class="card"><p>Patterns to preserve.</p></div></section>
</main>
</body>
</html>
```

## Finding card content

Each finding should include, at minimum:

- title
- severity tag
- lens tag (`UI`, `Interaction`, `Content`, or `Pipeline`)
- evidence basis
- source when available
- principle
- issue
- fix

Keep fixes concrete. Do not say files were changed unless they were changed in a separate user-approved implementation task.
