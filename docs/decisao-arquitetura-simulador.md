# Decisão de arquitetura: motor elétrico compartilhado

- **Data:** 2026-09-26
- **Estado:** adotada para os primeiros marcos do simulador

## Decisão

Implementar inicialmente o solver elétrico em TypeScript e usá-lo tanto no navegador offline quanto no aplicativo Tauri. O despacho escolhe este solver apenas quando todos os componentes do circuito têm modelo DC compatível. Os demais circuitos permanecem nos motores digitais existentes.

## Motivo

O editor e os projetos já são executados e descritos em TypeScript. Um solver compartilhado dá os mesmos resultados DC na versão Web e na versão desktop, evita duplicar cada modelo em Rust e WASM e mantém o uso offline. O primeiro solver usa redes pequenas; sua matriz densa ainda não foi projetada para circuitos grandes.

## Consequências

- Testes de referência do solver podem rodar uma vez e cobrir os dois destinos, pois ambos chamam a mesma implementação.
- O motor Rust continua responsável pelos circuitos digitais que ainda não entraram no modelo DC; essa rota precisa permanecer claramente identificada na interface.
- Componentes sem modelo elétrico não são incluídos parcialmente em uma solução MNA: o projeto inteiro segue pela rota digital existente.
- Os formatos de projeto não mudam para armazenar os resultados; leituras são calculadas em tempo de execução.
- Antes de adotar modelos de grande porte, analisar desempenho e esparsidade. Se o solver for reescrito em Rust/WASM, executar os mesmos casos de referência contra as duas implementações durante a migração.

## Revisão

Revisar esta decisão quando forem adicionados transitórios, circuitos mistos digital/analógico ou circuitos grandes. A prioridade é manter resultados iguais no navegador offline e no desktop.
