<h1 align="center">IM Aggregation</h1>
<h3 align="center">Powered By Wechaty</h3>

## Folder Structure

```bash
im-aggregation
├── src
│   ├── adapters
│   │   ├── Adapter.ts
│   │   ├── WeChat.ts
│   │   ├── WeCom.ts
│   │   ├── WhatsApp.ts
│   │   └── base
│   │       └── EventEmitter.ts
│   ├── database
│   │   ├── db.sqlite
│   │   ├── db.ts
│   │   ├── impl
│   │   │   ├── account.ts
│   │   │   ├── configuration.ts
│   │   │   └── message.ts
│   │   ├── init.ts
│   │   ├── models
│   │   │   ├── Account.ts
│   │   │   ├── Configuration.ts
│   │   │   └── Message.ts
│   │   └── sync.ts
│   ├── schema
│   │   └── types.ts
│   ├── setup.ts
│   └── utils
│       ├── helper.ts
│       └── logger.ts
├── tree.txt
├── tsconfig.json
└── yarn.lock
```
