/* Área do lojista: painel, login e ações. Carregue ANTES de app.js (somente em lojista/index.html). */
function ljSheet(){open(`<div class="sc"><div class="pad f"><h3>Área do lojista</h3>${pixKeyErr()&&!pixViaMp()?`<p class="dm" style="background:#fde2e2;color:#9b1c1c">⚠️ ${pixKeyErr()}</p>`:''}${FB.url&&!TOK?'<label>E-mail do lojista</label><input id="le" type="email"><label>Senha</label><input id="lp" type="password"><button class="btn" data-a="login" style="justify-content:center;margin-top:8px">Entrar</button>':`<button class="btn" data-a="adm" style="justify-content:center">${adm?'Sair do modo administrador':'Ativar modo administrador'}</button>`}
${adm?`
<label>Nova categoria</label><div style="display:flex;gap:8px"><input id="nc" placeholder="Nome" style="flex:1"><button class="btn" data-a="addc" style="flex:none">Adicionar</button></div>${S.cats.map(c=>`<div class="cl"><span>${esc(c.name)} (${S.products.filter(p=>p.cat===c.id).length})</span><button data-a="delc" data-i="${c.id}" style="color:#c0392b">Excluir</button></div>`).join('')}<button class="btn o" data-a="reset" style="justify-content:center;margin-top:12px">Restaurar cardápio padrão e enviar ao Firebase</button>`:''}</div></div><div class="ft"><button class="btn o" data-x>Fechar</button></div>`)}
function toggleAdm(){if(adm){adm=false;TOK=null;CRED=null;AO=[];render();return ljSheet()}if(FB.url)return;adm=true;render();ljSheet()}
async function login(){try{await signin($('#le').value.trim(),$('#lp').value)}catch(e){return toast('E-mail ou senha inválidos')}adm=true;try{const c=await fb('GET','config');if(c&&c.products)applyCfg(c);else pushCfg()}catch(e){}pollAdmin();render();ljSheet()}
window.Admin={act(a,d,t){switch(a){case'lj':return ljSheet();
case'login':return login();
case'adm':return toggleAdm();
case'addc':{const v=$('#nc').value.trim();if(!v)return;S.cats.push({id:'c'+Date.now(),name:v});save();render();return ljSheet()}
case'delc':if(S.products.some(p=>p.cat===d.i))return toast('Remova ou mova os produtos antes');S.cats=S.cats.filter(c=>c.id!==d.i);save();render();return ljSheet();
case'reset':if(!t.dataset.ok){t.dataset.ok=1;t.textContent='Toque de novo para confirmar';return}{const o=S.orders;S=seed();S.orders=o;save();render();return ljSheet()}}}};
