# PRD - FIF Web App

## 1. Visao Geral

O projeto `FIF Web App` tem como objetivo transformar dois formularios trabalhistas atualmente mantidos em planilha Excel em um app web com interface moderna, organizada e facil de preencher.

Nesta primeira fase, o produto sera apenas um front-end estatico, sem backend, sem banco de dados e sem automacoes de calculo. O foco e digitalizar a experiencia de preenchimento dos formularios e organizar melhor a navegacao para o usuario.

Os dois fluxos principais do sistema serao:

1. `Admissao`
2. `Rescisao, Ferias e Alteracoes`

## 2. Problema

Os formularios atuais existem em planilha e sao extensos, densos e pouco amigaveis para preenchimento digital. A estrutura atual dificulta navegacao, leitura, organizacao dos dados e posterior evolucao para um sistema mais completo.

## 3. Objetivo do Produto

Criar um app web responsivo que:

- represente fielmente os dois formularios principais da planilha;
- organize os campos em secoes claras;
- reduza a sensacao de burocracia no preenchimento;
- sirva como base para futuras evolucoes funcionais.

## 4. Escopo da Fase 1

### Incluido

- Tela inicial com acesso aos 2 fluxos principais
- Formulario de `Admissao`
- Formulario de `Rescisao, Ferias e Alteracoes`
- Interface responsiva para desktop e mobile
- Navegacao por secoes
- Componentes visuais de formulario
- Validacoes visuais basicas
- Botoes de acao como `Salvar rascunho`, `Limpar` e `Enviar`

### Nao incluido nesta fase

- Backend
- Banco de dados
- Login
- Integracoes externas
- Persistencia real de dados
- Calculos automaticos de jornada, horas, ferias ou rescisao
- Geracao de documentos
- Relatorios
- Configuracoes administrativas

## 5. Usuarios

Usuarios principais esperados:

- Profissionais de departamento pessoal
- Equipe de RH
- Equipe administrativa responsavel por coleta de dados trabalhistas

## 6. Referencias do Projeto

### Referencia funcional

- Arquivo Excel em `exemplo/FIF_Geral.xlsx`
- Abas utilizadas:
  - `ADMISSAO`
  - `RESCISAO-FERIAS e ALTERACOES`

### Referencia visual

- Layouts gerados na pasta `design/`
- O design atual deve ser tratado como base visual, nao como cobertura funcional completa

## 7. Requisitos Funcionais

### 7.1 Tela inicial

O sistema deve possuir uma tela inicial com:

- apresentacao simples do produto;
- dois acessos principais:
  - `Fluxo de Admissao`
  - `Fluxo de Rescisao, Ferias e Alteracoes`

### 7.2 Formulario de Admissao

O formulario de admissao deve conter as seguintes secoes:

1. Dados do empregador
2. Dados do empregado
3. Dados pessoais
4. Documentacao
5. Endereco
6. Filiacao
7. Dados do contrato
8. Cargo e salario
9. Beneficios e descontos
10. Jornada de trabalho
11. Escala semanal
12. Dependentes
13. Assinaturas e controle interno

Campos principais esperados:

- empregador, matriz/filial, cadastro
- empregado, cadastro
- grau de instrucao, data de nascimento, PIS, sexo, raca, estado civil
- municipio de nascimento, UF, deficiencia, tipo de visto
- nacionalidade, pais de origem, data de chegada
- CTPS digital, numero CTPS, serie, UF, expedicao
- CPF, RG, orgao emissor, UF do RG, CNH, categoria CNH
- titulo eleitoral, zona, secao, telefone
- logradouro, endereco, numero, bairro, municipio, UF, CEP
- nome da mae, nome do pai, e-mail
- tipo de contrato, data de admissao, departamento
- primeiro emprego, recebendo seguro, reemprego
- cargo, CBO, salario contratual
- periculosidade, insalubridade, produtividade
- descontar sindical, vale transporte, quantidade, tipo
- dias de experiencia inicial, dias de prorrogacao
- tipo de jornada
- escala semanal de segunda a domingo
- quantidade de dependentes salario-familia
- dependentes com nome, data de nascimento e CPF
- data de execucao, data de liberacao, data de solicitacao e assinaturas

### 7.3 Formulario de Rescisao, Ferias e Alteracoes

O formulario de rescisao, ferias e alteracoes deve conter as seguintes secoes:

1. Dados do empregador
2. Dados do empregado
3. Alteracao de dados pessoais
4. Alteracao contratual
5. Alteracao salarial
6. Beneficios e descontos
7. Jornada de trabalho
8. Escala semanal
9. Ferias
10. Rescisao
11. Assinaturas e controle interno

Campos principais esperados:

- empregador, matriz/filial
- empregado, cadastro
- estado civil, PIS, sexo, deficiencia, grau de instrucao
- numero CTPS, serie, UF CTPS, expedicao
- RG, orgao emissor, UF do RG
- CNH, categoria CNH
- titulo eleitoral, zona, secao
- telefone, tipo de visto
- logradouro, endereco, numero, bairro, municipio, UF, CEP
- cargo, CBO, departamento
- salario contratual, motivo da alteracao salarial
- descontar sindical, periculosidade, insalubridade, produtividade
- vale transporte, quantidade e tipo
- tipo de jornada
- escala semanal de segunda a domingo
- periodo aquisitivo, dias de direito, abono pecuniario
- inicio e final das ferias
- inicio e final do abono
- causa da demissao, aviso previo trabalhado
- data da demissao, data do aviso, quantidade de dias de aviso
- motivo da rescisao, reducao de 2 horas, reducao de 7 dias
- dispensa de desconto de aviso
- observacoes, datas e assinaturas

## 8. Requisitos de UX e UI

O produto deve seguir os principios abaixo:

- aparencia profissional e corporativa;
- visual moderno e confiavel;
- organizacao em cards ou blocos de secao;
- boa hierarquia visual;
- navegacao clara em formularios longos;
- destaque para campos obrigatorios;
- barra de acoes fixa ou sempre visivel;
- responsividade adequada em telas menores;
- experiencia mais amigavel do que a planilha original.

## 9. Requisitos Tecnicos da Fase 1

- Aplicacao web front-end
- Estrutura preparada para futura evolucao
- Componentizacao dos formularios
- Separacao clara entre os dois fluxos
- Campos estaticos e sem dependencia de persistencia real

## 10. Critérios de Pronto

A fase 1 sera considerada pronta quando:

- a tela inicial estiver funcional;
- os 2 fluxos estiverem acessiveis;
- todas as secoes principais dos 2 formularios estiverem representadas;
- os campos mais importantes da planilha estiverem presentes;
- a navegacao entre secoes estiver clara;
- o layout estiver consistente com a referencia visual aprovada.

## 11. Proximos Passos Sugeridos

1. Definir stack do front-end
2. Criar estrutura inicial do projeto
3. Implementar tela inicial
4. Implementar formulario de admissao
5. Implementar formulario de rescisao, ferias e alteracoes
6. Refinar responsividade
7. Preparar fase futura com persistencia e regras de negocio
