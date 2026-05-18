# Diretrizes Obrigatórias de Desenvolvimento e Comportamento (GitHub Copilot / VSCode)

## 1. Inicialização e Reconhecimento do Projeto
- **Análise Inicial:** Assim que uma nova sessão de chat for iniciada no GitHub Copilot (`@workspace`), faça um escaneamento completo da estrutura atual do repositório para entender o contexto antes de sugerir qualquer alteração.
- **Sincronização:** Se aplicável, verifique o conteúdo da pasta `brain/` para retomar o raciocínio de sessões anteriores.

## 2. Alinhamento e Planejamento (Antes de Codificar)
- **Aprovação Obrigatória:** NUNCA escreva ou altere linhas de código sem validação prévia do usuário.
- **Protocolo de Proposta:** Antes de codificar, apresente no chat um breve "Plano de Ação" em tópicos explicando o que será feito e por quê. Aguarde o "DE ACORDO" explícito do usuário.
- **Recomendação de Modelo do Copilot:** No final de todo Plano de Ação, inclua uma seção recomendando qual modelo disponível no menu do GitHub Copilot é o mais adequado para o usuário selecionar para executar a tarefa. Siga a lógica abaixo:
  * **DeepSeek V4 Pro:** Para debug avançado de erros complexos, análise profunda de regras de negócio abstratas ou arquitetura estrutural do projeto.
  * **GPT-4o:** Para a criação geral de features complexas, refatorações amplas no espaço de trabalho e quando precisar de máxima aderência aos recursos do `@workspace`.
  * **GPT-5 mini:** Para o desenvolvimento ativo de código no dia a dia, escrita de novos métodos e lógica ágil com ótimo equilíbrio de inteligência.
  * **Claude Haiku 4.5:** Para refatorações rápidas, geração de testes unitários e escrita de código limpo e direto.
  * **DeepSeek V4 Flash / GPT-4.1:** Para comandos rápidos usando `@terminal`, criação de scripts auxiliares simples ou geração de regex e dados fictícios.

## 3. Ambiente e Gerenciamento de Dependências
- **Isolamento de Ambiente:** Todo projeto Python DEVE utilizar um ambiente virtual (ex: `.venv`). Certifique-se de que ele está ativo antes de executar comandos.
- **requirements.txt:** Garanta que o arquivo `requirements.txt` exista na raiz do projeto. Sempre que uma nova dependência for instalada, atualize o arquivo imediatamente.

## 4. Gestão do Conhecimento (Pasta "Brain")
- **Documentação de Processo:** Mantenha uma pasta chamada `brain/` na raiz do projeto. Use-a para salvar resumos de conversas importantes, decisões de arquitetura e notas de desenvolvimento pertinentes.
- **Privacidade da Pasta:** A pasta `brain/` DEVE constar obrigatoriamente no arquivo `.gitignore`.

## 5. Segurança da Informação e Dados Sensíveis
- **Exclusão de Credenciais:** Nunca exponha chaves de API, senhas, tokens ou arquivos `.env` publicamente.
- **Bancos de Dados Locais:** Arquivos de banco de dados locais (ex: `.db`, `.sqlite3`, `database.py`) NÃO PODEM ser commitados. Eles devem estar no `.gitignore`.
- **Arquivos de Exemplo:** Para qualquer arquivo de configuração ou banco local, crie e envie uma versão de exemplo com dados fictícios (ex: `database.example.py`, `.env.example`).

## 6. Padrões de Código e Documentação
- **Comentários Úteis:** Todo código deve ser limpo e documentado. Evite comentários óbvios; foque em explicar a lógica de regras de negócios complexas e decisões de arquitetura.
- **Docstrings:** Utilize docstrings padronizadas no início de funções, classes e métodos.

## 7. Protocolo de Pré-Commit e Git Push
- **Checklist de Publicação:** Antes de realizar um push para a branch `main` no GitHub, verifique rigorosamente se os seguintes arquivos estão presentes, atualizados e condizentes com o estado atual do projeto:
  1. `README.md` (Instruções de execução claras)
  2. `.gitignore` (Garantindo que `brain/`, bases de dados e `.env` estão barrados)
  3. `LICENSE` (Garantir a presença da Licença MIT)
  4. `PRD` (Product Requirement Document / Documento de Requisitos do Projeto, se aplicável)