# Receitas

Aplicativo de receitas feito com React Native, Expo e Expo Router. Permite explorar receitas, criar receitas pessoais, publicar receitas para a comunidade e salvar favoritas.

## Pré-requisitos

- Node.js em uma versão LTS compatível com Expo SDK 58.
- npm, instalado junto com o Node.js.
- Para Android: Android Studio com um emulador configurado, ou um dispositivo Android com Expo Go compatível com a versão do projeto.
- Conexão com a internet para instalar dependências e acessar os serviços de receitas, Firebase e Cloudinary.

## Instalação

Abra um terminal na pasta do projeto (a pasta que contém `package.json`) e instale as dependências:

```bash
npm ci
```

Se o projeto não tiver `package-lock.json`, use `npm install`.

## Executar

### Android

Com um emulador já iniciado:

```bash
npm run android
```

Ou inicie o servidor Expo:

```bash
npx expo start
```

Escaneie o QR code com o Expo Go compatível. O computador e o celular devem estar na mesma rede. Se a rede bloquear a conexão, tente:

```bash
npx expo start --tunnel
```

### Navegador

```bash
npm run web
```

### iOS

O simulador iOS requer macOS com Xcode. Em um Mac:

```bash
npm run ios
```

## Firebase

O app usa Firebase Authentication para contas e Cloud Firestore para receitas da comunidade. A configuração do projeto Firebase utilizado pelo app está em `src/lib/firebase.ts`.

No console Firebase do projeto:

1. Ative o método de autenticação **E-mail/senha**.
2. Crie ou confirme o banco de dados do **Cloud Firestore**.
3. Publique as regras incluídas neste repositório, necessárias para que cada usuário só possa editar ou excluir as próprias receitas:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project app-receitas-d5af2
```

O usuário que for avaliar pode criar uma conta pela tela do aplicativo. A publicação, edição e exclusão de receitas da comunidade dependem de autenticação e das regras do Firestore estarem ativas.

## Imagens de receitas

O envio de imagens de receitas públicas usa Cloudinary. O app está configurado com um upload preset não assinado em `src/lib/cloudinary.ts`. O preset e o projeto Firebase já estão referenciados no código; não é necessário criar um arquivo `.env` para iniciar o app.

## Verificação

Para verificar os tipos TypeScript:

```bash
npx tsc --noEmit
```

O projeto também define `npm run lint`. Caso o ESLint não esteja configurado no ambiente, a execução pode solicitar a instalação/configuração das dependências de lint.

## Problemas comuns

- **O Expo Go não abre o projeto:** confirme que é uma versão compatível com o SDK do projeto; se não for, use um emulador Android ou uma development build.
- **Não conecta ao servidor Expo:** confirme que computador e celular estão na mesma rede ou use `npx expo start --tunnel`.
- **Login ou receitas da comunidade não funcionam:** confira a conexão, o Firebase Authentication, o Firestore e as regras publicadas.
- **Fotos não são enviadas:** confira a conexão e se o upload preset do Cloudinary está ativo.
