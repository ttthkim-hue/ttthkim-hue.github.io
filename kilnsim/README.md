# KilnSim Industrial Control Room v2

Proposal-grade interactive visualization for KILN_AI_CEMENT_DT.

## V2 visual upgrade
- process-readable preheater / cyclone / calciner / rotary kiln / burner / cooler / stack / silo geometry
- kiln tyres, support rollers, ducting, fans, conveyor and industrial site context
- thermal overlay, flame, smoke and dust layers
- image-backed factory horizon, concrete floor and kiln-shell surface
- image asset manifest with procedural fallback
- orbit / zoom / pan, zone fly-to, 48-cell picking/scrubbing and fullscreen
- independent thermal / shell / bed / equipment / particle / image / grid toggles

## ImageGen-ready asset slots
Replace the paths referenced by `assets/asset-manifest.json` with generated PNG/WebP assets without changing the 3D scene code.

Recommended slots:
1. wide cement-plant environment backplate
2. seamless top-down concrete/dust ground albedo
3. seamless aged rotary-kiln shell surface

## Safety
Public visualization only. No PLC/DCS write path. Plant validation is NOT_STARTED.
The fuel/feed/speed sliders are visualization sensitivity surrogates, not plant-validated predictions.
