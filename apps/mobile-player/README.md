# GameShow Player Mobile

Fundacao Expo do aplicativo oficial dos participantes.

## Fluxo implementado

1. Abrir app
2. Ler QR Code
3. Extrair `host`, `port` e `room`
4. Conectar via Socket.IO
5. Entrar na sala
6. Aguardar rodada

## QR Code esperado

```txt
gameshowme://join?host=IP_DO_SERVIDOR&port=3001&room=CODIGO
```

## Rodar

```bash
npm install
npm run start
```

O `/player` web continua sendo o fallback do sistema.
