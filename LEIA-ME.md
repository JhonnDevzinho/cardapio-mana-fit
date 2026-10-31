# Maná Fit House - Cardápio Web

## Estrutura
```
mana-fit-house/
├─ index.html            → redireciona para cliente/
├─ cliente/index.html    → página dos clientes (cardápio, pedido, pagamento, acompanhamento)
├─ lojista/
│  ├─ index.html         → página do lojista (mantenha o endereço só seu)
│  └─ admin.js           → painel, login e ações do lojista
├─ shared/
│  ├─ config.js          → configurações (Firebase, Pix, Mercado Pago, horário, entrega...)
│  ├─ qrcode.js          → gerador de QR Code (biblioteca MIT)
│  ├─ style.css          → estilos
│  ├─ app.js             → lógica do cardápio, pedidos, pagamentos e acompanhamento
│  └─ logo.jpg           → logo da loja
├─ api/                  → servidor de pagamentos (Vercel): cartao.js, cancelar.js, webhook.js, pix.js (opcional)
├─ package.json          → dependência do servidor (firebase-admin)
└─ firebase-rules.json   → regras de segurança do banco
```

## Como os pagamentos funcionam
**Pix (pelo Mercado Pago, confirmação automática):** com `PIX_VIA_MP=true` (padrão), o cliente recebe QR Code e copia e cola, válidos por 5 minutos. Quando o dinheiro cai, o Mercado Pago avisa `api/webhook.js` e o pedido vira "Pagamento confirmado" sozinho, **sem o lojista fazer nada**. Passou o prazo: o código some, a cobrança pendente é cancelada e o cliente pede um novo. O dinheiro cai na **conta do Mercado Pago** (que precisa ter uma chave Pix cadastrada) e há taxa de Pix do Mercado Pago. Se o servidor falhar na hora de gerar o código, o site usa o Pix da sua chave (`PIX_CHAVE`) com confirmação manual. Se o Mercado Pago não avisar em 15 minutos, o painel libera o botão "Confirmar manualmente".
**Pix na sua chave (modo local/alternativo):** `PIX_VIA_MP=false`, ou sem Firebase/Mercado Pago configurados: QR Code + copia e cola com 5 minutos, e o lojista confirma no painel. Chave em `PIX_CHAVE` (celular: `+55` + DDD + 9 dígitos).

**Cartão de crédito e débito (pelo Mercado Pago, direto no site):**
1. O cliente escolhe crédito ou débito e envia o pedido.
2. Abre o formulário seguro do Mercado Pago dentro do site; o cliente digita os dados do cartão.
3. O Mercado Pago gera um token no navegador, e o servidor (`api/cartao.js`) cobra o valor, que é recalculado com os preços do Firebase.
4. Aprovado: o pedido vira "Pagamento confirmado" sozinho. O dinheiro cai na **conta do Mercado Pago**; de lá você transfere para a Ton ou outro banco.
5. Recusado: aparece a mensagem e o cliente tenta de novo ou toca em **Cancelar** (cancela o pedido). Em análise: confirma sozinho depois, pelo aviso do Mercado Pago (`api/webhook.js`).
Os dados do cartão nunca passam pelo seu servidor. Crédito: até 3 parcelas; débito: 1x.

## Publicar na Vercel (passo a passo)
**1. Firebase** (console.firebase.google.com)
- Criar projeto → Build → **Realtime Database** → Criar banco (modo bloqueado) → aba **Regras** → cole o `firebase-rules.json` → Publicar.
- Build → **Authentication** → Método de login → ative **E-mail/senha** → aba Usuários → adicione o e-mail e a senha do lojista.
- Engrenagem → Configurações do projeto → **Geral**: copie a **Chave de API da Web**. Em **Contas de serviço** → "Gerar nova chave privada" (baixa um JSON; guarde em segredo).
- A **URL do banco** aparece no topo da página do Realtime Database (`https://...firebaseio.com`).

**2. Mercado Pago** (mercadopago.com.br/developers → Suas integrações → Criar aplicação)
- Produto: **Checkout Transparente**. Em **Credenciais de teste** copie a **Public Key** e o **Access Token**. Troque pelas de **produção** só depois de testar.
- A conta precisa ter uma **chave Pix** cadastrada para receber Pix.

**3. Arquivos**
- Abra `shared/config.js` e preencha `FB.url`, `FB.key` e `MP_PUBLIC_KEY`. Ajuste `HORARIO`, `RETIRADA` e `LOJA_ENDERECO`. Mantenha `DEMO_CARTAO=false`.

**4. GitHub**
- Crie um repositório **privado** e envie o **conteúdo** da pasta (o `index.html`, `vercel.json` e `package.json` ficam na raiz do repositório).
- Não envie o JSON da conta de serviço nem o Access Token: eles vão só nas variáveis da Vercel.

**5. Vercel** (vercel.com)
- Add New… → **Project** → Import o repositório.
- **Framework Preset: Other**. Root Directory: `./`. Deixe Build Command e Output Directory em branco.
- Abra **Environment Variables** e cadastre (marque Production, Preview e Development):
  - `MP_ACCESS_TOKEN` = Access Token do Mercado Pago
  - `FIREBASE_SERVICE_ACCOUNT` = conteúdo **inteiro** do JSON da conta de serviço (cole como está)
  - `FIREBASE_DATABASE_URL` = URL do Realtime Database
  - `SITE_URL` = `https://SEU-PROJETO.vercel.app` (opcional)
  - `DELIVERY_FEE` = `6` (opcional)
- **Deploy**. Mudou uma variável depois? Deployments → ⋯ → **Redeploy**.

**6. Depois do deploy**
- Entre em `https://SEU-PROJETO.vercel.app/lojista/` → rodapé → "Área do lojista" → entre com o e-mail e a senha do Firebase (isso publica o cardápio no Firebase).
- Faça pedidos de teste em `/cliente/`: Pix e cartão (cartões de teste do Mercado Pago), confira a confirmação automática, o cancelamento e o painel.
- Quando estiver tudo certo, troque as credenciais de teste pelas de produção (variável `MP_ACCESS_TOKEN` + `MP_PUBLIC_KEY` no config.js) e faça novo deploy.

**Problemas comuns**
- "Pagamento indisponível" / cartão desabilitado: `MP_PUBLIC_KEY` ou `FB` vazios no config.js.
- Pix e cartão falham ao gerar: variável de ambiente errada ou faltando (veja Vercel → Deployments → Functions → Logs).
- Pedidos não aparecem para o lojista: regras do Firebase não publicadas ou usuário do lojista não criado.
- Pix nunca confirma sozinho: confira se o Pix está habilitado na conta Mercado Pago e veja os logs de `/api/webhook`.

## Entrega ou retirada
- **Entrega:** taxa de R$ 6,00, 15 a 30 minutos, pede o endereço.
- **Retirada no local:** sem taxa, não pede endereço. Tempo em `RETIRADA`; endereço da loja em `LOJA_ENDERECO`.

## Horário de funcionamento
`HORARIO` em `shared/config.js` (padrão 08:00 às 20:00, fuso `America/Fortaleza`). Fora do horário o site mostra "Fechado" e bloqueia pedidos, sem recarregar.

## Modo demonstração
`DEMO_CARTAO=true` (sem Firebase/Mercado Pago) libera Pix (com botão "Simular pagamento do Pix") e cartão com formulário **simulado**, sem cobrar nada. É o que o link de prévia usa. Em produção deixe `false`.

## Cancelar
A janela do cartão não fecha ao clicar fora nem com Esc: só ao pagar ou em **Cancelar**. Cancelar desfaz o pedido (se ainda não foi pago nem está em preparo) e invalida cobranças pendentes. Pagamento que chegue depois do cancelamento aparece para o lojista como "reembolsar".
