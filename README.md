# Bills — Conciliação Orçamentária (PWA)

Solução de controle e conciliação orçamentária: PWA com login Google, motor de regras de negócio (divergência orçamentária, antecedência de pagamento, política de pagamento) e painel com heatmap — sem depender de planilha nem de custo de hospedagem.

> Nasceu como ferramenta interna do Condomínio Vitale Carioca, mas foi generalizada para funcionar com qualquer hierarquia de Centro de Custo → Conta Contábil → Serviço/Fornecedor — condomínio, pequena empresa, ONG, o que fizer sentido.

Estrutura base do app: login com Google (Firebase Auth) + app shell + motor de conciliação + tela de lançamento + painel com heatmap.

## 1. Criar o projeto Firebase (gratuito)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (plano **Spark**, gratuito).
2. Dentro do projeto, clique no ícone `</>` para adicionar um **app da Web**.
3. Copie o objeto `firebaseConfig` que aparece na tela.
4. Abra `js/firebase-config.js` neste projeto e substitua os valores de exemplo (`SUA_API_KEY_AQUI`, etc.) pelos valores reais copiados.

## 2. Ativar os serviços necessários no console Firebase

- **Authentication** → aba "Sign-in method" → ative o provedor **Google**.
- **Firestore Database** → "Criar banco de dados" → inicie em modo de produção (as regras de segurança virão numa próxima etapa).
- **Storage** → "Começar" (será usado depois para o upload das NFs).

> Opcional: se quiser restringir o login apenas a contas de um domínio específico (ex.: administradora do condomínio), descomente a linha `googleProvider.setCustomParameters(...)` em `firebase-config.js`.

## 3. Aplicar as regras de segurança do Firestore

Por padrão, o Firestore em modo produção **bloqueia toda leitura e escrita**. Para desenvolvimento:

1. No console do Firebase → **Firestore Database → aba "Regras"**.
2. Substitua o conteúdo pelo que está em `firestore.rules` deste projeto (permite qualquer usuário logado ler/escrever — será refinado por papéis antes de ir para produção real).
3. Clique em **Publicar**.

## 4. Popular dados de exemplo (para testar a tela de lançamento)

A tela de lançamento depende de já existir pelo menos um Centro de Custo → Conta Contábil → Serviço cadastrado. Para não precisar fazer isso manualmente agora:

1. Abra `index.html`, faça login com Google.
2. Abra `seed.html` (mesma pasta) e clique em **"Popular agora"**.
3. Isso cria: 1 Centro de Custo ("Manutenção Predial"), 1 Conta Contábil ("Elevadores") e 2 Serviços de exemplo, cada um com orçamento projetado de teste para os 12 meses.
4. Volte para `index.html` → "Novo lançamento" e os menus já devem aparecer populados.

> Esse arquivo (`seed.html` + `js/seed-dados-exemplo.js`) é só uma ferramenta de desenvolvimento — não precisa ir para o GitHub Pages final, mas também não tem problema se for, já que exige login para funcionar.

## 5. Testar localmente

Como o app usa módulos ES (`type="module"`), ele precisa ser servido por um servidor HTTP — não abra o `index.html` direto como arquivo local (`file://`), pois o navegador bloqueia os imports.

Opções simples, sem instalar nada além do que você já usa:
- **VS Code** com a extensão "Live Server" → botão direito no `index.html` → "Open with Live Server".
- Ou, se tiver Python instalado: `python3 -m http.server 8080` na pasta do projeto, depois acesse `http://localhost:8080`.

## 4. Publicar no GitHub Pages

Igual ao fluxo que você já usa no projeto do rateio de água:
1. Suba todos os arquivos desta pasta para um repositório no GitHub (via interface web: "Add file" → "Upload files").
2. Vá em **Settings → Pages** do repositório → em "Source" selecione a branch `main` e a pasta raiz (`/`).
3. Aguarde alguns minutos — o GitHub Pages publica em `https://SEU_USUARIO.github.io/NOME_DO_REPO/`.

> **Importante:** no console do Firebase, em **Authentication → Settings → Authorized domains**, adicione o domínio do GitHub Pages (`SEU_USUARIO.github.io`) — sem isso, o login com Google é bloqueado em produção.

## Estrutura de pastas

```
vitale-conciliacao/
├── index.html
├── seed.html              → ferramenta de dev: popula dados de exemplo
├── manifest.json
├── sw.js
├── firestore.rules         → regras de segurança (colar no console)
├── css/
│   ├── tokens.css          → paleta, tipografia, tokens de design
│   ├── layout.css          → tela de login + app shell
│   ├── formularios.css     → formulário de lançamento + chips de status
│   └── dashboard.css       → tabela matriz + heatmap
├── js/
│   ├── firebase-config.js  → inicialização central do Firebase
│   ├── auth.js              → login/logout Google, observador de sessão
│   ├── firestore.js         → leitura de cadastros + gravação de lançamentos
│   ├── conciliacao.js       → motor de regras (divergência, antecedência, pagamento)
│   ├── form-lancamento.js   → tela de lançamento com preview em tempo real
│   ├── dashboard.js          → tabela matriz + heatmap
│   ├── ordens-pagamento.js   → cadastro de OPs e consumo de saldo por lançamento
│   ├── seed-dados-exemplo.js → dados de teste (usar só em desenvolvimento)
│   └── app.js                → liga autenticação, roteamento de abas e módulos
└── icons/               → ícones do PWA (192x192 e 512x512 — adicionar depois)
```

## O que já funciona

- Login com Google
- Menus de Centro de Custo → Conta Contábil → Serviço em cascata, lidos do Firestore
- Preview em tempo real da conciliação (divergência, antecedência, data sugerida de pagamento) enquanto você preenche
- Observação obrigatória quando há divergência orçamentária
- Gravação do lançamento completo (com todos os campos calculados) no Firestore
- **Painel com a tabela matriz** (Centro de Custo → Conta Contábil, Jan–Dez) e o **heatmap de Index%** com a mesma regra de cor combinada antes (verde ≤95%, amarelo 95,1–100%, vermelho >100%). Atualiza automaticamente depois de cada novo lançamento salvo.
- **Ordens de Pagamento (OP):** cada lançamento de NF agora é feito contra uma OP específica (vinculada a Centro de Custo + Conta Contábil), e o saldo é debitado automaticamente numa transação atômica — se duas pessoas lançarem ao mesmo tempo contra a mesma OP, o Firestore garante que o saldo nunca fica negativo por condição de corrida. A tela "Ordens de pagamento" permite cadastrar novas OPs (número da solicitação, número da OP, saldo total) e mostra a lista com saldo disponível e % consumido, com heatmap (verde/amarelo/vermelho conforme o consumo).
- **Preview de conciliação reorganizado em duas seções independentes:**
  - *Vencimento da NF:* Tempo hábil até o vencimento real + Data limite para lançamento — baseado só no que o fornecedor colocou na NF.
  - *Política de pagamento:* Data sugerida de pagamento + Antecedência conforme política — baseado só na regra interna (dia 10/20/30). As duas são propositalmente independentes: o vencimento real pode não bater com o que a política sugeriria, e isso não é um erro.

> Se você já tinha rodado o `seed.html` antes desta etapa, rode de novo — agora ele também cria uma Ordem de Pagamento de exemplo (saldo R$ 5.000, vinculada à conta "Elevadores"), necessária para conseguir salvar um lançamento de teste. Rodar de novo é seguro: se a OP de exemplo já existir, o seed não mexe no saldo dela (não quer sobrescrever o consumo real de testes anteriores).

## Importar a base completa (planilha real, 3 abas)

`seed.html` agora tem um único botão de importação real, **"Importar base completa"**, que substitui as importações anteriores (orçamento isolado / fornecedores isolados — os arquivos antigos `importar-orcamento.js` e `importar-fornecedores.js` continuam no repo só por histórico, não usar mais). Ele lê `js/dados-base-completa-importado.js` (gerado a partir de `seed3.xlsx`, 3 abas: orçamento aprovado, fornecedores por centro de custo, lançamentos realizados) e grava em lotes sequenciais (limite do Firestore é 500 operações por `writeBatch`, usamos 400 por segurança):

- **34 Centros de Custo** (11 próprios + 23 de terceiros — campo `tipo_gestao`, vindo direto da coluna "Gestão" da planilha)
- **109 Contas Contábeis** (com Orçamento Aprovado mês a mês onde a planilha tinha o dado — 28 combinações não tinham e nasceram zeradas)
- **124 Serviços/Prestadores** (Orçamento Projetado nasce **zerado** — nenhuma das planilhas trouxe esse nível de detalhe; decisão tomada: manter a checagem de divergência por lançamento comparando com o Projetado mesmo assim, então lançamentos reais vão aparecer "COM DIVERGÊNCIA" até alguém preencher os valores)
- **315 Ordens de Pagamento históricas** — **premissa importante**: como a planilha não informa o saldo original de cada OP (só o que foi gasto), `saldo_total` foi calculado como a soma dos lançamentos contra ela, e `saldo_disponivel` nasce zerado (assume 100% consumido). Não é o valor real autorizado, é uma aproximação para preencher o histórico.
- **1.175 Lançamentos reais** de 2025/2026, processados pelo mesmo motor de regras (`conciliacao.js`) usado no lançamento manual, com a Data de Lançamento real da planilha como `dataEntrada`.

Idempotente (`merge: true` nos cadastros) — seguro rodar de novo se a planilha for atualizada. Os lançamentos, porém, são sempre **adicionados** (não têm chave natural pra deduplicar) — rodar a importação duas vezes duplica os 1.175 lançamentos. Se precisar rodar de novo, apague a coleção `lancamentos` no console do Firebase antes.

## Centros de Terceiros

Centro de Custo agora tem um campo `tipo_gestao`: `"proprio"` (orçamento que você gerencia) ou `"terceiros"` (você só processa o pagamento, a governança é de outra pessoa/área). O Painel mostra só os próprios; a nova aba **"Centros de Terceiros"** no menu lateral mostra só os de terceiros — mesma tabela matriz e heatmap, motor compartilhado (`dashboard.js`, função `iniciarPainelMatriz` parametrizada). Centro de Custo sem `tipo_gestao` definido (dados antigos) é tratado como `"proprio"` por padrão.

## Busca em Ordens de Pagamento

Com centenas de OPs, listar tudo solto não escala — a tela agora tem busca por texto (Nº OP, Nº Solicitação, nome da Conta) e um filtro por Centro de Custo, ambos aplicados sobre os dados já carregados (client-side, sem re-consultar o Firestore a cada tecla). Se o volume crescer muito além da casa de milhares, migrar para filtro via query no Firestore.

## Tipo de Lançamento (Recorrente x Avulso)

O formulário de lançamento agora exige escolher entre "Recorrente (mensalidade)" e "Avulso (reparo, contratação, consultoria)", gravado no campo `tipo_lancamento`. Ainda não afeta nenhuma regra de cálculo — é só categorização, disponível para relatórios/filtros futuros.

## Próximos módulos (ainda não construídos)

- Upload de foto da NF (Storage) — adiado, veja a seção sobre o plano Blaze acima.
- Tela de cadastro de Orçamento &amp; Contas dentro do próprio app (hoje só dá para cadastrar via `seed.html` ou diretamente no console do Firebase).
- Filtros no painel (por período, Centro de Custo, usuário) — hoje mostra o ano acumulado inteiro.
- Regras de segurança por papel (hoje qualquer usuário logado pode editar qualquer coisa — está OK para desenvolvimento, mas precisa refinar antes de usar com o condomínio de verdade).
- **Multi-workspace (para virar produto de verdade):** hoje todos os dados vivem soltos nas coleções `centros_custo`, `contas_contabeis`, `servicos` e `lancamentos` — ou seja, é um projeto Firebase por cliente/uso. Para usar isso em vários contextos diferentes (não só o condomínio) dentro do mesmo projeto, o próximo passo estrutural é introduzir um conceito de "workspace" (ex.: `workspaces/{id}/centros_custo/...`), com cada usuário vinculado a um ou mais workspaces — isso já habilita usar o Bills tanto pro condomínio quanto para outra necessidade, sem misturar os dados. Vale planejar antes de crescer muito o cadastro atual, porque migrar depois dá mais trabalho do que decidir agora.
