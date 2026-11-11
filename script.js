const CONFIG={signature:"@made_by_r00t"};
const T_GROW0=0.8,T_GROW1=7.2;
const T_BUD0=6.4,T_BUD1=10;
const T_BLOOM0=11.5;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const gcv=document.createElement('canvas'),gctx=gcv.getContext('2d');
const clamp=(x,a,b)=>x<a?a:x>b?b:x,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const cc=s=>s.charCodeAt(0);
const rnd=Math.random;
let W,H,dpr,fs,cw,ch,cols,rows,S;
let zb,chr,cR,cG,cB;
let stars=[],sparkles=[],pond=[],mound=[],blades=[],roots=[];

function resize(){
dpr=Math.min(window.devicePixelRatio||1,2);
W=innerWidth;H=innerHeight;
cv.width=W*dpr;cv.height=H*dpr;
ctx.setTransform(dpr,0,0,dpr,0,0);
// Slightly smaller font for higher resolution/detail
fs=Math.round(clamp(H/88,6,12));
ctx.font=fs+'px "Courier New",monospace';
cw=ctx.measureText('M').width;ch=fs;
cols=Math.ceil(W/cw);rows=Math.ceil(H/ch);
S=Math.min(H/2.5,W/1.9);
const n=cols*rows;
zb=new Float32Array(n);chr=new Uint16Array(n);
cR=new Uint8ClampedArray(n);cG=new Uint8ClampedArray(n);cB=new Uint8ClampedArray(n);
gcv.width=Math.ceil(W/6);gcv.height=Math.ceil(H/6);
}

function initBackground(){
stars=[];for(let i=0;i<170;i++)stars.push({x:rnd(),y:rnd()*0.97,sp:0.6+rnd()*2.2,ph:rnd()*6.28,m:0.4+rnd()*0.6});
sparkles=[];for(let i=0;i<9;i++)sparkles.push({x:rnd(),y:rnd()*0.85,sp:0.35+rnd()*0.7,ph:rnd()*6.28,len:3+rnd()*3});
pond=[];for(let i=0;i<560;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*1.2;pond.push({x:Math.cos(a)*r,z:Math.sin(a)*r,ph:rnd()*6.28});}
mound=[];for(let i=0;i<900;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*0.36;mound.push({x:Math.cos(a)*r,z:Math.sin(a)*r,r:r,n:rnd()});}
blades=[];for(let i=0;i<18;i++){const a=rnd()*6.283,r=0.06+rnd()*0.3;blades.push({x:Math.cos(a)*r,z:Math.sin(a)*r,h:0.07+rnd()*0.12,lx:(rnd()-0.5)*0.2,lz:(rnd()-0.5)*0.2,ph:rnd()*6.28,d:rnd()*0.8,g:rnd()});}
roots=[];for(let i=0;i<7;i++)roots.push({a:i/7*6.283+rnd()*0.5,len:0.2+rnd()*0.14,w:(rnd()-0.5)*0.5});
}

addEventListener('resize',resize);

let YAW=0,PITCH=0.60,cY=1,sY=0,cP=1,sP=0,swX=0,swZ=0,TT=0,REF=0;
const GY=-1.2,SH=1.2;
const toCol=vx=>(W/2+vx*S)/cw;
const toRow=vy=>(H*0.84-(vy-GY*cP)*S)/ch;

function put(c,r,d,code,R,G,B){
if(c<0||r<0||c>=cols||r>=rows)return;
if(REF){if((r+((TT*2)|0))%4===0)return;d-=450;R*=0.24;G*=0.3;B=B*0.38+16;}
const i=r*cols+c;
if(d>zb[i]){zb[i]=d;chr[i]=code;cR[i]=R;cG[i]=G;cB[i]=B;}
}

const RAMP=".`,:;!i1lItfrjLCJUOQ0GD8%&@#";
function rampCode(b,j){
let k=Math.floor(clamp(b,0,0.999)*RAMP.length+j);
return RAMP.charCodeAt(clamp(k,0,RAMP.length-1));
}
function hash3(a,b,c){return (((a*73856093)^(b*19349663)^(c*83492791))>>>0)%3;}

const WX=new Float32Array(4096),WY=new Float32Array(4096),WZ=new Float32Array(4096);
const VX=new Float32Array(4096),VY=new Float32Array(4096),VZ=new Float32Array(4096);

function setPt(k,x,y,z){
const h=(y-GY)*(1.75/SH),h2=h*h;
const dx=x+swX*h2,dz=z+swZ*h2;
WX[k]=dx;WY[k]=y;WZ[k]=dz;
let yy=y,xx=dx;
if(REF){yy=GY-(y-GY)*0.3;xx=dx+0.012*Math.sin(h*14+TT*2.2);}
const x1=xx*cY+dz*sY,z1=-xx*sY+dz*cY;
VX[k]=x1;VY[k]=yy*cP-z1*sP;VZ[k]=z1*cP+yy*sP;
}

const LX=-0.40,LY=0.60,LZ=0.69;
const P={f:0,o:0,glow:0,pv:0};

function shadeGrid(nu,nv,kind){
const w=nv+1,tick=Math.floor(TT*5);
for(let j=0;j<=nu;j++){
const j0=j>0?-w:0,j1=j<nu?w:0,u=j/nu;
for(let m=0;m<=nv;m++){
const k=j*w+m,m0=m>0?-1:0,m1=m<nv?1:0;
const a=k+j1,b=k+j0,c=k+m1,d=k+m0;
const ux=VX[a]-VX[b],uy=VY[a]-VY[b],uz=VZ[a]-VZ[b];
const vx=VX[c]-VX[d],vy=VY[c]-VY[d],vz=VZ[c]-VZ[d];
let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
const len=Math.sqrt(nx*nx+ny*ny+nz*nz);
if(len>1e-12){nx/=len;ny/=len;nz/=len}else{nx=0;ny=0;nz=1}
const dl=Math.abs(nx*LX+ny*LY+nz*LZ),rim=1-Math.abs(nz);
const v=m/nv*2-1;
let br,R,G,B,rb;
if(kind===0){
// highly detailed petal shader
const f=P.f,o=P.o;
br=0.15+0.65*dl+0.2*rim;

// Deep shadows for bud rendering to clearly define layers
const depth=lerp(0.35+0.65*f,0.3+0.7*f,o);
br*=depth*(0.2+0.8*smooth(u/0.4))*(0.85+0.3*P.pv);
br+=P.glow*0.45+Math.pow(dl,10)*0.2*o;

// Rim light to perfectly outline closed petals
const tip=smooth((u-0.75)/0.25)*lerp(0.2,0.55,o)*(0.4+0.6*f);
const edge=smooth((Math.abs(v)-0.75)/0.25)*lerp(0.15,0.25,o)*(0.3+0.7*f);
const tp=Math.min(1,tip+edge);

const av=Math.abs(v),vein=(av<0.05?1:0)*smooth((u-0.1)/0.2)*o*(1-smooth((u-0.8)/0.2));
const rimE=smooth((av-0.85)/0.15)*lerp(0.1,1.0,o)*smooth(u/0.3);
const gr=smooth((u-0.3)/0.7)*o*(0.35+0.45*f);

br=clamp(br+tp*0.25+vein*0.15+rimE*0.2,0,1);

// Rich Crimson / Pink palette
R=(50+205*br)*(0.9+0.1*P.pv);
G=2+40*br*br;
B=18+80*br+12*P.pv+25*f*br;

// Edge separation highlights
R+=(255-R)*tp*0.9;G+=(170-G)*tp*0.8;B+=(200-B)*tp*0.9;
R+=(255-R)*gr*0.3;G+=(175-G)*gr*0.55;B+=(205-B)*gr*0.55;

const hl=Math.min(1,rimE*0.8+vein*0.5);
R+=(255-R)*hl*0.5;G+=(205-G)*hl*0.5;B+=(220-B)*hl*0.5;

const g_=Math.min(1,P.glow);
R+=(255-R)*g_*0.5;G+=(210-G)*g_*0.5;B+=(220-B)*g_*0.5;

rb=br*0.75+Math.pow(dl,12)*0.25*o+tp*0.15+vein*0.08+rimE*0.1;
}else if(kind===1){
const av1=Math.abs(v),vn=av1<0.08,sv=!vn&&Math.abs(Math.sin((u*9-av1*1.8)*Math.PI))<0.13?0.14:0;
br=0.25+0.6*dl+0.15*rim+(vn?0.4:0)+sv+smooth((av1-0.8)/0.2)*0.1+P.glow*0.4;
br=clamp(br,0,1);
R=8+90*br*br;G=40+215*br;B=14+70*br;
const g_=Math.min(1,P.glow);R+=(220-R)*g_*0.4;G+=(255-G)*g_*0.2;B+=(220-B)*g_*0.4;
rb=br*0.82+(vn?0.12:0)+sv*0.5;
}else{
br=clamp(0.22+0.6*dl+0.15*rim+P.glow*0.3,0,1);
R=20+80*br*br;G=35+170*br;B=15+40*br;
rb=br;
}
const col=Math.floor(toCol(VX[k])),row=Math.floor(toRow(VY[k]));
put(col,row,VZ[k],rampCode(rb,hash3(col,row,tick)-1),R,G,B);
}
}
}

let SX=0,SY=0,SZ=0;
function stemPos(t){SX=0.07*Math.sin(2.2*t);SY=GY+SH*t;SZ=0.05*Math.sin(3*t+1);}
const RX=0.07*Math.sin(2.2),RZ=0.05*Math.sin(4);
const ST=220,SA=10;

function drawStem(g){
const n=Math.floor(g*ST),tick=Math.floor(TT*5);
for(let ti=0;ti<=n;ti++){
const t=ti/ST;stemPos(t);
const rad=0.032+0.014*(1-t)+0.05*Math.exp(-t*45);
const gh=g<0.999?Math.exp(-(g-t)*26):0;
for(let a=0;a<SA;a++){
const ang=a/SA*6.2832+t*5,ca=Math.cos(ang),sa=Math.sin(ang);
setPt(0,SX+rad*ca,SY,SZ+rad*sa);
const n1x=ca*cY+sa*sY,n1z=-ca*sY+sa*cY;
const nvx=n1x,nvy=-n1z*sP,nvz=n1z*cP;
const dl=Math.max(0,nvx*LX+nvy*LY+nvz*LZ);
let br=Math.min(1,0.28+0.62*dl+0.1*(1-Math.abs(nvz))+gh*0.5);
let R=8+60*br*br,G=70+185*br,B=18+50*br;
R+=(215-R)*gh;G+=(255-G)*gh;B+=(205-B)*gh;
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0]));
put(col,row,VZ[0],rampCode(br,hash3(col,row,tick)-1),R,G,B);
}
}
}

const HEAD={x:0,y:GY,z:0};
function drawHead(g,T){
stemPos(g);setPt(0,SX,SY,SZ);
HEAD.x=WX[0];HEAD.y=WY[0];HEAD.z=WZ[0];
const hv=1-clamp((T-T_GROW1)/1.4,0,1);if(hv<=0)return;
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0]));
put(col,row,60,cc('@'),255,255,235);
const pulse=0.85+0.15*Math.sin(T*20),chs='*+:.;';
for(let dr=-3;dr<=3;dr++)for(let dc=-5;dc<=5;dc++){
if(!dr&&!dc)continue;
const d=Math.hypot(dc/2,dr);if(d>2.6*hv)continue;
const p=(1-d/2.7)*pulse*hv;
if(rnd()<p*0.7)put(col+dc,row+dr,55,cc(chs[Math.floor(rnd()*5)]),120+130*p,255*(0.6+0.4*p),120+100*p);
}
}

const SNU=34,SNV=16;
const Rr=new Float32Array(128),Yr=new Float32Array(128),Wr=new Float32Array(128);

function drawStrip(bx,by,bz,phi,L,Wd,a0,a1,fold,wpow,kind){
const dx=Math.cos(phi),dz=Math.sin(phi),lx=-dz,lz=dx,du=1/SNU;
let R=0,Y=0;
for(let j=0;j<=SNU;j++){
const u=j*du,a=a0+a1*u;
Rr[j]=R;Yr[j]=Y;
R+=Math.sin(a)*L*du;Y+=Math.cos(a)*L*du;
Wr[j]=Wd*Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(u,kind===1?0.55:0.7))),wpow)*(kind===1?0.78+0.22*Math.abs(Math.sin(u*Math.PI*7)):1);
}
let k=0;
for(let j=0;j<=SNU;j++)for(let m=0;m<=SNV;m++){
const v=m/SNV*2-1,lat=v*Wr[j];
setPt(k++,bx+dx*Rr[j]+lx*lat,by+Yr[j]+fold*Math.abs(v)*Wr[j],bz+dz*Rr[j]+lz*lat);
}
shadeGrid(SNU,SNV,kind);
}

function drawHip(bs){
const NU=16,NV=24;let k=0;
for(let j=0;j<=NU;j++){const pol=j/NU*Math.PI;
for(let m=0;m<=NV;m++){const az=m/NV*6.2832;
// Slightly refined hip shape to look elegant
setPt(k++,RX+0.075*bs*Math.sin(pol)*Math.cos(az),-0.05-0.06*bs*Math.cos(pol),RZ+0.075*bs*Math.sin(pol)*Math.sin(az));}}
P.glow=0;shadeGrid(NU,NV,2);
}

// Increased detail: 36 Petals, tighter high-res grid
const NP=36,GA=2.39996323,NU=35,NV=45;
function drawPetal(i,ps,o,T){
const f=i/(NP-1),phi=i*GA;
// Longer petals in closed state to form a prominent beautiful bud
const L=lerp(0.70,0.35+0.35*f,o)*ps;
// Base connects tightly in closed form
const r0=lerp(0.015+0.06*f,0.04+0.10*f,o)*ps;
const h0=lerp(-0.06*f,-0.10*f,o)*ps;
const kc=0.6+0.6*f;
const to=0.10+0.60*Math.pow(f,1.2),co=0.20+0.45*f*f,io=0.40*Math.pow(1-f,1.5);

let R=r0,Y=h0;const du=1/NU;
for(let j=0;j<=NU;j++){
const u=j*du;
// Beautiful teardrop bulb shape when closed (o=0), fanning out smoothly when open
const ac=0.35-kc*(1.0*u+0.1*u*u);
const ao=to+co*u*u-io*u;
const a=ac+(ao-ac)*o;
Rr[j]=R;Yr[j]=Y;
R+=Math.sin(a)*L*du;Y+=Math.cos(a)*L*du;

const u4=u*u*u*u;
const wBud=0.45+0.55*Math.sin(u*Math.PI);
const wBloom=0.3+0.7*Math.min(1,u*2.2);
Wr[j]=lerp(wBud,wBloom,o)*Math.sqrt(Math.max(0,1-u4));
}
const om=lerp(1.25,0.55+0.35*f,o);
const lagA=0.035*o*Math.sin(1.3*T-0.3*i),lagB=0.025*o*Math.cos(1.1*T-0.25*i);
let k=0;
for(let j=0;j<=NU;j++){
const u=j/NU,u2=u*u,u3=u2*u,wj=Wr[j];
for(let m=0;m<=NV;m++){
const v=m/NV*2-1,th=phi+v*om*wj,vw=v*wj;
const rr=Rr[j]+o*u2*(0.06*vw*vw+0.025*Math.sin(6*v+i*1.7)*Math.abs(vw));
const yy=Yr[j]+o*(u2*0.04*vw*vw+u3*0.03*Math.sin(5*v+i*2.3)*wj);
setPt(k++,RX+rr*Math.cos(th)+lagA*u2,yy,RZ+rr*Math.sin(th)+lagB*u2);
}
}
P.f=f;P.o=o;P.glow=clamp(Math.pow(1-ps,1.2)*1.3,0,1);
P.pv=Math.abs(Math.sin(i*12.9898+1.3));
shadeGrid(NU,NV,0);
}

function drawCore(T){
const e=smooth(clamp((T-T_BLOOM0-1)/8,0,1));if(e<0.02)return;
const pl=0.8+0.2*Math.sin(T*3),cy=0.30,sp='*+.';
for(let i=0;i<16;i++){
const ang=i*GA,ca=Math.cos(ang),sa=Math.sin(ang),len=(0.07+0.09*((i*0.37)%1))*e;
for(let s=0;s<=6;s++){
const u=s/6,r=0.012+len*u,y=cy+0.11*e*u*(1.2-0.6*u);
setPt(0,RX+ca*r,y,RZ+sa*r);
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0])),d=VZ[0]+0.4;
if(s===6){const tw=0.7+0.3*Math.sin(T*4+i*1.7);put(col,row,d+0.05,cc(tw>0.9?'@':'*'),255,215*tw+40,90+60*tw);}
else put(col,row,d,cc(s<3?'|':':'),230,170+60*u,70+50*u);
}
}
let tc=0,tr=0;
for(let s=0;s<=5;s++){
const u=s/5;
setPt(0,RX,cy-0.02+0.12*e*u,RZ);
tc=Math.floor(toCol(VX[0]));tr=Math.floor(toRow(VY[0]));
put(tc,tr,VZ[0]+0.45,cc(s===5?'@':'|'),255,s===5?255:235*pl,s===5?235:190);
}
for(let dr=-2;dr<=1;dr++)for(let dc=-3;dc<=3;dc++){
if(!dr&&!dc)continue;
const d=Math.hypot(dc/2,dr);if(d>2.2)continue;
const p=(1-d/2.4)*pl*e;
if(rnd()<p*0.6)put(tc+dc,tr+dr,VZ[0]+0.44,cc(sp[Math.floor(rnd()*3)]),255*(0.7+0.3*p),200*(0.6+0.4*p),110+60*p);
}
}

const anchors=[];for(let i=0;i<6;i++)anchors.push({x:0,y:0,z:0,ok:false,used:false});
const petalAnchor={27:2,25:3,23:4,20:5};
const leaves=[
{ta:0.30,phi:Math.PI/2+0.9,L:0.8,W:0.1,a0:0.8,a1:1.7},
{ta:0.52,phi:Math.PI/2-0.8,L:0.66,W:0.085,a0:0.7,a1:1.6}
];
const state={pct:0,stage:'growing',g:0};

function scene(T){
const g=smooth(clamp((T-T_GROW0)/(T_GROW1-T_GROW0),0,1));
state.g=g;
const budS=clamp((T-T_BUD0)/(T_BUD1-T_BUD0),0,1),bs=smooth(budS);
drawStem(g);
leaves.forEach((lf,idx)=>{
const s=smooth((g-lf.ta)/0.2);
if(s<0.02){anchors[idx].ok=false;return;}
stemPos(lf.ta);
P.glow=(1-s)*1.2;
drawStrip(SX,SY,SZ,lf.phi,lf.L*s,lf.W*s,lerp(0.25,lf.a0,s),lerp(0.3,lf.a1,s),0.55,1.1,1);
const k=Math.floor(0.9*SNU)*(SNV+1)+(SNV>>1),a=anchors[idx];
a.x=WX[k];a.y=WY[k];a.z=WZ[k];a.ok=s>0.95;
});

let sumO=0;
if(budS>0.005){
drawHip(bs);

for(let i=0;i<NP;i++){
const f=i/(NP-1);
const ps=smooth(clamp(budS*1.8-f*0.8,0,1));
const o=smooth(clamp((T-T_BLOOM0-(1-f)*5)/7,0,1));
sumO+=o;
if(ps<0.02)continue;
drawPetal(i,ps,o,T);
const ai=petalAnchor[i];
if(ai!==undefined){
const k=NU*(NV+1)+(NV>>1),a=anchors[ai];
a.x=WX[k];a.y=WY[k];a.z=WZ[k];a.ok=o>0.7;
}
}
drawCore(T);
}
state.pct=sumO/NP*100;
state.stage=T<T_BUD0?'growing':T<T_BLOOM0?'bud':'in bloom';
if(T<T_GROW1+1.5)drawHead(g,T);
}

const mH=r=>0.085*Math.max(0,1-(r/0.36)*(r/0.36));

function drawGround(T){
const mf=smooth(T/1.4);
for(const p of mound){
if(p.r>0.04+0.32*mf)continue;
setPt(0,p.x,GY+mH(p.r)*mf,p.z);
const k=p.r/0.36,nx=p.x/0.36*0.7,nz=p.z/0.36*0.7,nl=Math.sqrt(nx*nx+1+nz*nz);
const dl=Math.max(0,(-0.4*nx+0.6+0.69*nz)/nl);
const br=clamp((0.3+0.5*dl+0.15*(1-k)+p.n*0.06)*(0.6+0.4*(1-k*k)),0,1);
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0]));
put(col,row,VZ[0],rampCode(br*0.85,0),70+130*br,45+80*br,28+40*br);
}
for(const r of roots){
for(let s=0;s<=12;s++){
const u=s/12;if(u>mf)break;
const rr=0.03+r.len*u,a=r.a+r.w*u;
const x=Math.cos(a)*rr,z=Math.sin(a)*rr;
setPt(0,x,GY+mH(rr)*mf+0.004,z);
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0]));
const sh=1-0.4*u;
put(col,row,VZ[0]+0.04,cc(u<0.5?'-':'.'),90*sh,64*sh,40*sh);
}
}
for(const b of blades){
const gr=smooth((T-0.3-b.d)/1.6);if(gr<=0.02)continue;
const y0=GY+mH(Math.hypot(b.x,b.z))*mf;
let pc=null;
for(let s=0;s<=6;s++){
const u=s/6,uu=u*u;
const x=b.x+(b.lx+0.05*Math.sin(T*1.3+b.ph))*uu*gr;
const z=b.z+b.lz*uu*gr;
setPt(0,x,y0+b.h*gr*u,z);
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0]));
let chn='|';
if(pc!==null){const dc=col-pc;chn=dc>0?'/':dc<0?'\\':'|';}
pc=col;
put(col,row,VZ[0]+0.05,cc(chn),20+50*u,95+110*b.g*(0.5+0.5*u),25+20*u);
}
}
}

function drawBackground(T){
for(const s of stars){
const tw=0.5+0.5*Math.sin(T*s.sp+s.ph),b=0.12+0.88*tw*tw*s.m;
const lv=Math.floor(60+170*b);
put(Math.floor(s.x*cols),Math.floor(s.y*rows),-1000,b>0.7?cc('*'):b>0.42?cc('+'):cc('.'),lv,lv,Math.min(255,lv*1.12));
}
for(const s of sparkles){
const I=Math.pow(Math.max(0,Math.sin(T*s.sp+s.ph)),3);if(I<0.05)continue;
const c=Math.floor(s.x*cols),r=Math.floor(s.y*rows),L=Math.round(1+I*s.len),lv=210*I;
put(c,r,-999,cc('*'),lv,lv,Math.min(255,lv*1.15));
for(let k=1;k<=L;k++){
const d=lv*(1-k/(L+1))*0.7,bl=Math.min(255,d*1.15);
put(c,r-k,-999,cc('|'),d,d,bl);put(c,r+k,-999,cc('|'),d,d,bl);
put(c-2*k,r,-999,cc('-'),d,d,bl);put(c+2*k,r,-999,cc('-'),d,d,bl);
}
}
const fade=clamp(T/1.5,0,1);
for(let i=0;i<pond.length;i++){
const p=pond[i];setPt(0,p.x,GY,p.z);
const q=(0.55+0.45*Math.sin(T*1.6+p.ph))*fade;
put(Math.floor(toCol(VX[0])),Math.floor(toRow(VY[0])),-500,cc(i%3?'.':'-'),18*q,50*q,85*q);
}
drawGround(T);
}

let parts=[],drops=[],ripples=[],spawnT=2,glitterAcc=0;

function emit(x,y,z,vx,vy,vz,life,ch,r,g,b,grav){
if(parts.length>400)return;
parts.push({x,y,z,vx,vy,vz,life,max:life,ch:cc(ch),r,g,b,grav});
}

function update(T,dt){
if(T>T_GROW0-0.3&&T<T_GROW1+0.8)
for(let n=0;n<2;n++)emit(HEAD.x+(rnd()-.5)*0.05,HEAD.y,HEAD.z+(rnd()-.5)*0.05,(rnd()-.5)*0.25,0.05+rnd()*0.2,(rnd()-.5)*0.25,0.8+rnd()*0.8,'*+.'[Math.floor(rnd()*3)],170,255,160,-0.1);
if(T>T_BLOOM0+4){
glitterAcc+=dt*3;
while(glitterAcc>1){glitterAcc--;emit(RX+(rnd()-.5)*1.0,0.1+rnd()*0.3,RZ+(rnd()-.5)*0.8,(rnd()-.5)*0.1,0.12+rnd()*0.15,(rnd()-.5)*0.1,2+rnd()*1.5,'*',255,150,180,0);}
}
for(let i=parts.length-1;i>=0;i--){
const p=parts[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=p.grav*dt;
if(p.life<=0||(p.grav>0&&p.y<GY))parts.splice(i,1);
}
spawnT-=dt;
if(spawnT<=0){
spawnT=0.9+rnd()*1.8;
if(drops.length<4){
const cand=anchors.filter(a=>a.ok&&!a.used);
if(cand.length){const a=cand[Math.floor(rnd()*cand.length)];a.used=true;
drops.push({a,st:0,age:0,hang:1.6+rnd()*2.4,x:a.x,y:a.y,z:a.z,vy:0});}
}
}
for(let i=drops.length-1;i>=0;i--){
const d=drops[i];d.age+=dt;
if(d.st===0){
d.x=d.a.x;d.y=d.a.y-0.03-0.015*Math.min(d.age,1.5);d.z=d.a.z;
if(d.age>d.hang){d.st=1;d.vy=0;}
}else{
d.vy-=4*dt;d.y+=d.vy*dt;
if(d.y<=GY){
for(let n=0;n<8;n++)emit(d.x,GY+0.01,d.z,(rnd()-.5)*0.7,0.8+rnd()*0.9,(rnd()-.5)*0.7,0.7,"'`.,"[Math.floor(rnd()*4)],170,225,255,4.5);
ripples.push({x:d.x,z:d.z,age:0});
d.a.used=false;drops.splice(i,1);
}
}
}
for(let i=ripples.length-1;i>=0;i--){ripples[i].age+=dt;if(ripples[i].age>1.9)ripples.splice(i,1);}
}

function drawFX(){
for(const p of parts){
setPt(0,p.x,p.y,p.z);
const a=clamp(p.life/p.max,0,1);
put(Math.floor(toCol(VX[0])),Math.floor(toRow(VY[0])),VZ[0]+0.2,a>0.25?p.ch:cc('.'),p.r*a,p.g*a,p.b*a);
}
for(const d of drops){
setPt(0,d.x,d.y,d.z);
const col=Math.floor(toCol(VX[0])),row=Math.floor(toRow(VY[0])),dz=VZ[0]+0.5;
const code=d.st===1?cc('o'):d.age<0.6?cc('.'):d.age<1.4?cc('o'):cc('O');
put(col,row,dz,code,175,235,255);
if(d.st===1){put(col,row-1,dz,cc(':'),110,170,210);put(col,row-2,dz,cc('.'),70,110,150);}
}
for(const r of ripples)for(let ring=0;ring<2;ring++){
const ra=r.age-ring*0.25;if(ra<=0||ra>1.6)continue;
const rad=ra*0.35+0.03,br=Math.pow(1-ra/1.6,1.5),n=Math.max(10,Math.floor(rad*60));
for(let k=0;k<n;k++){
const an=k/n*6.2832;setPt(0,r.x+Math.cos(an)*rad,GY,r.z+Math.sin(an)*rad);
put(Math.floor(toCol(VX[0])),Math.floor(toRow(VY[0])),-400,cc(ring?'-':'~'),95*br+10,175*br+10,225*br+10);
}
}
}

function drawHalo(T){
const hs=Math.max(clamp(state.pct/100,0,1),smooth(clamp((T-T_BUD0)/(T_BUD1-T_BUD0),0,1))*0.25);
if(hs<0.01)return;
const a=hs*(0.85+0.15*Math.sin(T*1.4));
ctx.save();ctx.globalCompositeOperation='lighter';
setPt(0,RX,0.28,RZ);
let px=toCol(VX[0])*cw,py=toRow(VY[0])*ch,R=S*0.95;
let g=ctx.createRadialGradient(px,py,0,px,py,R);
g.addColorStop(0,'rgba(255,70,130,'+(0.3*a)+')');
g.addColorStop(0.45,'rgba(200,30,100,'+(0.13*a)+')');
g.addColorStop(1,'rgba(120,10,60,0)');
ctx.fillStyle=g;ctx.fillRect(px-R,py-R,R*2,R*2);
setPt(0,0,GY,0);
px=toCol(VX[0])*cw;py=toRow(VY[0])*ch;R=S*0.85;
ctx.translate(px,py);ctx.scale(1,0.38);
g=ctx.createRadialGradient(0,0,0,0,0,R);
g.addColorStop(0,'rgba(255,100,150,'+(0.22*a)+')');
g.addColorStop(0.5,'rgba(220,60,120,'+(0.08*a)+')');
g.addColorStop(1,'rgba(150,30,80,0)');
ctx.fillStyle=g;ctx.fillRect(-R,-R,R*2,R*2);
ctx.restore();
}

const CHS=[],colorCache=new Map();

function render(T){
ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
drawHalo(T);
ctx.font=fs+'px "Courier New",monospace';ctx.textBaseline='top';ctx.textAlign='left';
let last=-1,count=0;
for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
const i=r*cols+c,code=chr[i];if(!code)continue;
if(zb[i]>-100)count++;
const key=((cR[i]>>2)<<12)|((cG[i]>>2)<<6)|(cB[i]>>2);
if(key!==last){
let s=colorCache.get(key);
if(!s){s='rgb('+((key>>12)<<2)+','+(((key>>6)&63)<<2)+','+((key&63)<<2)+')';colorCache.set(key,s);}
ctx.fillStyle=s;last=key;
}
ctx.fillText(CHS[code]||(CHS[code]=String.fromCharCode(code)),c*cw,r*ch);
}
gctx.imageSmoothingEnabled=true;
gctx.clearRect(0,0,gcv.width,gcv.height);
gctx.drawImage(cv,0,0,gcv.width,gcv.height);
ctx.save();ctx.setTransform(1,0,0,1,0,0);
ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.55;ctx.imageSmoothingEnabled=true;
ctx.drawImage(gcv,0,0,cv.width,cv.height);
ctx.restore();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
drawHUD(T,count);
}

function drawHUD(T,count){
const sm=Math.max(12,Math.round(fs*1.1));
const fa=0.25+0.75*smooth(clamp((T-T_BLOOM0-5)/4,0,1));
ctx.save();
ctx.font=sm+'px "Courier New",monospace';ctx.textBaseline='top';
if(W>520){
ctx.shadowColor='rgba(0,0,0,.95)';ctx.shadowBlur=5;
const y=H-sm*6.2,x=sm*1.5;
ctx.fillStyle='rgba(255,175,210,'+fa+')';
ctx.fillText(CONFIG.signature,x,y);
ctx.fillStyle='rgba(238,238,248,'+fa+')';
ctx.fillText('stage   '+state.stage,x,y+sm*1.3);
ctx.fillText('bloom   '+state.pct.toFixed(1)+'%   sway '+(swX*100).toFixed(2)+'°',x,y+sm*2.6);
ctx.fillText('letters '+count.toLocaleString(),x,y+sm*3.9);
}
ctx.restore();
ctx.globalAlpha=1;ctx.textAlign='left';
}

let t0=performance.now(),lastT=t0;

function frame(now){
requestAnimationFrame(frame);
const T=Math.max(0,(now-t0)/1000),dt=clamp((now-lastT)/1000,0,0.05);lastT=now;TT=T;
zb.fill(-1e9);chr.fill(0);
YAW=0.1+0.32*Math.sin(T*0.23);PITCH=0.60+0.04*Math.sin(T*0.17);
cY=Math.cos(YAW);sY=Math.sin(YAW);cP=Math.cos(PITCH);sP=Math.sin(PITCH);
swX=0.05*(Math.sin(0.9*T)*0.7+Math.sin(0.37*T+1)*0.5);
swZ=0.02*Math.sin(0.6*T+2);
drawBackground(T);
scene(T);
REF=1;scene(T);REF=0;
update(T,dt);
drawFX();
render(T);
}

cv.addEventListener('pointerdown',()=>{t0=performance.now();parts=[];drops=[];ripples=[];anchors.forEach(a=>{a.ok=false;a.used=false});spawnT=2;});

resize();initBackground();
requestAnimationFrame(frame);