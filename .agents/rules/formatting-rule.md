---
trigger: always_on
---

# ESLint e Prettier Always On

## Descrição
Esta regra garante que todo código TypeScript do projeto Express.js seja validado e formatado antes de ser aceito.

## Activation Mode
Always On

## Glob Pattern
src/**/*.ts
src/**/*.tsx

## Instruções
1. Sempre rodar `eslint --fix` nos arquivos modificados.
2. Sempre rodar `prettier --write` nos arquivos modificados.
3. Rejeitar código que não esteja em conformidade com as regras do ESLint configuradas no projeto (incluindo regras específicas de TypeScript).
4. Garantir que o estilo siga o `.prettierrc` definido no repositório.