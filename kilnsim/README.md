# KilnSim Industrial Control Room v3

Proposal-grade interactive visualization for KILN_AI_CEMENT_DT.

## V3 product layer
- process-readable preheater / cyclones / calciner / rotary kiln / burner / cooler / stack / silos / ducting / rollers / conveyor
- 48-cell axial thermal and calcination visualization
- zone fly-to, orbit/zoom/pan, picking, scrubber and fullscreen
- dedicated 7-slot KilnSim ImageGen asset manifest with generated-first / deterministic-fallback loading
- generated refractory, clinker-bed, dust/smoke and UI backing support
- scenario presets: BASE / FUEL -5% / FEED +8% / EFFICIENCY
- A/B scenario snapshot and KPI delta
- PNG screenshot export
- JSON evidence receipt export

## Dedicated ImageGen lane
Primary generator: Codex native ImageGen through ChatGPT-account Codex CLI.
Fallback generator: local Qwen Image 2.1 when GPU admission permits.
The local GPU gate is respected; no unrelated GPU workload is preempted.

Assets:
1. factory_backplate
2. ground_albedo
3. kiln_shell_surface
4. refractory_inner_glow
5. clinker_bed_surface
6. dust_smoke_sprite
7. ui_overlay_plate

Generated asset paths use text-carried WebP base64 files under `assets/generated/`.
If a generated asset is absent or invalid, the UI falls back safely where a deterministic fallback exists.

## Scientific / safety boundary
- plant validation: NOT_STARTED
- autonomy: L0_PREDICTION
- PLC/DCS actuation: disabled
- UI scenario sliders and presets are explanatory sensitivity visualization, not plant-validated predictions.
