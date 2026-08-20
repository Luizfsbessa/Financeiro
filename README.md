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

## Importar orçamento real de uma planilha

`seed.html` agora tem duas seções separadas:

1. **"Importar orçamento (planilha real)"** — grava os Centros de Custo e Contas Contábeis extraídos de `seed_orcamento_aprovado.xlsx` (11 Centros, 80 combinações de Conta Contábil, cada uma com Orçamento Aprovado mês a mês). Os dados já vêm processados em `js/dados-orcamento-importado.js` — gerado automaticamente a partir da planilha, não é pra editar esse arquivo à mão. Seguro rodar de novo (usa IDs fixos baseados no nome do centro + código da conta).
2. **"Popular dados de exemplo (teste)"** — continua existindo, separado, só para testar o fluxo sem mexer nos dados reais.

**Importante — o que falta depois de importar:** a planilha só tinha Centro de Custo + Conta Contábil + Orçamento Aprovado. Não existe nenhum Serviço/Prestador (nível de Orçamento Projetado) vinculado a essas 80 contas ainda — sem isso, a tela "Novo Lançamento" não vai ter opções no campo Serviço para essas contas. Isso precisa ser cadastrado à parte: manualmente, ou me mande uma planilha com o nível de Serviço/Prestador + Orçamento Projetado que eu gero outro import igual a esse.

Para gerar esse tipo de importação a partir de uma planilha nova no futuro, as colunas esperadas são: `competência` (nome do mês por extenso, em português), `Centro_Custo`, `Conta_contábil` (código), `Descrição_conta_contábil`, `orçamento_aprovado` (valor daquele mês).

## Próximos módulos (ainda não construídos)

- Upload de foto da NF (Storage) — adiado, veja a seção sobre o plano Blaze acima.
- Tela de cadastro de Orçamento &amp; Contas dentro do próprio app (hoje só dá para cadastrar via `seed.html` ou diretamente no console do Firebase).
- Filtros no painel (por período, Centro de Custo, usuário) — hoje mostra o ano acumulado inteiro.
- Regras de segurança por papel (hoje qualquer usuário logado pode editar qualquer coisa — está OK para desenvolvimento, mas precisa refinar antes de usar com o condomínio de verdade).
- **Multi-workspace (para virar produto de verdade):** hoje todos os dados vivem soltos nas coleções `centros_custo`, `contas_contabeis`, `servicos` e `lancamentos` — ou seja, é um projeto Firebase por cliente/uso. Para usar isso em vários contextos diferentes (não só o condomínio) dentro do mesmo projeto, o próximo passo estrutural é introduzir um conceito de "workspace" (ex.: `workspaces/{id}/centros_custo/...`), com cada usuário vinculado a um ou mais workspaces — isso já habilita usar o Bills tanto pro condomínio quanto para outra necessidade, sem misturar os dados. Vale planejar antes de crescer muito o cadastro atual, porque migrar depois dá mais trabalho do que decidir agora.
