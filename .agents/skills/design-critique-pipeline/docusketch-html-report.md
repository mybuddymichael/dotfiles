# DocuSketch° HTML critique report recipe

Use this file whenever a design critique skill creates its required HTML artifact.

## Required artifact behavior

1. Write a self-contained HTML file to `/tmp/design-critiques/<slug>-<YYYYMMDD-HHMMSS>.html`.
2. Do not link external design-system stylesheets or images required for the report chrome. Inline report CSS in a `<style>` block. Allowed external assets:
   - IBM Plex Sans from Google Fonts.
   - Lucide icons from `https://unpkg.com/lucide@latest/dist/umd/lucide.js`.
3. If target evidence includes a local image and embedding is practical, embed it as a data URI or include a local `file://` reference with a clear label. If embedding is not practical, list it in Target evidence instead.
4. Strongly prefer sufficient inline visual evidence for findings:
   - Each finding that refers to a visible UI element, region, layout relationship, or rendered string should include the minimum set of unannotated visual excerpts needed to substantiate the claim.
   - Do not limit a finding to one image by default. Include one crop, multiple crops, or a larger context image plus focused crops depending on what makes the evidence clear.
   - Embed visual evidence as `data:` images when practical so the HTML remains self-contained.
   - Use larger unannotated context images only when tight crops would hide the issue.
   - Put explanatory labels, source references, and critique captions outside the image. Do not draw reviewer boxes, arrows, highlights, or labels onto the image.
   - If visual evidence would not make sense or cannot be captured, include an explicit `No visual evidence` reason in the finding.
5. Lightly validate before opening:
   - file exists
   - contains `<!doctype html>`
   - contains `<title>`
   - contains at least one severity section or a clear “No findings” section
   - contains no external `<link rel="stylesheet">` except the IBM Plex Sans Google Fonts stylesheet
   - contains no external `<script src=...>` except the Lucide CDN script
   - every finding that references a visible UI element/region/string includes enough inline visual evidence to substantiate the claim, or an explicit `No visual evidence` reason
6. Open the file best-effort:
   - macOS: `open <path>`
   - Linux: `xdg-open <path>`
   - Windows PowerShell: `Start-Process <path>`
   - Windows cmd: `start "" <path>`
6. If opening fails, still complete and report the file path.

## Visual direction

The report should look like the DocuSketch° exploration pages, especially `docusketch-design-system/explorations/estimating-workflows/index.html`.

Use the same primitives and rhythm:

- IBM Plex Sans from Google Fonts.
- Lucide icons for small semantic markers.
- Warm page background matching `--background-warm-prod`.
- Outer `.canvas` with generous vertical padding and max width.
- `.canvas-header` with uppercase eyebrow, large 40/44 title, and muted lede.
- Optional `.page-toc` using numbered cards for long reports.
- `.section`, `.section-head`, `.section-kicker`, `.section-title`, and `.section-copy` for report sections.
- White panels/cards using `--bg-white-default`, `--stroke-neutral-default`, `--r-card`, and token spacing.
- Badge/chip primitives modeled after `.chip`, `.model-badge`, and `.horizon-badge`.
- Button primitives modeled after `.btn`, `.btn.primary`, `.btn.secondary`, and `.btn.ghost` only when actions/links are needed.
- Dense but readable table/list patterns for findings.

Do not run a DocuSketch design-system compliance audit unless the user explicitly asks for that. This recipe supplies report style and artifact structure only.

## Embedded token subset

Generated artifacts must be self-contained except for the allowed Google Fonts and Lucide imports. Do not import `colors_and_type.css` or `web-shell.css`; instead embed a practical subset of their tokens and primitives in the report CSS.

Include at least:

- colors: `--background-warm-prod`, `--bg-white-default`, `--bg-neutral-dark`, `--bg-warning-light`, `--bg-progress-light`, `--bg-success-light`, `--stroke-neutral-default`, `--text-black`, `--text-secondary`, status colors
- typography: `--t-h1`, `--t-h2`, `--t-h3`, `--t-body-lg`, `--t-body`, `--t-body-sm`, `--t-body-bold`, `--t-btn-md`, `--t-cap-md`, `--t-cap-rg`, `--t-label`
- spacing: `--sp-xxs`, `--sp-xs`, `--sp-xs2`, `--sp-s`, `--sp-ms`, `--sp-m`, `--sp-l`, `--sp-xl`, `--sp-xxxl`
- radius: `--r-s`, `--r-ms`, `--r-card`, `--r-card-large`, `--r-round`, `--r-btn-standalone`
- line widths: `--lw-xs`, `--lw-s`, `--lw-m`
- icon sizes: `--is-xs`, `--is-s`, `--is-ms`

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

## Visual evidence for findings

Visual evidence is strongly encouraged because critique is easier to understand when the reader can see the exact UI surface being discussed.

For each finding:

1. Decide whether the finding refers to something visible: a button, label, text block, input, icon, card, spacing relationship, navigation item, empty state, modal, or screenshot region.
2. If yes, do your best to include the minimum set of unannotated image excerpts from the original artifact needed to make the evidence clear.
3. Prefer the smallest crop or set of crops that still makes the issue recognizable. If context is necessary, include a larger unannotated region plus focused crops as needed.
4. Use multiple images when the issue depends on comparison, sequence, repetition, before/after states, spatial relationships across distant regions, or multiple affected controls/messages.
5. For repeated patterns, include 2–3 representative examples rather than every instance.
6. Keep critique explanation outside images in captions or finding text. Do not add reviewer-drawn boxes, arrows, highlights, or labels onto images.
7. Embed excerpts as `data:` images when practical. Use local referenced assets only as a fallback and label that the report is not fully self-contained.
8. If visual evidence is not useful or not available, include a visible line in the finding: `No visual evidence: REASON`.

Acceptable `No visual evidence` reasons include:

- source was code-only or raw strings with no rendered visual artifact
- URL/Figma/prototype could not be inspected
- issue depends on hover, focus, motion, loading, timing, or another runtime state that was not captured
- finding is a pattern across many small instances where representative crops would mislead
- target element is not visible in the available screenshot
- crop would expose sensitive/private information and redaction is unavailable

Use multiple visual excerpts when useful:

- comparison issue: include the controls, states, or regions being compared
- sequence/flow issue: include each relevant step or state
- repeated pattern: include 2–3 representative examples
- layout relationship: include a wider context crop plus focused crops if needed
- content inconsistency: include each conflicting label or message

Recommended figure pattern:

```html
<figure class="evidence-figure">
  <img src="data:image/png;base64,..." alt="Focused crop of the Save changes button" loading="lazy">
  <figcaption><strong>Visual evidence:</strong> Focused crop from screenshot header. No reviewer annotations added.</figcaption>
</figure>
```

Use one `<figure>` per excerpt, or one `<figure>` containing a small visual set if the excerpts are tightly related. Use plain, factual alt text that identifies each excerpt. Do not put the critique conclusion in the alt text.

## Required HTML structure

Every report should include:

1. Header with title, target, date/time, lens, and scope metadata.
2. Summary panel with the most important conclusion first.
3. Target evidence section:
   - inspected files, images, strings, URLs, or descriptions
   - provided-but-not-inspected inputs
   - relevant limitations
4. Severity sections, each with finding cards.
5. Patterns observed for repeated issues that should not be duplicated as many findings.
6. What’s working / No action for good patterns worth preserving or a clean pass.
7. Optional next steps, phrased as critique follow-up only, not source edits already performed.

## Compact skeleton

Adapt this skeleton. Keep the report CSS inline. Use Lucide icons sparingly; call `lucide.createIcons()` after the body content.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DocuSketch° design critique — TARGET</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<style>
:root {
  color-scheme: light;
  --bg-white-default:#FFFFFF; --background-warm:#F9F9F5; --background-warm-prod:#EDEBDD;
  --bg-neutral-dark:#E2E0D3; --bg-neutral-light:#F9F9F5;
  --bg-accent:#C0BC90; --text-on-accent:#1A1905;
  --bg-warning:#DFBB3A; --bg-warning-light:#FEF2C3;
  --bg-progress:#549CD3; --bg-progress-light:#D4E6F4;
  --bg-success:#64B56E; --bg-success-light:#EBFAC1;
  --bg-error:#E92F2F; --bg-error-light:#FFD6BD;
  --stroke-neutral-default:#E2E0D3; --text-black:#1A1905; --text-secondary:#5D5E52;
  --chartreuse-base:#E5DF00;
  --ff-sans:'IBM Plex Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --ff-mono:'JetBrains Mono','IBM Plex Mono','SF Mono',Consolas,monospace;
  --t-h1:600 24px/28px var(--ff-sans); --t-h2:600 18px/24px var(--ff-sans); --t-h3:600 16px/20px var(--ff-sans);
  --t-body-lg:400 18px/24px var(--ff-sans); --t-body:400 16px/20px var(--ff-sans); --t-body-bold:700 16px/20px var(--ff-sans); --t-body-sm:400 14px/18px var(--ff-sans);
  --t-btn-md:600 14px/18px var(--ff-sans); --t-cap-md:500 12px/14px var(--ff-sans); --t-cap-rg:400 12px/14px var(--ff-sans); --t-label:500 10px/14px var(--ff-sans);
  --sp-xxs:4px; --sp-xs:8px; --sp-xs2:12px; --sp-s:16px; --sp-ms:24px; --sp-m:32px; --sp-l:48px; --sp-xl:64px; --sp-xxxl:112px;
  --r-s:8px; --r-ms:12px; --r-card:16px; --r-card-large:24px; --r-round:9999px; --r-btn-standalone:12px;
  --lw-xs:.5px; --lw-s:1px; --lw-m:2px; --is-xs:8px; --is-s:16px; --is-ms:24px;
  --ease-standard:cubic-bezier(.2,0,0,1);
}
*{box-sizing:border-box} html,body{margin:0;padding:0;font-family:var(--ff-sans);-webkit-font-smoothing:antialiased} body{background:var(--background-warm-prod);color:var(--text-black);min-height:100vh;padding:var(--sp-l) var(--sp-ms) var(--sp-xxxl)} a{color:inherit}.canvas{max-width:1480px;margin:0 auto}.canvas-header{max-width:980px;margin-bottom:var(--sp-l)}.canvas-eyebrow{font:var(--t-label);letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:var(--sp-xs)}.canvas-title{font:600 40px/44px var(--ff-sans);letter-spacing:0;margin:0 0 var(--sp-xs2);max-width:900px}.canvas-lede{font:var(--t-body-lg);color:var(--text-secondary);max-width:760px;margin:0}.meta-row{display:flex;flex-wrap:wrap;gap:var(--sp-xxs);margin-top:var(--sp-s)}
.page-toc{margin:0 0 var(--sp-xl);padding:var(--sp-s) 0;border-top:var(--lw-xs) solid var(--stroke-neutral-default);border-bottom:var(--lw-xs) solid var(--stroke-neutral-default)}.page-toc-label{font:var(--t-label);letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:var(--sp-xs2)}.page-toc-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--sp-xs);margin:0;padding:0;list-style:none}.page-toc-list a{min-height:76px;display:grid;grid-template-columns:32px minmax(0,1fr);gap:var(--sp-xs);align-items:start;padding:var(--sp-xs2);border:var(--lw-xs) solid var(--stroke-neutral-default);border-radius:var(--r-ms);background:color-mix(in oklab,var(--bg-white-default) 72%,transparent);text-decoration:none}.toc-number{font:var(--t-cap-md);color:var(--text-secondary)}.toc-title{display:block;font:var(--t-body-bold);color:var(--text-black);margin-bottom:var(--sp-xxs)}.toc-desc{display:block;font:var(--t-cap-rg);color:var(--text-secondary)}
.section{margin-top:var(--sp-xl);scroll-margin-top:var(--sp-l)}.section-head{display:grid;grid-template-columns:minmax(0,920px);gap:var(--sp-xs2);margin-bottom:var(--sp-ms)}.section-kicker-row{display:flex;align-items:center;gap:var(--sp-xs);flex-wrap:wrap;margin-bottom:var(--sp-xs)}.section-kicker{font:var(--t-label);letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary)}.section-title{font:600 30px/34px var(--ff-sans);margin:0;letter-spacing:0}.section-copy{max-width:760px;font:var(--t-body);color:var(--text-secondary);margin:0}.panel{background:var(--bg-white-default);border:var(--lw-xs) solid var(--stroke-neutral-default);border-radius:var(--r-card);padding:var(--sp-s)}.panel h3{font:var(--t-h3);margin:0 0 var(--sp-xs)}.panel p{font:var(--t-body-sm);color:var(--text-secondary);margin:0}.report-grid{display:grid;gap:var(--sp-s)}
.chip,.model-badge,.horizon-badge{display:inline-flex;align-items:center;gap:var(--sp-xxs);white-space:nowrap}.chip{min-height:24px;padding:0 var(--sp-xs);border-radius:var(--r-round);background:var(--bg-neutral-dark);color:var(--text-black);font:var(--t-cap-md)}.model-badge{min-height:22px;padding:0 var(--sp-xs);border-radius:var(--r-round);border:var(--lw-xs) solid var(--stroke-neutral-default);background:transparent;color:var(--text-black);font:var(--t-cap-md)}.horizon-badge{min-height:24px;padding:0 var(--sp-xs);border-radius:var(--r-s);border:var(--lw-xs) solid var(--stroke-neutral-default);font:var(--t-label);letter-spacing:.08em;text-transform:uppercase}.horizon-badge.critical,.horizon-badge.blocking{background:var(--bg-error-light);color:#4A1404;border-color:color-mix(in oklab,var(--bg-error) 32%,var(--stroke-neutral-default))}.horizon-badge.warning,.horizon-badge.confusing{background:var(--bg-warning-light);color:var(--text-black);border-color:color-mix(in oklab,var(--bg-warning) 32%,var(--stroke-neutral-default))}.horizon-badge.info,.horizon-badge.finesse{background:var(--bg-progress-light);color:var(--text-black);border-color:color-mix(in oklab,var(--bg-progress) 24%,var(--stroke-neutral-default))}.horizon-badge.ok{background:var(--bg-success-light);color:#243805;border-color:color-mix(in oklab,var(--bg-success) 34%,var(--stroke-neutral-default))}
.finding{background:var(--bg-white-default);border:var(--lw-xs) solid var(--stroke-neutral-default);border-radius:var(--r-card);padding:var(--sp-s);display:grid;gap:var(--sp-xs)}.finding-title{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-s)}.finding-title h3{font:var(--t-h3);margin:0}.finding-meta{display:flex;flex-wrap:wrap;gap:var(--sp-xxs)}.finding dl{display:grid;grid-template-columns:132px minmax(0,1fr);gap:var(--sp-xs) var(--sp-s);margin:0;padding-top:var(--sp-xs);border-top:var(--lw-xs) solid var(--stroke-neutral-default)}.finding dt{font:var(--t-label);letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary)}.finding dd{font:var(--t-body-sm);margin:0;color:var(--text-black)}.evidence-figure{margin:var(--sp-xs) 0 0;padding:var(--sp-xs2);border:var(--lw-xs) solid var(--stroke-neutral-default);border-radius:var(--r-ms);background:var(--background-warm)}.evidence-figure img{display:block;max-width:100%;height:auto;border-radius:var(--r-s);border:var(--lw-xs) solid var(--stroke-neutral-default);background:var(--bg-white-default)}.evidence-figure figcaption{margin-top:var(--sp-xs);font:var(--t-body-sm);color:var(--text-secondary)}.no-visual-evidence{font:var(--t-body-sm);color:var(--text-secondary);padding:var(--sp-xs);border-radius:var(--r-s);background:var(--background-warm)}.code{font-family:var(--ff-mono);font-size:13px;background:var(--background-warm);border:var(--lw-xs) solid var(--stroke-neutral-default);border-radius:var(--r-s);padding:var(--sp-xs2);overflow:auto}.empty{border-style:dashed;color:var(--text-secondary)}[data-lucide]{width:var(--is-s);height:var(--is-s);stroke-width:2;flex:0 0 auto}
@media(max-width:900px){body{padding:var(--sp-ms) var(--sp-s) var(--sp-xl)}.canvas-title{font:var(--t-h1)}.page-toc-list{grid-template-columns:1fr}.finding dl{grid-template-columns:1fr}}
</style>
</head>
<body>
<main class="canvas">
  <header class="canvas-header">
    <div class="canvas-eyebrow">DocuSketch° · design critique</div>
    <h1 class="canvas-title">TARGET</h1>
    <p class="canvas-lede">One-sentence outcome summary with the highest-impact design read.</p>
    <div class="meta-row">
      <span class="model-badge"><i data-lucide="layers"></i> Lens: full pipeline</span>
      <span class="model-badge"><i data-lucide="calendar"></i> Generated: DATE</span>
      <span class="model-badge"><i data-lucide="file-search"></i> Evidence: N inputs</span>
    </div>
  </header>

  <nav class="page-toc" aria-label="Page sections">
    <div class="page-toc-label">On this report</div>
    <ol class="page-toc-list">
      <li><a href="#summary"><span class="toc-number">01</span><span><span class="toc-title">Summary</span><span class="toc-desc">Overall read and target evidence.</span></span></a></li>
      <li><a href="#critical"><span class="toc-number">02</span><span><span class="toc-title">Critical</span><span class="toc-desc">Issues that block or mislead.</span></span></a></li>
      <li><a href="#working"><span class="toc-number">03</span><span><span class="toc-title">What’s working</span><span class="toc-desc">Patterns to preserve.</span></span></a></li>
    </ol>
  </nav>

  <section class="section" id="summary">
    <div class="section-head"><div><div class="section-kicker-row"><span class="section-kicker">Review summary</span><span class="horizon-badge info">Info</span></div><h2 class="section-title">Highest-impact read</h2></div><p class="section-copy">Concise synthesis of the critique.</p></div>
    <div class="report-grid"><div class="panel"><h3>Target evidence</h3><p>Inputs inspected and limitations.</p></div></div>
  </section>

  <section class="section" id="critical">
    <div class="section-head"><div><div class="section-kicker-row"><span class="section-kicker">Findings</span><span class="horizon-badge critical">Critical</span></div><h2 class="section-title">Critical</h2></div><p class="section-copy">Findings that block, mislead, or materially damage the experience.</p></div>
    <article class="finding">
      <div class="finding-title"><h3>Finding title</h3><span class="horizon-badge critical">Critical</span></div>
      <div class="finding-meta"><span class="chip"><i data-lucide="eye"></i> UI</span><span class="model-badge">Evidence: Direct</span><span class="model-badge">Source: screenshot header</span></div>
      <figure class="evidence-figure"><img src="data:image/png;base64,..." alt="Focused crop of the relevant UI element"><figcaption><strong>Visual evidence:</strong> Focused crop from screenshot header. No reviewer annotations added.</figcaption></figure>
      <dl><dt>Principle</dt><dd>Hierarchy</dd><dt>Issue</dt><dd>What is wrong from the user’s perspective.</dd><dt>Fix</dt><dd>Concrete change to make.</dd></dl>
    </article>
  </section>

  <section class="section" id="working"><div class="section-head"><div><div class="section-kicker-row"><span class="section-kicker">No action</span><span class="horizon-badge ok">Working</span></div><h2 class="section-title">What’s working</h2></div></div><div class="panel"><p>Patterns worth preserving.</p></div></section>
</main>
<script>if (window.lucide) window.lucide.createIcons();</script>
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
