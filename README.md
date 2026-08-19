# Vitale Carioca — Conciliação Orçamentária (PWA)

Estrutura base do app: login com Google (Firebase Auth) + app shell.
Ainda **não** inclui o motor de conciliação, o form de lançamento nem o dashboard — isso vem nas próximas etapas.

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

## 3. Testar localmente

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
├── manifest.json
├── sw.js
├── css/
│   ├── tokens.css      → paleta, tipografia, tokens de design
│   └── layout.css      → tela de login + app shell
├── js/
│   ├── firebase-config.js  → inicialização central do Firebase
│   ├── auth.js              → login/logout Google, observador de sessão
│   └── app.js                → liga autenticação à interface
└── icons/               → ícones do PWA (192x192 e 512x512 — adicionar depois)
```

## Próximos módulos (ainda não construídos)

- `js/conciliacao.js` — as fórmulas que já desenhamos (divergência orçamentária, antecedência de lançamento, matriz de política de pagamento com ajuste de dia útil), portadas para funções JS puras e testáveis.
- `js/form-lancamento.js` — tela de lançamento de NF, substituindo o Google Forms.
- `js/dashboard.js` — tabela matriz Jan–Dez com o heatmap (verde/amarelo/vermelho).
- Regras de segurança do Firestore (`firestore.rules`) — quem pode lançar vs. quem pode editar orçamento aprovado.
