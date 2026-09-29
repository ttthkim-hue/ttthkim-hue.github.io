import * as THREE from 'three';

export async function loadVisualAssetManifest() {
  try {
    const response = await fetch('./assets/asset-manifest.json', {cache:'no-store'});
    if (!response.ok) throw new Error('manifest_http_'+response.status);
    return await response.json();
  } catch {
    return {schema:'kilnsim.visual.assets.v3',mode:'procedural_fallback',assets:{}};
  }
}

async function sourceToLoadable(src) {
  if (!src) return null;
  if (!src.endsWith('.b64')) return src;
  const response = await fetch(src, {cache:'no-store'});
  if (!response.ok) throw new Error('asset_http_'+response.status);
  const b64 = (await response.text()).trim();
  if (b64.length < 1000) throw new Error('asset_base64_short');
  return 'data:image/webp;base64,' + b64;
}

export async function loadTextureOrNull(url, options={}) {
  if (!url) return null;
  try {
    const loadable = await sourceToLoadable(url);
    const texture = await new THREE.TextureLoader().loadAsync(loadable);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (options.wrap) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(options.repeatX || 1, options.repeatY || 1);
    }
    texture.anisotropy = options.anisotropy || 4;
    texture.userData.source = url;
    texture.userData.generated = url.endsWith('.b64');
    return texture;
  } catch {
    return null;
  }
}

export async function loadAssetTexture(asset, options={}) {
  if (!asset) return null;
  const primary = await loadTextureOrNull(asset.src, options);
  if (primary) return primary;
  const fallback = await loadTextureOrNull(asset.fallback_src, options);
  if (fallback) {
    fallback.userData.fallback = true;
    return fallback;
  }
  return null;
}

export async function loadAssetDataUri(asset) {
  if (!asset) return null;
  for (const src of [asset.src, asset.fallback_src]) {
    if (!src) continue;
    try { return await sourceToLoadable(src); } catch {}
  }
  return null;
}

export function makeProceduralMetalTexture(renderer) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d'),g=ctx.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#68747b');g.addColorStop(.45,'#3e4b52');g.addColorStop(1,'#232f35');ctx.fillStyle=g;ctx.fillRect(0,0,512,256);
  for(let x=0;x<512;x+=64){ctx.fillStyle='#1f2a30';ctx.fillRect(x,0,2,256);ctx.fillStyle='#8b969b22';ctx.fillRect(x+3,0,1,256)}
  for(let i=0;i<900;i++){const x=Math.random()*512,y=Math.random()*256,a=Math.random()*.12;ctx.fillStyle='rgba(180,125,75,'+a+')';ctx.fillRect(x,y,Math.random()*7+1,Math.random()*2+1)}
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,2);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}

export function makeLabelSprite(text, accent='#73deff') {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='rgba(4,11,16,.78)';ctx.roundRect(8,18,496,90,18);ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.stroke();
  ctx.font='700 34px system-ui';ctx.fillStyle='#edf8ff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,63);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});const sp=new THREE.Sprite(mat);sp.scale.set(12,3,1);return sp;
}
