
1 - Apresentação da Ideia;
Explique de onde surgiu sua ideia;
Esse é o meu projeto. A ideia surgiu a partir do desafio sobre as últimas enchentes que ocorreram no Rio Grande do Sul. Pensando nesse cenário, decidi focar no problema de organização de voluntários que atuam nessas tragédias.
2 - Problema Escolhido;
Catalogação e informações de voluntários.
3 - Solução Proposta;
Aparência e Identidade Visual (Estilo Clean Minimalism):
Cabeçalho Técnico: Elementos alinhados de forma polida com o logotipo em destaque vermelhocrimson, indicadores operacionais vigentes e sinalizador dinâmico de conexões de rede (SISTEMA ONLINE pulsante).

Bento-Grid de Controle: Painel de gerenciamento centralizado com um mapa de calor interativo no qual é possível analisar os principais focos de calamidade (Bairro Humaitá, Mathias Velho, Eldorado) bastando clicar nos pontos correspondentes.

Métricas Visuais: Painéis integrados nos pés de página exibindo quantidade de voluntários logados, desvios operacionais, turnos disponíveis e status de conformidade da central de controle.


4 - Estrutura do Sistema;
Front-end
Back-end
PostgreSQL
Typescript
Express / Node.js & Armazenamento:
Desenvolvido no arquivo server.ts com suporte nativo a rotas de APIs operacionais para cadastrar, editar, desvincular e expor dados instantâneos de apoios.
Fornece recursos de persistência para voluntários, demandas urgentes, vinculações de equipe e agregação automática de estatísticas.
Banco de Dados Relacional:
Configurado o arquivo /schema.sql modelando tabelas relacionais em PostgreSQL para organizar recursos (volunteers), demandas críticas (needs) e atribuições dinâmicas de campo (assignments).


**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
