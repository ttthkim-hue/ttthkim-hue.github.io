import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadVisualAssetManifest, loadAssetTexture, loadAssetDataUri, makeProceduralMetalTexture, makeLabelSprite } from './asset-layer.js';

const $=id=>document.getElementById(id),host=$('scene'),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071018);scene.fog=new THREE.FogExp2(0x0a151c,.0085);
const camera=new THREE.PerspectiveCamera(46,host.clientWidth/host.clientHeight,.1,800);camera.position.set(58,34,58);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,2,0);controls.maxDistance=180;controls.minDistance=8;controls.maxPolarAngle=Math.PI*.48;

const hemi=new THREE.HemisphereLight(0xcbeeff,0x27150b,2.25);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff3df,4.5);sun.position.set(-30,45,34);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-80;sun.shadow.camera.right=80;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-40;scene.add(sun);
const hotLight=new THREE.PointLight(0xff6b32,100,50,2);hotLight.position.set(22,1,0);scene.add(hotLight);
const coolLight=new THREE.PointLight(0x55cfff,45,60,2);coolLight.position.set(-35,15,-20);scene.add(coolLight);

const equipmentGroup=new THREE.Group(),kilnGroup=new THREE.Group(),thermalGroup=new THREE.Group(),bedGroup=new THREE.Group(),cellGrid=new THREE.Group(),particleGroup=new THREE.Group(),imageLayerGroup=new THREE.Group(),labelGroup=new THREE.Group();
scene.add(equipmentGroup,kilnGroup,thermalGroup,bedGroup,cellGrid,particleGroup,imageLayerGroup,labelGroup);

const manifest=await loadVisualAssetManifest();const assets=manifest.assets||{};
const [backplateTex,groundTex,shellTexLoaded,refractoryTex,clinkerTex,dustTex,uiPlateUri]=await Promise.all([
  loadAssetTexture(assets.factory_backplate),
  loadAssetTexture(assets.ground_albedo,{wrap:true,repeatX:14,repeatY:8,anisotropy:8}),
  loadAssetTexture(assets.kiln_shell_surface,{wrap:true,repeatX:8,repeatY:2,anisotropy:8}),
  loadAssetTexture(assets.refractory_inner_glow,{wrap:true,repeatX:4,repeatY:2,anisotropy:8}),
  loadAssetTexture(assets.clinker_bed_surface,{wrap:true,repeatX:4,repeatY:3,anisotropy:8}),
  loadAssetTexture(assets.dust_smoke_sprite,{anisotropy:4}),
  loadAssetDataUri(assets.ui_overlay_plate)
]);
const loadedTextures=[backplateTex,groundTex,shellTexLoaded,refractoryTex,clinkerTex,dustTex];
const generatedCount=loadedTextures.filter(t=>t?.userData?.generated).length+(uiPlateUri?.startsWith('data:image/webp')?1:0);
$('assetState').textContent=generatedCount+'/7 generated · '+(manifest.generator_lane||'fallback');
$('assetState').closest('.asset-status')?.classList.toggle('generated',generatedCount===7);
$('visualBadge').querySelector('span').textContent=generatedCount===7?'7/7 dedicated ImageGen assets active':'generated '+generatedCount+'/7 · deterministic fallback';
if(uiPlateUri)document.documentElement.style.setProperty('--ui-plate-image','url("'+uiPlateUri+'")');
const shellTexture=shellTexLoaded||makeProceduralMetalTexture(renderer);

const groundMat=new THREE.MeshStandardMaterial({color:groundTex?0xffffff:0x555d5f,map:groundTex||null,roughness:.93,metalness:.03});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,110),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-7;ground.receiveShadow=true;scene.add(ground);
const road=new THREE.Mesh(new THREE.PlaneGeometry(150,18),new THREE.MeshStandardMaterial({color:0x20292c,roughness:.97}));road.rotation.x=-Math.PI/2;road.position.set(0,-6.96,20);road.receiveShadow=true;scene.add(road);
for(let x=-60;x<=60;x+=15){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(6,.18),new THREE.MeshBasicMaterial({color:0xd4c975,transparent:true,opacity:.45}));stripe.rotation.x=-Math.PI/2;stripe.position.set(x,-6.94,20);scene.add(stripe)}
const grid=new THREE.GridHelper(170,85,0x294651,0x132a34);grid.position.y=-6.92;grid.material.opacity=.22;grid.material.transparent=true;scene.add(grid);

if(backplateTex){const m=new THREE.MeshBasicMaterial({map:backplateTex,transparent:true,opacity:.86,depthWrite:false});const p=new THREE.Mesh(new THREE.PlaneGeometry(165,82),m);p.position.set(0,26,-62);imageLayerGroup.add(p)}
function box(w,h,d,color=0x2e3c43,rough=.65,metal=.4){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal}));m.castShadow=m.receiveShadow=true;return m}
function cyl(r,h,color=0x46575e,segments=32){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.52}));m.castShadow=m.receiveShadow=true;return m}
function pipe(a,b,r=.7,color=0x60737a){const d=b.clone().sub(a),len=d.length(),m=cyl(r,len,color,20);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());equipmentGroup.add(m);return m}
function label(text,pos,accent){const sp=makeLabelSprite(text,accent);sp.position.copy(pos);labelGroup.add(sp);return sp}

// Preheater tower and cyclones
const tower=box(13,35,12,0x293840,.8,.25);tower.position.set(-47,10,-7);equipmentGroup.add(tower);
for(let level=0;level<4;level++){
  const y=1+level*8.2;
  for(const z of [-3.3,3.3]){
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(2.8,1.15,5.5,30),new THREE.MeshStandardMaterial({color:0x52636a,roughness:.52,metalness:.48}));cone.position.set(-47,y,z);cone.castShadow=true;equipmentGroup.add(cone);
    const neck=cyl(.95,3,0x4b5c63,24);neck.position.set(-47,y+4,z);equipmentGroup.add(neck);
  }
}
for(let y=-2;y<26;y+=5.8){const rail=box(15,.18,.18,0x849398,.45,.7);rail.position.set(-47,y,-13.2);equipmentGroup.add(rail)}
const towerLabel=label('PREHEATER',new THREE.Vector3(-47,31,0),'#68dcff');

// Calciner
const calciner=cyl(4.2,20,0x384950,32);calciner.position.set(-27,7,-4);equipmentGroup.add(calciner);
const calcinerCone=new THREE.Mesh(new THREE.CylinderGeometry(4.2,2.2,6,32),new THREE.MeshStandardMaterial({color:0x43565e,roughness:.55,metalness:.48}));calcinerCone.position.set(-27,-6,-4);equipmentGroup.add(calcinerCone);
pipe(new THREE.Vector3(-41,15,-4),new THREE.Vector3(-31,15,-4),1.2);pipe(new THREE.Vector3(-27,17,-4),new THREE.Vector3(-12,9,-1),1.15);
label('CALCINER',new THREE.Vector3(-27,20,-3),'#87e7ff');

// Kiln supports + shell
const N=48,L=76,cellLen=L/N,cellMeshes=[],thermalMeshes=[],bedMeshes=[],edgeMeshes=[];
kilnGroup.rotation.z=-.035;thermalGroup.rotation.z=-.035;bedGroup.rotation.z=-.035;cellGrid.rotation.z=-.035;
for(let i=0;i<N;i++){
  const x=-10+(-L/2+cellLen*(i+.5));
  const g=new THREE.CylinderGeometry(5.1,5.1,cellLen*.985,48,1,true);g.rotateZ(Math.PI/2);
  const mat=new THREE.MeshStandardMaterial({map:shellTexture,color:0xffffff,roughness:.48,metalness:.6,side:THREE.DoubleSide});
  const m=new THREE.Mesh(g,mat);m.position.set(x,0,0);m.userData={cell:i,type:'kiln'};m.castShadow=true;kilnGroup.add(m);cellMeshes.push(m);
  const tg=new THREE.CylinderGeometry(5.22,5.22,cellLen*.93,32,1,true);tg.rotateZ(Math.PI/2);
  const tm=new THREE.MeshBasicMaterial({color:0xff7a48,transparent:true,opacity:.23,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
  const th=new THREE.Mesh(tg,tm);th.position.set(x,0,0);thermalGroup.add(th);thermalMeshes.push(th);
  const bed=box(cellLen*.91,1.15,6.8,0xa97743,.92,.02);bed.position.set(x,-2.8,0);bed.userData={cell:i,type:'bed'};if(clinkerTex){bed.material.map=clinkerTex;bed.material.needsUpdate=true}bedGroup.add(bed);bedMeshes.push(bed);
  const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(cellLen*.98,10.6,10.6)),new THREE.LineBasicMaterial({color:0x6ce3ff,transparent:true,opacity:.16}));e.position.set(x,0,0);e.visible=false;cellGrid.add(e);edgeMeshes.push(e);
}
for(const x of [-36,-14,9,31]){
  const tyre=new THREE.Mesh(new THREE.TorusGeometry(5.45,.36,14,60),new THREE.MeshStandardMaterial({color:0x252c2e,metalness:.82,roughness:.33}));tyre.rotation.y=Math.PI/2;tyre.position.x=x;kilnGroup.add(tyre);
  for(const z of [-3.6,3.6]){const roller=cyl(1.15,3.2,0x20282a,24);roller.rotation.x=Math.PI/2;roller.position.set(x,-5.55,z);equipmentGroup.add(roller)}
  const base=box(8,.8,10,0x303739,.8,.25);base.position.set(x,-6.15,0);equipmentGroup.add(base);
}
label('ROTARY KILN',new THREE.Vector3(5,8,0),'#ff9d73');
if(refractoryTex){
  const rg=new THREE.CylinderGeometry(4.72,4.72,23,48,1,true);rg.rotateZ(Math.PI/2);
  const rm=new THREE.MeshStandardMaterial({map:refractoryTex,color:0xffa26b,emissive:0x7a2108,emissiveIntensity:1.15,roughness:.82,metalness:0,side:THREE.BackSide,transparent:true,opacity:.88});
  const refractory=new THREE.Mesh(rg,rm);refractory.position.set(12,0,0);refractory.rotation.z=-.035;imageLayerGroup.add(refractory);
}

// Burner and flame
const burner=box(10,7,9,0x252e33,.62,.55);burner.position.set(34,0,0);equipmentGroup.add(burner);
const burnerPipe=cyl(1.1,11,0x333f44,28);burnerPipe.rotation.z=Math.PI/2;burnerPipe.position.set(27.5,0,0);equipmentGroup.add(burnerPipe);
const flameMat=new THREE.MeshBasicMaterial({color:0xff8c3a,transparent:true,opacity:.66,blending:THREE.AdditiveBlending,depthWrite:false});
const flame=new THREE.Mesh(new THREE.ConeGeometry(2.2,9,24),flameMat);flame.rotation.z=-Math.PI/2;flame.position.set(20.5,0,0);particleGroup.add(flame);

// Cooler
const cooler=box(22,8,16,0x2a383f,.7,.35);cooler.position.set(48,-2,0);equipmentGroup.add(cooler);
for(let i=0;i<8;i++){const grate=box(1.5,.35,12,0x64777e,.45,.65);grate.position.set(39+i*2.5,1.3,0);equipmentGroup.add(grate)}
for(const z of [-6.5,6.5]){for(let i=0;i<4;i++){const fan=cyl(1.25,1.2,0x3b4b52,24);fan.rotation.x=Math.PI/2;fan.position.set(41+i*5,-5.5,z);equipmentGroup.add(fan)}}
pipe(new THREE.Vector3(48,3,-6),new THREE.Vector3(55,12,-12),1.1);
label('CLINKER COOLER',new THREE.Vector3(49,7,0),'#76dfff');

// Stack, silos and conveyor
const stack=cyl(2.1,38,0x4b575b,34);stack.position.set(-61,12,-23);equipmentGroup.add(stack);
for(const x of [56,66]){const silo=cyl(5.4,22,0xc0c4c2,40);silo.position.set(x,5,-24);equipmentGroup.add(silo);const roof=new THREE.Mesh(new THREE.ConeGeometry(5.6,4,40),new THREE.MeshStandardMaterial({color:0x858d8d,roughness:.66,metalness:.3}));roof.position.set(x,18,-24);equipmentGroup.add(roof)}
const conv=box(42,1.4,3,0x313c40,.62,.48);conv.position.set(41,8,-19);conv.rotation.z=-.13;equipmentGroup.add(conv);

// selected ring
const ring=new THREE.Mesh(new THREE.TorusGeometry(5.6,.085,8,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92}));ring.rotation.y=Math.PI/2;kilnGroup.add(ring);

// particles: smoke + dust
function pointsCloud(count,origin,spread,color,size,opacity,map=null){
  const pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=origin.x+(Math.random()-.5)*spread.x;pos[i*3+1]=origin.y+Math.random()*spread.y;pos[i*3+2]=origin.z+(Math.random()-.5)*spread.z}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color,size,transparent:true,opacity,depthWrite:false,blending:THREE.NormalBlending,map:map||null,alphaTest:map?.userData?.generated ? .015 : 0});const p=new THREE.Points(g,m);p.userData={origin,spread};particleGroup.add(p);return p;
}
const smoke=pointsCloud(230,new THREE.Vector3(-61,29,-23),new THREE.Vector3(10,20,10),0xffffff,dustTex?1.5:.8,dustTex?.userData?.generated ? .24 : .16,dustTex);
const dust=pointsCloud(180,new THREE.Vector3(47,1,0),new THREE.Vector3(25,9,17),0xe6bd8a,dustTex?1.15:.45,dustTex?.userData?.generated ? .20 : .14,dustTex);

const p={fuel:100,feed:100,speed:2,selected:0};let data=[],compareA=null;
const presets={
  base:{name:'Reference operating envelope',fuel:100,feed:100,speed:2.0},
  fuel_save:{name:'Fuel saving screen',fuel:95,feed:100,speed:2.0},
  throughput:{name:'Throughput screen',fuel:104,feed:108,speed:2.15},
  efficient:{name:'Efficiency candidate',fuel:94,feed:103,speed:1.9}
};
function profile(q){const a=[];for(let i=0;i<N;i++){const x=i/(N-1),pre=1/(1+Math.exp(-(x-.25)*10)),burn=Math.exp(-Math.pow((x-.71)/.18,2)),base=350+500*pre+245*burn,fuel=(q.fuel-100)*3.1*(.25+.75*burn),feed=-(q.feed-100)*1.5*(.25+.75*pre),speed=(q.speed-2)*-29*(.2+.8*pre),bed=clamp(base+fuel+feed+speed,300,1198),wall=clamp(bed+70+65*burn,330,1198),conv=clamp((bed-755)/390,0,1)*clamp((x-.19)/.58,0,1);a.push({x:i*cellLen,bed,wall,conv})}return a}
function tempColor(t){const u=clamp((t-300)/900,0,1),c=new THREE.Color();if(u<.3)c.lerpColors(new THREE.Color(0x2544c7),new THREE.Color(0x19c8c4),u/.3);else if(u<.62)c.lerpColors(new THREE.Color(0x19c8c4),new THREE.Color(0xffe66c),(u-.3)/.32);else c.lerpColors(new THREE.Color(0xffe66c),new THREE.Color(0xd52b45),(u-.62)/.38);return c}
function selectCell(i,slider=true){p.selected=clamp(Number(i)||0,0,N-1);if(slider)$('axial').value=p.selected;$('axialOut').textContent=p.selected;$('cellNo').textContent=String(p.selected+1).padStart(2,'0');const d=data[p.selected];ring.position.x=-10+(-L/2+cellLen*(p.selected+.5));$('detailX').textContent=d.x.toFixed(1)+' m';$('detailBed').textContent=d.bed.toFixed(0)+' K';$('detailWall').textContent=d.wall.toFixed(0)+' K';$('detailConv').textContent=(d.conv*100).toFixed(1)+' %'}
function drawProfile(){const c=$('profile'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#050d13';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#17303d';ctx.lineWidth=1;for(let j=0;j<5;j++){const y=22+j*(h-48)/4;ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(w-12,y);ctx.stroke()}const tx=i=>42+i*(w-58)/(N-1),ty=t=>h-20-(t-300)/900*(h-48);ctx.strokeStyle='#67dcff';ctx.lineWidth=3;ctx.beginPath();data.forEach((d,i)=>i?ctx.lineTo(tx(i),ty(d.bed)):ctx.moveTo(tx(i),ty(d.bed)));ctx.stroke();ctx.strokeStyle='#ff9164';ctx.lineWidth=2;ctx.beginPath();data.forEach((d,i)=>i?ctx.lineTo(tx(i),ty(d.wall)):ctx.moveTo(tx(i),ty(d.wall)));ctx.stroke();const sx=tx(p.selected);ctx.strokeStyle='#fff';ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(sx,13);ctx.lineTo(sx,h-13);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#7993a5';ctx.font='18px system-ui';ctx.fillText('BED',48,35);ctx.fillStyle='#ff9d78';ctx.fillText('WALL',104,35)}
function refresh(){data=profile(p);data.forEach((d,i)=>{thermalMeshes[i].material.color.copy(tempColor(d.wall));thermalMeshes[i].material.opacity=.09+.31*clamp((d.wall-500)/700,0,1);bedMeshes[i].material.color.copy(tempColor(d.bed));bedMeshes[i].scale.y=.72+.65*d.conv});$('peakT').textContent=Math.max(...data.map(d=>d.bed)).toFixed(0);$('conversion').textContent=(data.at(-1).conv*100).toFixed(1);$('energy').textContent=(100*(p.fuel/100)*(100/p.feed)*(2/p.speed)).toFixed(1);hotLight.intensity=70+(p.fuel-80)*2.2;flame.scale.set(1+(p.fuel-100)*.01,1+(p.fuel-100)*.018,1+(p.fuel-100)*.01);selectCell(p.selected,false);drawProfile()}
function syncScenarioControls(){
  for(const id of ['fuel','feed','speed']){$(id).value=p[id];$(id+'Out').textContent=p[id]}
}
for(const id of ['fuel','feed','speed']){const el=$(id),out=$(id+'Out');el.addEventListener('input',()=>{p[id]=Number(el.value);out.textContent=el.value;document.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));refresh()})}$('axial').addEventListener('input',()=>selectCell(Number($('axial').value),false));
document.querySelectorAll('.preset').forEach(btn=>btn.addEventListener('click',()=>{const q=presets[btn.dataset.preset];if(!q)return;p.fuel=q.fuel;p.feed=q.feed;p.speed=q.speed;$('scenarioName').textContent=q.name;syncScenarioControls();document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',b===btn));refresh()}));
$('saveA').addEventListener('click',()=>{compareA={fuel:p.fuel,feed:p.feed,speed:p.speed,peak:Number($('peakT').textContent),conv:Number($('conversion').textContent),energy:Number($('energy').textContent)};$('compareSummary').textContent='A saved · adjust scenario'});
$('compareB').addEventListener('click',()=>{if(!compareA){$('compareSummary').textContent='Save A first';return}const dPeak=Number($('peakT').textContent)-compareA.peak,dConv=Number($('conversion').textContent)-compareA.conv,dEnergy=Number($('energy').textContent)-compareA.energy;$('compareSummary').textContent='B−A: ΔT '+dPeak.toFixed(0)+' K · Δcalc '+dConv.toFixed(1)+'% · ΔE '+dEnergy.toFixed(1)});
function downloadBlob(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
$('screenshot').addEventListener('click',()=>{renderer.render(scene,camera);renderer.domElement.toBlob(b=>b&&downloadBlob('kilnsim_v3_capture.png',b),'image/png')});
$('exportReceipt').addEventListener('click',()=>{const receipt={schema:'kilnsim.web.evidence.v1',generated_at:new Date().toISOString(),mode:'L0_PREDICTION_NO_ACTUATION',plant_validation:'NOT_STARTED',asset_lane:manifest.generator_lane||null,asset_mode:manifest.mode,generated_assets:generatedCount,scenario:{fuel:p.fuel,feed:p.feed,speed:p.speed,selected_cell:p.selected},kpi:{peak_bed_K:Number($('peakT').textContent),calcination_pct:Number($('conversion').textContent),energy_index:Number($('energy').textContent)},comparison_A:compareA,disclaimer:'Client-side sensitivity visualization; not plant-validated prediction.'};downloadBlob('kilnsim_evidence_receipt.json',new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}))});

const layerMap={thermal:thermalGroup,shell:kilnGroup,bed:bedGroup,equipment:equipmentGroup,particles:particleGroup,image:imageLayerGroup,grid:cellGrid};
document.querySelectorAll('.layer').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');const on=btn.classList.contains('active'),g=layerMap[btn.dataset.layer];if(btn.dataset.layer==='grid')edgeMeshes.forEach(e=>e.visible=on);else if(g)g.visible=on}));

const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();renderer.domElement.addEventListener('pointerdown',ev=>{const r=renderer.domElement.getBoundingClientRect();mouse.x=((ev.clientX-r.left)/r.width)*2-1;mouse.y=-((ev.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects([...cellMeshes,...bedMeshes],false)[0];if(hit)selectCell(hit.object.userData.cell)});

const views={
 overview:{p:[58,34,58],t:[1,3,0]},preheater:{p:[-71,26,31],t:[-45,8,-6]},calciner:{p:[-42,18,28],t:[-25,5,-3]},burning:{p:[19,12,25],t:[13,0,0]},cooler:{p:[67,13,28],t:[47,-1,0]},inspection:{p:[3,5,15],t:[0,-1,0]}
};let fly=null;
function flyTo(v){const x=views[v];if(!x)return;fly={start:performance.now(),fromP:camera.position.clone(),fromT:controls.target.clone(),toP:new THREE.Vector3(...x.p),toT:new THREE.Vector3(...x.t)};document.querySelectorAll('.scene-tools button').forEach(b=>b.classList.toggle('active',b.dataset.view===v))}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>flyTo(b.dataset.view)));$('resetView').addEventListener('click',()=>flyTo('overview'));
$('fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});

function animate(now){requestAnimationFrame(animate);if(fly){const u=clamp((now-fly.start)/950,0,1),e=1-Math.pow(1-u,3);camera.position.lerpVectors(fly.fromP,fly.toP,e);controls.target.lerpVectors(fly.fromT,fly.toT,e);if(u>=1)fly=null}
  flame.material.opacity=.48+.18*Math.sin(now*.009);flame.scale.z=1+.12*Math.sin(now*.013);
  smoke.rotation.y+=.0006;dust.rotation.y-=.0009;thermalGroup.rotation.x=.0018*Math.sin(now*.0007);controls.update();renderer.render(scene,camera)}
refresh();requestAnimationFrame(animate);
new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}).observe(host);
window.addEventListener('keydown',e=>{const m={'1':'overview','2':'preheater','3':'calciner','4':'burning','5':'cooler'};if(m[e.key])flyTo(m[e.key])});
