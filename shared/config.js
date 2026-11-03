/* =====================================================================
   CONFIGURAÇÃO - preencha ANTES de publicar (passo a passo no LEIA-ME.md)
   1) FB.url e FB.key  -> do Firebase (URL do Realtime Database e Web API Key)
   2) MP_PUBLIC_KEY    -> Public Key do Mercado Pago
   3) PIX_CHAVE        -> chave bancária que recebe o Pix direto
   4) HORARIO, RETIRADA e LOJA_ENDERECO -> ajuste para a sua loja
   Deixe DEMO_CARTAO = false. Sem credenciais do Mercado Pago, cartões ficam desativados.
   ===================================================================== */
const FB={url:'https://mana-fit-house-default-rtdb.firebaseio.com',key:'AIzaSyCAMAGQH6kUtl45CJYepj3I_EoogaMo0d8'};
const LOGO_URL='../shared/logo-round.png'; // logo/foto de perfil da loja

/* ===== Pagamentos ===== */
// Chave Pix exatamente como cadastrada no banco. Celular: +55 + DDD + 9 dígitos (ex.: +5584999999999);
// também vale CPF/CNPJ (só números), e-mail ou chave aleatória. Se for inválida, o Pix some do site (modo simples).
const PIX_CHAVE='+5584998948092';
const PIX_NOME='MANA FIT HOUSE',PIX_CIDADE='BRASIL'; // sem acentos
// Opcional (só sem Mercado Pago): link de pagamento de outro gateway, com {valor} e {pedido}. Pode deixar vazio.
const LINK_CREDITO='',LINK_DEBITO='';

/* ===== Pagamento automático (Mercado Pago) ===== */
// Chave pública de PRODUÇÃO do Mercado Pago (APP_USR-...). Não use credenciais TEST aqui.
const MP_PUBLIC_KEY='APP_USR-a80183cd-5dd6-486f-bd4d-b3b4c4f292aa';
const API_URL=''; // vazio = mesma origem do site (/api/...)
// Pix e cartões no Mercado Pago. As rotas de cobrança exigem MP_LIVE_MODE=true na Vercel.
const PIX_VIA_MP=true;

/* ===== Retirada no local ===== */
const RETIRADA={min:15,max:25};      // tempo de preparo para retirada (minutos)
const LOJA_ENDERECO='Rua Dr. Pedro Amorim';              // endereço da loja, mostrado ao cliente na retirada (opcional)

/* ===== Demonstração ===== */
// true = mostra um formulário de cartão SIMULADO (não cobra nada). Use só para apresentar o site; deixe false em produção.
const DEMO_CARTAO=false;

/* ===== Horário de funcionamento ===== */
const HORARIO={abre:'08:00',fecha:'20:00'}; // fora desse horário o site mostra "Fechado" e não aceita pedidos
const FUSO='America/Fortaleza';
