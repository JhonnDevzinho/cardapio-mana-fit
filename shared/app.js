const K='mana_fit_house_v1',MAX=20,$=s=>document.querySelector(s),R=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),num=v=>parseFloat(String(v||'').replace(',','.'))||0;
const seed=()=>({cats:[{id:'c1',name:'Proteicos'},{id:'c2',name:'Sucos & Shakes'}],products:[
{id:'p1',cat:'c1',name:'Barra de proteína',desc:'Uma opção prática e saborosa para complementar sua alimentação.',em:'🍽️',price:15},
{id:'p2',cat:'c1',name:'Pão de mel com doce de leite',desc:'Delicioso pão de mel macio e fofinho, com um irresistível recheio de doce de leite.',em:'🍽️',price:12},
{id:'p3',cat:'c1',name:'Pão de mel com geleia de morango',desc:'Pão de mel macio e fofinho, com um delicioso recheio de geleia de morango.',em:'🍽️',price:12},
{id:'p4',cat:'c1',name:'Pizza proteica',desc:'Uma opção deliciosa que combina sabor e praticidade! Uma pizza com toque especial de proteína.',em:'🍽️',price:37},
{id:'p5',cat:'c1',name:'Empada proteica',desc:'Uma empada deliciosa, com massa saborosa e um recheio irresistível!',em:'🍽️',price:8},
{id:'p6',cat:'c1',name:'Picolé proteico sem cobertura',desc:'Refrescante, cremoso e delicioso! Uma opção geladinha com proteína para adoçar o seu dia.',em:'🍽️',price:15},
{id:'p7',cat:'c1',name:'Picolé proteico com cobertura',desc:'Refrescante, cremoso e irresistível! Um delicioso picolé proteico com uma camada de cobertura.',em:'🍽️',price:17},
{id:'p8',cat:'c2',name:'Hype Drink',desc:'Bebida funcional preparada com uma combinação de produtos Herbalife.',em:'🍽️',price:28},
{id:'p9',cat:'c2',name:'Batida proteica',desc:'Uma opção prática e saborosa, preparada com proteínas de alta qualidade.',em:'🍽️',price:25}],cart:[],whats:'',orders:[],dlv:null,pick:{min:15,max:25},zones:[{n:'Centro',fee:5,min:30,max:40},{n:'Bairro Alto',fee:7,min:40,max:50},{n:'Nova Esperança',fee:9,min:45,max:60}]});
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}if(!S||!S.products)S=seed();{const d=seed();for(const k of['orders','pick','zones'])if(!S[k])S[k]=d[k]}
let tab='home',adm=false,qs='',cur,ed,delArm=0,dr,TOK=null,AO=[],CRED=null,lastCfg='';
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('Sem espaço para salvar (imagem grande?)')}if(TOK&&adm)pushCfg()};
function toast(t){const e=$('#ts');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2200)}
const has=p=>p.opts&&p.opts.length,base=p=>has(p)?Math.min(...p.opts.filter(o=>!o.so).map(o=>o.p),Infinity)||p.opts[0].p:p.price;
const img=p=>p.img?`<img src="${p.img}" alt="">`:(p.em||'🍽️');
const priceH=p=>has(p)?`A partir de ${R(base(p))}`:p.old>p.price?`<span class="g">${R(p.price)}</span><span class="old">${R(p.old)}</span><span class="pct">-${Math.round((1-p.price/p.old)*100)}%</span>`:R(p.price);
const edB=p=>adm?`<button class="ed" data-e="${p.id}">✎</button>`:'';
const card=p=>`<div class="pc${p.so?' so':''}" data-o="${p.id}"><div class="tx">${p.badge?`<span class="bd">${esc(p.badge)}</span>`:''}<b>${esc(p.name)}</b><p>${esc(p.desc)}</p><div>${priceH(p)}</div></div><div class="im">${img(p)}</div>${p.so?'<i class="rb">Esgotado</i>':''}${edB(p)}</div>`;
const fcard=p=>`<div class="fc${p.so?' so':''}" data-o="${p.id}"><div class="im">${img(p)}</div>${p.badge?`<span class="bd" style="align-self:flex-start">${esc(p.badge)}</span>`:''}<b>${esc(p.name)}</b><p>${esc(p.desc)}</p><div style="margin-top:auto">${priceH(p)}</div>${edB(p)}</div>`;
function listH(){const pr=S.products.filter(x=>!qs||(x.name+' '+x.desc).toLowerCase().includes(qs));let h='';const ft=pr.filter(p=>p.feat);
if(ft.length)h+=`<h2 id="c-d">Destaques</h2><div class="fr">${ft.map(fcard).join('')}</div>`;
S.cats.forEach(c=>{const l=pr.filter(p=>p.cat===c.id);if(l.length)h+=`<h2 id="c-${c.id}">${esc(c.name)}</h2>${l.map(card).join('')}`});
return h||'<p class="em">Nenhum produto encontrado.</p>'}
const foot=()=>`<div class="foot">Maná Fit House - 2026. Todos os direitos reservados<br>Cardápio digital${window.Admin?'<br><button data-a="lj" style="color:#fff;opacity:.75;text-decoration:underline;font-size:11px">Área do lojista</button>':''}</div>`;
function cartTotal(){return S.cart.reduce((a,i)=>a+i.total,0)}
function render(){const m=$('#m');let h='';
if(tab==='home')h=`<div class="cover">MANÁ FIT HOUSE</div><div class="info"><img class="logo" src="${LOGO_URL}" alt="Maná Fit House"><h1>Maná Fit House</h1><p>📍 Comida saudável • Mais informações</p>${statusH()}</div>
<div class="row">📍<div><b>Entrega: ${R(DEL.fee)}</b><span>${DEL.min} a ${DEL.max} minutos • Retirada no local: sem taxa</span></div></div>

<div class="bar" id="bar"><img class="mini" src="${LOGO_URL}" alt=""><button class="sb" data-a="s">🔍</button></div>
<div id="sw" hidden><input id="q" placeholder="Buscar no cardápio" value="${esc(qs)}"></div><div id="list">${listH()}</div>${foot()}`;
else h=ordersH();
m.innerHTML=h+(adm&&tab==='home'?'<button class="fab" data-a="new">＋ Novo produto</button>':'');
document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
const n=$('#cn');n.textContent=S.cart.length;n.hidden=!S.cart.length;if($('#sw')&&qs)$('#sw').hidden=false}
let LOCK=0;const open=h=>{LOCK=0;const s=$('#sh'),t=s.querySelector('.sc')?.scrollTop||0;s.innerHTML=h;const c=s.querySelector('.sc');if(c)c.scrollTop=t;$('#ov').classList.add('on')},close=()=>{LOCK=0;$('#ov').classList.remove('on')};
function selN(){return Object.values(cur.sel).reduce((a,b)=>a+b,0)}
function tot(){const{p,q,sel}=cur;return(has(p)?p.opts.reduce((a,o,i)=>a+(sel[i]||0)*o.p,0):p.price)*q}
function sheet(){const o=$('#obs');if(o)cur.obs=o.value;const{p,q,sel,obs}=cur,n=selN(),ok=!has(p)||n>=1;
open(`<div class="sc"><div style="position:relative"><div class="im big">${img(p)}</div><button class="x" data-x>✕</button></div><div class="pad"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div>${priceH(p)}</div></div>
${has(p)?`<div class="gh"><b>Escolha uma opção:</b><span class="cnt${n?' ok':''}">${n}/${MAX}</span><em>OBRIGATÓRIO</em><small>Escolha de 1 a ${MAX} opções</small></div>${p.opts.map((o,i)=>`<div class="op"><div>${esc(o.n)}<small>+ ${R(o.p)}</small></div>${o.so?'<span class="fa">EM FALTA</span>':`<div class="st">${sel[i]?`<button data-m="${i}">−</button><span>${sel[i]}</span>`:''}<button data-p="${i}" ${n>=MAX?'disabled':''}>+</button></div>`}</div>`).join('')}`:''}
<div class="pad"><label>Alguma observação? <span>${(obs||'').length} / 140</span></label><textarea id="obs" maxlength="140" oninput="this.previousElementSibling.lastChild.textContent=this.value.length+' / 140'">${esc(obs||'')}</textarea></div></div>
<div class="ft"><div class="st"><button data-q="-1" ${q<2?'disabled':''}>−</button><span>${q}</span><button data-q="1">+</button></div><button class="btn" data-a="add" ${ok?'':'disabled'}>Adicionar<span>${R(tot())}</span></button></div>`)}
function addCart(){cur.obs=$('#obs').value;const{p,q,sel,obs}=cur;S.cart.push({pid:p.id,sel:{...sel},name:p.name,q,total:tot(),obs,opts:has(p)?p.opts.map((o,i)=>sel[i]?`${sel[i]}x ${o.n}`:'').filter(Boolean):[]});save();close();render();toast('Adicionado à sacola')}
function editor(id){const p=id?S.products.find(x=>x.id===id):null;ed=p?{...p}:{cat:S.cats[0]?.id,em:'🍽️'};delArm=0;
open(`<div class="sc"><div class="pad f"><h3>${p?'Editar produto':'Novo produto'}</h3>
<label>Nome</label><input id="f-n" value="${esc(ed.name)}"><label>Descrição</label><textarea id="f-d">${esc(ed.desc)}</textarea>
<label>Categoria</label><select id="f-c">${S.cats.map(c=>`<option value="${c.id}" ${c.id===ed.cat?'selected':''}>${esc(c.name)}</option>`).join('')}</select>
<label>Preço (R$)</label><input id="f-p" inputmode="decimal" value="${ed.price||''}"><label>Preço antigo (opcional, mostra desconto)</label><input id="f-old" inputmode="decimal" value="${ed.old||''}">
<label>Selo</label><select id="f-b"><option value="">Nenhum</option><option ${ed.badge==='NOVIDADE'?'selected':''}>NOVIDADE</option><option ${ed.badge==='MAIS VENDIDO'?'selected':''}>MAIS VENDIDO</option></select>
<label>Opções (uma por linha: Nome | preço | esgotado). Se preencher, o preço acima é ignorado</label><textarea id="f-o" placeholder="Frango | 22,90">${esc((ed.opts||[]).map(o=>`${o.n} | ${String(o.p).replace('.',',')}${o.so?' | esgotado':''}`).join('\n'))}</textarea>
<label>Foto</label><input type="file" id="f-i" accept="image/*"><div class="im" id="pv">${img(ed)}</div><label>Emoji (usado sem foto)</label><input id="f-e" value="${esc(ed.em)}" maxlength="4">
<label class="chk"><input type="checkbox" id="f-f" ${ed.feat?'checked':''}>Mostrar em Destaques</label><label class="chk"><input type="checkbox" id="f-s" ${ed.so?'checked':''}>Esgotado</label></div></div>
<div class="ft">${p?'<button class="btn r" data-a="del" style="flex:.6">Excluir</button>':''}<button class="btn o" data-x>Cancelar</button><button class="btn" data-a="sv" style="justify-content:center">Salvar</button></div>`)}
function saveEd(){const g=i=>$('#'+i).value.trim(),n=g('f-n');if(!n)return toast('Informe o nome');
const opts=g('f-o').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[a,b,c]=l.split('|').map(s=>s.trim());return{n:a,p:num(b),...(c?{so:1}:{})}});
const p={...ed,name:n,desc:g('f-d'),cat:$('#f-c').value,price:num(g('f-p')),old:num(g('f-old')),badge:$('#f-b').value,opts,em:g('f-e')||'🍽️',feat:$('#f-f').checked?1:0,so:$('#f-s').checked?1:0};
if(!opts.length&&!p.price)return toast('Informe o preço');
if(!p.id){p.id='p'+Date.now();S.products.push(p)}else S.products[S.products.findIndex(x=>x.id===p.id)]=p;save();close();render();toast('Produto salvo')}
function pick(f){const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,420/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);ed.img=c.toDataURL('image/jpeg',.7);$('#pv').innerHTML=`<img src="${ed.img}">`};i.src=r.result};r.readAsDataURL(f)}
document.addEventListener('click',e=>{const t=e.target.closest('[data-t],[data-o],[data-e],[data-x],[data-a],[data-p],[data-m],[data-q],[data-dm],[data-pm],[data-md]');if(e.target.id==='ov')return LOCK?0:close();if(!t)return;const d=t.dataset;
if(d.pm){PM=d.pm;document.querySelectorAll('[data-pm]').forEach(b=>b.classList.toggle('on',b.dataset.pm===PM));$('#pmi').textContent=pmInfo();return}
if(d.md){MD=d.md;document.querySelectorAll('[data-md]').forEach(b=>b.classList.toggle('on',b.dataset.md===MD));$('#adw').hidden=MD!=='entrega';$('#mdi').innerHTML=mdInfo();$('#tt').innerHTML=totH();return}
if(d.t){tab=d.t;scrollTo(0,0);return render()}
if(d.e!==undefined){e.stopPropagation();return editor(d.e)}
if(d.o){const p=S.products.find(x=>x.id===d.o);if(p&&!p.so){cur={p,q:1,sel:{},obs:''};sheet()}else if(p)toast('Produto esgotado');return}
if(d.x!==undefined)return close();
if(d.p!==undefined){cur.sel[d.p]=(cur.sel[d.p]||0)+1;return sheet()}
if(d.m!==undefined){cur.sel[d.m]--;if(!cur.sel[d.m])delete cur.sel[d.m];return sheet()}
if(d.q){cur.q=Math.max(1,cur.q+ +d.q);return sheet()}
if(d.dm){dr.mode=d.dm;return dlvSheet()}
switch(d.a){case'add':return addCart();case'new':return editor();case'sv':return saveEd();
case'del':if(!delArm){delArm=1;t.textContent='Confirmar?';return}S.products=S.products.filter(x=>x.id!==ed.id);save();close();render();return toast('Produto excluído');
case's':{const w=$('#sw');w.hidden=!w.hidden;if(!w.hidden)$('#q').focus();return}
case'rm':S.cart.splice(+d.i,1);save();return render();
case'dlv':dr={mode:S.dlv?S.dlv.mode:'entrega',z:S.dlv&&S.dlv.z!=null?S.dlv.z:''};return dlvSheet();
case'dok':if(dr.mode==='entrega'&&dr.z==='')return toast('Selecione o bairro');S.dlv={mode:dr.mode,z:dr.z===''?null:+dr.z};save();close();return render();
case'chk':if(!aberto())return toast(fechadoMsg());return chkSheet();
case'place':return place();
case'adv':return adv(d.i,d.u);
case'payok':return payok(d.i);
case'copy':return copyPix(d.i);
case'paycard':return cardSheet(d.i);
case'demopay':return demoSheet(d.i);
case'cancelpay':return cancelOrder(d.i);
case'demopix':{const o=(S.orders||[]).find(x=>x.id===d.i);if(o&&!o.paid){o.paid=1;o.demo=1;save();render();toast('Pagamento simulado confirmado')}return}
case'demook':return demoOk(d.i);
case'newpix':return newPix(d.i);
default:return window.Admin&&Admin.act(d.a,d,t)}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!LOCK)close()});
document.addEventListener('input',e=>{if(e.target.id==='q'){qs=e.target.value.toLowerCase();document.body.classList.add('q');$('#list').innerHTML=listH()}if(e.target.id==='wh'){S.whats=e.target.value;save()}});
document.addEventListener('change',e=>{if(e.target.id==='cs'&&e.target.value){const el=$('#c-'+e.target.value);el&&el.scrollIntoView({behavior:'smooth'});e.target.value=''}if(e.target.id==='f-i'&&e.target.files[0])pick(e.target.files[0]);if(e.target.id==='dz'){dr.z=e.target.value;dlvSheet()}});
addEventListener('scroll',()=>{const b=$('#bar');b&&b.classList.toggle('stuck',b.getBoundingClientRect().top<=(parseFloat(getComputedStyle(b).top)||0)+1)},{passive:true});
const dlvLabel=()=>{const d=S.dlv;if(!d)return'<b>Calcular taxa e tempo de entrega</b>';if(d.mode==='retirada')return`<b>Retirada no local</b><span>Sem taxa • ${S.pick.min}-${S.pick.max} min</span>`;const z=S.zones[d.z];return z?`<b>Entrega para ${esc(z.n)}</b><span>${R(z.fee)} • ${z.min}-${z.max} min</span>`:'<b>Calcular taxa e tempo de entrega</b>'};
const DEL={fee:6,min:15,max:30},fee=()=>MD==='retirada'?0:DEL.fee;
let PM='pix',MD='entrega';
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+(m||0)};
const hh=t=>{const[h,m]=t.split(':');return +h+'h'+(m&&m!=='00'?m:'')};
const nowMin=()=>{const p=new Intl.DateTimeFormat('pt-BR',{timeZone:FUSO,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return +p.find(x=>x.type==='hour').value*60+ +p.find(x=>x.type==='minute').value};
const aberto=()=>{const n=nowMin();return n>=mins(HORARIO.abre)&&n<mins(HORARIO.fecha)};
const quando=()=>nowMin()<mins(HORARIO.abre)?'hoje':'amanhã';
const fechadoMsg=()=>`Estamos fechados. Abrimos ${quando()} às ${hh(HORARIO.abre)}.`;
const statusH=()=>aberto()?`<p class="open">Aberto • Fechamos às ${hh(HORARIO.fecha)}</p>`:`<p class="closed">Fechado • Abrimos ${quando()} às ${hh(HORARIO.abre)}</p>`;
let LA=aberto();
const cpfOk=c=>{const d=[...c].map(Number);if(new Set(d).size===1)return false;for(const n of[9,10]){let t=0;for(let i=0;i<n;i++)t+=d[i]*(n+1-i);if((t*10%11)%10!==d[n])return false}return true};
const pixKeyErr=()=>{const k=String(PIX_CHAVE||'').trim();return /^\+55\d{2}9\d{8}$/.test(k)||(/^\d{11}$/.test(k)&&cpfOk(k))||/^\d{14}$/.test(k)||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k)||/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)?'':'A chave Pix em config.js parece inválida. Celular: use +55, DDD e 9 dígitos (ex.: +5584999999999), com o +55.'};const PIX_TTL=300;
const tlv=(i,v)=>i+String(v.length).padStart(2,'0')+v;
function crc16(t){let c=0xFFFF;for(let i=0;i<t.length;i++){c^=t.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function pixCode(v,txid){const p=tlv('00','01')+tlv('01','11')+tlv('26',tlv('00','br.gov.bcb.pix')+tlv('01',PIX_CHAVE))+tlv('52','0000')+tlv('53','986')+tlv('54',v.toFixed(2))+tlv('58','BR')+tlv('59',PIX_NOME)+tlv('60',PIX_CIDADE)+tlv('62',tlv('05',txid))+'6304';return p+crc16(p)}
const PAYN={pix:'Pix',credito:'Cartão de crédito',debito:'Cartão de débito'};
const cardLink=(m,v,id)=>{const l=m==='credito'?LINK_CREDITO:LINK_DEBITO;return l?l.replace('{valor}',v.toFixed(2)).replace('{pedido}',id):''};
const ONLINE=()=>!!(typeof MP_PUBLIC_KEY!=='undefined'&&MP_PUBLIC_KEY&&FB.url);
const DEMO=()=>typeof DEMO_CARTAO!=='undefined'&&DEMO_CARTAO&&!FB.url&&!(typeof MP_PUBLIC_KEY!=='undefined'&&MP_PUBLIC_KEY);
const pixOK=()=>pixViaMp()||DEMO()||!pixKeyErr();
const pixViaMp=()=>ONLINE()&&typeof PIX_VIA_MP!=='undefined'&&!!PIX_VIA_MP;
const siteOK=k=>ONLINE()||DEMO()||!!cardLink(k,1,'x');
const pmInfo=()=>PM==='pix'?(pixViaMp()?'Você recebe o QR Code e o código copia e cola, válidos por 5 minutos. O pagamento é confirmado automaticamente.':'Você recebe o QR Code e o código copia e cola, válidos por 5 minutos. O lojista confirma o pagamento.'):(DEMO()?'Demonstração: o pagamento é simulado e nenhum valor é cobrado.':'Você paga com o cartão de forma segura, direto no site.');
const mdInfo=()=>MD==='entrega'?`Entrega: ${R(DEL.fee)} • ${DEL.min}-${DEL.max} min`:`Retirada no local: sem taxa • pronto em ${RETIRADA.min}-${RETIRADA.max} min${LOJA_ENDERECO?'<br>'+esc(LOJA_ENDERECO):''}`;
const totH=()=>`Subtotal: ${R(cartTotal())}<br>${MD==='entrega'?'Taxa de entrega: '+R(DEL.fee):'Retirada: sem taxa'}<br><b style="font-size:16px">Total: ${R(cartTotal()+fee())}</b>`;
const fmt=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return String(t/60|0).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
function qrSvg(t){try{const q=qrcode(0,'M');q.addData(String(t));q.make();return q.createSvgTag({cellSize:4,margin:16})}catch(e){return''}}
function dlvSheet(){const d=dr,z=d.mode==='entrega'&&d.z!==''?S.zones[d.z]:null;
const rb=d.mode==='retirada'?`Retire no local, sem taxa<br>Pronto em <b>${S.pick.min}-${S.pick.max} min</b>`:z?`Taxa de entrega: <b>${R(z.fee)}</b><br>Tempo estimado: <b>${z.min}-${z.max} min</b>`:'Selecione seu bairro para ver a taxa e o tempo de entrega.';
open(`<div class="sc"><div class="pad f"><h3>Taxa e tempo de entrega</h3><div style="display:flex;gap:8px;margin:6px 0"><button class="btn${d.mode==='entrega'?'':' o'}" data-dm="entrega" style="justify-content:center">Entrega</button><button class="btn${d.mode==='retirada'?'':' o'}" data-dm="retirada" style="justify-content:center">Retirada</button></div>
${d.mode==='entrega'?`<label>Seu bairro</label><select id="dz"><option value="">Selecione o bairro</option>${S.zones.map((z,i)=>`<option value="${i}" ${String(d.z)===String(i)?'selected':''}>${esc(z.n)}</option>`).join('')}</select>`:''}<div class="rs">${rb}</div></div></div><div class="ft"><button class="btn o" data-x>Cancelar</button><button class="btn" data-a="dok" style="justify-content:center">Confirmar</button></div>`)}
function chkSheet(){PM=pixOK()?'pix':'credito';MD='entrega';open(`<div class="sc"><div class="pad f"><h3>Finalizar pedido</h3>
<label>Como você quer receber?</label><div class="pm"><button data-md="entrega" class="on">Entrega</button><button data-md="retirada">Retirada no local</button></div><small id="mdi" style="color:var(--mu)">${mdInfo()}</small>
<label>Seu nome</label><input id="cn2"><div id="adw"><label>Endereço (rua, número e complemento)</label><input id="ad"></div>
<label>Forma de pagamento</label><div class="pm">${Object.keys(PAYN).map(k=>`<button data-pm="${k}" class="${k===PM?'on':''}" ${(k==='pix'?!pixOK():!siteOK(k))?'disabled':''}>${PAYN[k]}${(k==='pix'?!pixOK():!siteOK(k))?' (indisponível)':''}</button>`).join('')}</div><small id="pmi" style="color:var(--mu)">${pmInfo()}</small>
<p id="tt" style="margin-top:14px">${totH()}</p></div></div><div class="ft"><button class="btn o" data-x>Voltar</button><button class="btn" data-a="place" style="justify-content:center">Enviar pedido</button></div>`)}
const orders=()=>adm&&FB.url?AO:(S.orders||[]),ST=['Recebido','Em preparo','Saiu para entrega','Entregue'],STR=['Recebido','Em preparo','Pronto para retirada','Retirado'],stl=o=>o.mode==='retirada'?STR:ST;
async function fb(m,p,b,q){const r=await fetch(FB.url.replace(/\/$/,'')+'/'+p+'.json?'+(TOK?'auth='+TOK+'&':'')+(q||''),{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});if(!r.ok)throw new Error(r.status);return r.json()}
const rid=()=>Array.from(crypto.getRandomValues(new Uint8Array(10)),x=>(x%36).toString(36)).join('');
async function place(){if(!aberto())return toast(fechadoMsg());if(PM==='pix'?!pixOK():!siteOK(PM))return toast('Forma de pagamento indisponível no momento');const nm=$('#cn2').value.trim(),ad=($('#ad')||{value:''}).value.trim();if(!nm)return toast('Informe seu nome');if(MD==='entrega'&&!ad)return toast('Informe o endereço');
const o={id:rid(),at:Date.now(),name:nm,addr:MD==='entrega'?ad:'',mode:MD,zone:'',eta:MD==='entrega'?DEL.min+'-'+DEL.max:RETIRADA.min+'-'+RETIRADA.max,items:S.cart.map(i=>({pid:i.pid||'',sel:i.sel||{},q:i.q,name:i.name,opts:i.opts,obs:i.obs||'',total:i.total})),total:cartTotal()+fee(),st:0,pay:PM,paid:0};
if(PM==='pix'){o.pix=pixCode(o.total,o.id.toUpperCase());o.pixExp=Date.now()+PIX_TTL*1000}else{const l=cardLink(PM,o.total,o.id.toUpperCase());if(l&&!ONLINE())o.plink=l}
S.orders=[o,...(S.orders||[])];
if(FB.url){try{await fb('PUT','orders/'+o.id,o)}catch(e){o.pend=1;toast('Sem conexão: vamos reenviar automaticamente')}}
if(pixViaMp()&&!o.pend&&PM==='pix'){try{const r=await api('pix',{orderId:o.id});if(r.qr_code){o.pix=r.qr_code;o.dyn=1;o.total=r.total||o.total;o.pixExp=Date.now()+(r.ttl||PIX_TTL)*1000}}catch(e){}}
S.cart=[];save();close();tab='orders';render();toast('Pedido enviado!');if(o.plink)window.open(o.plink,'_blank');if(ONLINE()&&PM!=='pix'&&!o.pend)cardSheet(o.id);else if(DEMO()&&PM!=='pix')demoSheet(o.id)}
async function adv(id){try{const o=orders().find(x=>x.id===id);if(!o||o.st>2)return;if(FB.url&&TOK)await fb('PATCH','orders/'+id,{st:o.st+1});o.st++;if(!(FB.url&&TOK))save();render()}catch(e){toast('Não foi possível atualizar')}}
const IE=['📥','👨‍🍳','🛵','✅'],IR=['📥','👨‍🍳','🛍️','✅'];
const api=(p,b)=>fetch((typeof API_URL!=='undefined'?API_URL:'')+'/api/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||r.status);return j});
const loadMP=()=>window.MercadoPago?Promise.resolve():new Promise((ok,no)=>{const e=document.createElement('script');e.src='https://sdk.mercadopago.com/js/v2';e.onload=ok;e.onerror=no;document.head.appendChild(e)});
async function cardSheet(id){const o=(S.orders||[]).find(x=>x.id===id);if(!o||o.paid)return;
open(`<div class="sc"><div class="pad"><h3>Pagamento com ${PAYN[o.pay]}</h3><p style="color:var(--mu)">Total: ${R(o.total)}</p><div id="cardBrick"></div><p id="cardMsg" style="margin-top:8px"></p></div></div><div class="ft"><button class="btn o" data-a="cancelpay" data-i="${id}" style="justify-content:center">Cancelar</button></div>`);
LOCK=1;const msg=t=>{const e=$('#cardMsg');if(e)e.textContent=t};
try{await loadMP();const mp=new MercadoPago(MP_PUBLIC_KEY,{locale:'pt-BR'});
await mp.bricks().create('cardPayment','cardBrick',{initialization:{amount:o.total},customization:{paymentMethods:{minInstallments:1,maxInstallments:o.pay==='debito'?1:3}},callbacks:{onReady:()=>{},onError:e=>console.error(e),
onSubmit:async d=>{let r;try{r=await api('cartao',{...d,orderId:id})}catch(e){msg('Não foi possível processar o pagamento. Tente novamente.');throw e}
if(r.status==='approved'){o.paid=1;save();close();render();toast('Pagamento aprovado!');return}
if(r.status==='in_process'||r.status==='pending'){msg('Pagamento em análise. Avisaremos aqui quando for confirmado.');return}
msg('Pagamento recusado. Confira os dados ou use outro cartão.');throw new Error(r.status)}}})}catch(e){msg('Não foi possível carregar o pagamento agora. Tente de novo mais tarde.')}}
function demoSheet(id){const o=(S.orders||[]).find(x=>x.id===id);if(!o||o.paid)return;
open(`<div class="sc"><div class="pad f"><h3>Pagamento com ${PAYN[o.pay]}</h3><p class="dm">⚠️ MODO DEMONSTRAÇÃO: nenhum cartão é cobrado ou guardado.</p><p style="color:var(--mu)">Total: ${R(o.total)}</p>
<label>Número do cartão</label><input id="dc" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="0000 0000 0000 0000">
<label>Nome impresso no cartão</label><input id="dn" autocomplete="off">
<div style="display:flex;gap:8px"><div style="flex:1"><label>Validade</label><input id="dv" placeholder="MM/AA" maxlength="5" inputmode="numeric" autocomplete="off"></div><div style="flex:1"><label>CVV</label><input id="dx" inputmode="numeric" maxlength="4" autocomplete="off"></div></div>
${o.pay==='credito'?'<label>Parcelas</label><select id="dp"><option>1x sem juros</option><option>2x sem juros</option><option>3x sem juros</option></select>':''}</div></div><div class="ft"><button class="btn o" data-a="cancelpay" data-i="${id}" style="justify-content:center">Cancelar</button><button class="btn" data-a="demook" data-i="${id}" style="justify-content:center">Pagar ${R(o.total)}</button></div>`);LOCK=1}
function demoOk(id){const g=i=>$('#'+i).value.trim(),o=(S.orders||[]).find(x=>x.id===id);if(!o)return;if(g('dc').replace(/\D/g,'').length<13||!g('dn')||!/^\d\d\/\d\d$/.test(g('dv'))||g('dx').length<3)return toast('Confira os dados do cartão');o.paid=1;o.demo=1;save();close();render();toast('Pagamento aprovado (simulação)')}
addEventListener('input',e=>{const t=e.target;if(t.id==='dc')t.value=t.value.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ');if(t.id==='dv'){const v=t.value.replace(/\D/g,'').slice(0,4);t.value=v.length>2?v.slice(0,2)+'/'+v.slice(2):v}});
const payH=o=>{const L=PAYN[o.pay];if(!L)return'';
if(o.paid)return`<div class="pg ok">✅ Pagamento confirmado • ${L}${o.demo?' (simulação)':''}</div>`;
if(o.pay==='pix'){const left=(o.pixExp||0)-Date.now();
if(left<=0)return`<div class="pg">⏱️ Código Pix expirado<br><small>Peça outro código para pagar.</small><button class="btn" data-a="newpix" data-i="${o.id}" style="margin-top:8px;justify-content:center">Gerar novo código</button></div>`;
return`<div class="pg">⏳ Aguardando o pagamento via Pix${o.dyn?' (confirmação automática)':''}<div class="cdt">Expira em <b class="cd" data-id="${o.id}">${fmt(left)}</b></div><div class="qr">${qrSvg(o.pix)}</div><textarea readonly class="pxc" id="px-${o.id}">${esc(o.pix)}</textarea><button class="btn" data-a="copy" data-i="${o.id}" style="justify-content:center">Copiar código Pix</button>${DEMO()?`<p class="dm" style="margin-top:10px">⚠️ DEMONSTRAÇÃO: este código não é um Pix real.</p><button class="btn o" data-a="demopix" data-i="${o.id}" style="margin-top:6px;justify-content:center">Simular pagamento do Pix</button>`:''}</div>`}
if(DEMO())return`<div class="pg">⏳ ${L}: aguardando pagamento<button class="btn" data-a="demopay" data-i="${o.id}" style="margin-top:8px;justify-content:center">Pagar com cartão (simulação)</button><button class="btn o" data-a="cancelpay" data-i="${o.id}" style="margin-top:6px;justify-content:center">Cancelar pedido</button></div>`;
if(ONLINE())return`<div class="pg">⏳ ${L}: aguardando pagamento<button class="btn" data-a="paycard" data-i="${o.id}" style="margin-top:8px;justify-content:center">Pagar agora com cartão</button><button class="btn o" data-a="cancelpay" data-i="${o.id}" style="margin-top:6px;justify-content:center">Cancelar pedido</button></div>`;
return`<div class="pg">⏳ ${L}: ${o.plink?`<a href="${esc(o.plink)}" target="_blank" rel="noopener">pagar agora pelo site</a>`:'aguardando pagamento'}</div>`};
async function newPix(id){const o=(S.orders||[]).find(x=>x.id===id);if(!o||o.paid)return;
if(pixViaMp()){try{const r=await api('pix',{orderId:id,renew:1});if(r.paid){o.paid=1;save();render();return}o.pix=r.qr_code;o.dyn=1;o.pixExp=Date.now()+(r.ttl||PIX_TTL)*1000}catch(e){return toast('Não foi possível gerar o código. Tente de novo.')}}
else{o.pixN=(o.pixN||0)+1;o.pix=pixCode(o.total,(o.id.toUpperCase()+o.pixN).slice(0,25));o.pixExp=Date.now()+PIX_TTL*1000}
o.exp=0;save();render();toast('Novo código gerado')}
function tick(){let ch=0;const ab=aberto();if(ab!==LA){LA=ab;if(tab==='home'||tab==='orders')render()}for(const o of S.orders||[]){if(o.pay!=='pix'||o.paid||!o.pixExp||o.exp||o.pixExp>Date.now())continue;o.exp=1;ch=1;if(pixViaMp()&&o.dyn)api('pix',{orderId:o.id,action:'expire'}).then(r=>{if(r&&r.paid){o.paid=1;save();render()}}).catch(()=>{})}
if(ch){save();if(tab==='orders')render()}
document.querySelectorAll('.cd').forEach(e=>{const o=(S.orders||[]).find(x=>x.id===e.dataset.id);if(o)e.textContent=fmt(o.pixExp-Date.now())})}
setInterval(tick,1000);
const payAdm=o=>{const L=PAYN[o.pay];if(!L)return'';return`<p style="margin-top:6px">${o.paid?'✅ Pago':'⏳ Aguardando pagamento'} • ${L}${o.demo?' (simulado)':''}${o.paid&&o.late?' <b>(⚠️ pago após o prazo do código)</b>':''}</p>${o.paid?'':(o.pay==='pix'&&o.mpid&&Date.now()-o.at<900000)?'<small style="display:block;color:var(--mu);margin-top:4px">Confirmação automática pelo Mercado Pago.</small>':`<button class="btn o" data-a="payok" data-i="${o.id}" style="margin-top:6px;justify-content:center">${o.pay==='pix'&&o.mpid?'Confirmar manualmente (o Mercado Pago não avisou)':'Confirmar pagamento recebido'}</button>`}`};
async function payok(id){const o=orders().find(x=>x.id===id);if(!o)return;try{if(FB.url&&TOK)await fb('PATCH','orders/'+id,{paid:1});o.paid=1;if(!(FB.url&&TOK))save();render();toast('Pagamento confirmado')}catch(e){toast('Não foi possível confirmar')}}
function copyPix(id){const o=orders().find(x=>x.id===id);if(!o||!o.pix)return;const ok=()=>toast('Código Pix copiado!'),alt=()=>{const e=document.getElementById('px-'+id);if(e){e.select();try{document.execCommand('copy');ok()}catch(x){toast('Selecione e copie o código')}}};navigator.clipboard?navigator.clipboard.writeText(o.pix).then(ok,alt):alt()}
async function cancelOrder(id){const o=(S.orders||[]).find(x=>x.id===id);if(!o||o.paid)return;
if(ONLINE()){try{const r=await api('cancelar',{orderId:id});if(r.paid){o.paid=1;save();close();render();return toast('O pagamento já foi confirmado')}}catch(e){return toast(e.message||'Não foi possível cancelar')}}
S.orders=S.orders.filter(x=>x.id!==id);save();close();render();toast('Pedido cancelado')}
const ocCancel=o=>`<div class="oc cn"><div style="display:flex;justify-content:space-between"><b>Pedido #${o.id.slice(0,5).toUpperCase()}</b><span style="color:var(--mu)">${new Date(o.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div><div class="pg">❌ Pedido cancelado${o.paidAfterCancel?'<br><b>⚠️ Pagamento recebido após o cancelamento: reembolsar o cliente.</b>':''}</div>${(o.items||[]).map(i=>`<small style="display:block;margin-top:4px">${i.q}x ${esc(i.name)}</small>`).join('')}<p style="margin-top:6px"><b>${R(o.total)}</b></p>${adm?`<small style="display:block;color:var(--mu)">${esc(o.name)}</small>`:''}</div>`;
const oc=o=>{if(o.cancelled)return ocCancel(o);const s=stl(o);return`<div class="oc"><div style="display:flex;justify-content:space-between"><b>Pedido #${o.id.slice(0,5).toUpperCase()}</b><span style="color:var(--mu)">${new Date(o.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div><div class="tl">${s.map((n,i)=>`<div class="${i<=o.st?'d':''}${i===o.st&&o.st<3?' cur':''}"><i>${(o.mode==='retirada'?IR:IE)[i]}</i>${n}</div>`).join('')}</div>
<p style="color:var(--mu);font-size:12px;margin-bottom:6px">${o.st>=3?'Pedido finalizado':'Previsão: '+o.eta+' min'} • ${o.mode==='entrega'?'Entrega'+(o.zone?' - '+esc(o.zone):''):'Retirada'}</p>${o.items.map(i=>`<small style="display:block">${i.q}x ${esc(i.name)}${(i.opts||[]).length?' ('+esc((i.opts||[]).join(', '))+')':''}</small>`).join('')}<p style="margin-top:6px"><b>${R(o.total)}</b></p>
${adm?payAdm(o):payH(o)}${adm?`<small style="display:block;color:var(--mu)">${esc(o.name)}${o.addr?' • '+esc(o.addr):''}</small>${o.st<3?`<button class="btn" data-a="adv" data-i="${o.id}" data-u="${o.uid||''}" style="margin-top:8px;justify-content:center">Avançar: ${s[o.st+1]}</button>`:''}`:''}</div>`};
function ordersH(){const os=orders();let h='';
if(S.cart.length)h+=`<h2>Sacola</h2><div class="pad" style="padding-top:0">${S.cart.map((i,x)=>`<div class="cl"><div><b>${i.q}x ${esc(i.name)}</b>${i.opts.map(o=>`<small>${esc(o)}</small>`).join('')}${i.obs?`<small>Obs: ${esc(i.obs)}</small>`:''}</div><div style="text-align:right">${R(i.total)}<br><button data-a="rm" data-i="${x}" style="color:#c0392b;font-size:12px">Remover</button></div></div>`).join('')}<p style="text-align:right;margin:14px 0;font-size:16px"><b>Subtotal: ${R(cartTotal())}</b><br><small style="color:var(--mu)">Entrega ou retirada escolhida na finalização</small></p><button class="btn" data-a="chk" style="justify-content:center">Finalizar pedido</button></div>`;
if(os.length)h+=`<h2>${adm?'Pedidos recebidos':'Acompanhe seu pedido'}</h2>${os.map(oc).join('')}`;
return h||'<h2>Pedidos</h2><p class="em">Sua sacola está vazia e você ainda não fez pedidos.</p>'}
const cfgData=()=>({cats:S.cats,products:S.products,zones:S.zones,pick:S.pick});
let pt;const pushCfg=()=>{clearTimeout(pt);pt=setTimeout(()=>fb('PUT','config',cfgData()).catch(()=>toast('Falha ao sincronizar o cardápio')),700)};
const applyCfg=c=>{S.cats=c.cats||[];S.products=c.products||[];S.zones=c.zones||S.zones;S.pick=c.pick||S.pick;try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
async function loadCfg(){try{const c=await fb('GET','config');if(!c||!c.products)return;const j=JSON.stringify(c);if(j===lastCfg)return;lastCfg=j;applyCfg(c);render()}catch(e){}}
async function signin(em,pw){const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+FB.key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw,returnSecureToken:true})}),j=await r.json();if(!j.idToken)throw new Error('login');TOK=j.idToken;CRED={em,pw}}
async function pollMine(){let ch=0;for(const o of S.orders||[]){try{if(o.pend){await fb('PUT','orders/'+o.id,{...o,pend:null});o.pend=0;ch=1}else if(o.st<3||(o.pay&&!o.paid)){const r=await fb('GET','orders/'+o.id);if(r){if(r.st!==o.st){o.st=r.st;ch=1}if(r.paid&&!o.paid){o.paid=1;ch=1;toast('Pagamento confirmado!')}}}}catch(e){}}if(ch){save();if(tab==='orders')render()}}
async function pollAdmin(){if(!TOK)return;try{const r=await fb('GET','orders',null,'orderBy=%22at%22&limitToLast=60');AO=Object.values(r||{}).sort((a,b)=>b.at-a.at);if(tab==='orders')render()}catch(e){}}
function init(){if(!FB.url)return;loadCfg();pollMine();setInterval(()=>{pollMine();pollAdmin()},5000);setInterval(()=>{if(!TOK)loadCfg()},60000);setInterval(()=>{if(TOK&&CRED)signin(CRED.em,CRED.pw).catch(()=>{})},2400000)}

render();init();
