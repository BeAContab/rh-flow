---
name: Premium HR Labor Forms System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#44474e'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e81'
  primary: '#031635'
  on-primary: '#ffffff'
  primary-container: '#1a2b4b'
  on-primary-container: '#8293b8'
  inverse-primary: '#b6c6ef'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#11181d'
  on-tertiary: '#ffffff'
  tertiary-container: '#262c32'
  on-tertiary-container: '#8d939b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6ef'
  on-primary-fixed: '#081b3a'
  on-primary-fixed-variant: '#364768'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

O sistema de design baseia-se em uma estética **Corporate Modern**, priorizando a clareza institucional e a precisão técnica necessária para o setor de Recursos Humanos e Jurídico. O objetivo é transformar processos burocráticos em experiências fluidas e sofisticadas, transmitindo autoridade e segurança.

A experiência do usuário deve evocar:
- **Confiabilidade:** Através de uma estrutura sólida e paleta de cores sóbria.
- **Eficiência:** Através de um layout focado em dados, com generoso uso de espaços em branco (whitespace) para reduzir a carga cognitiva.
- **Exclusividade:** Através de detalhes refinados, micro-interações suaves e tipografia impecável.

Este sistema evita o aspecto de "template pronto", utilizando uma hierarquia visual rigorosa e elementos de interface personalizados que reforçam a sensação de uma ferramenta profissional de alto nível.

## Colors

A paleta é fundamentada em tons profundos e neutros para estabelecer um ambiente de trabalho sério e focado.

- **Deep Navy (#1A2B4B):** Cor primária, utilizada para elementos de marca, headers principais e botões de ação primária. Representa estabilidade.
- **Slate Gray (#4A5568):** Cor secundária, aplicada em sub-cabeçalhos, ícones secundários e estados desativados.
- **Soft Blue (#3182CE):** Cor de sotaque (accent), reservada exclusivamente para elementos interativos, links e estados de foco (focus states), guiando o olhar do usuário para a ação.
- **Charcoal (#2D3748):** Utilizada para o texto principal, garantindo contraste ideal sem o cansaço visual do preto puro.
- **Pure White (#FFFFFF):** A base do sistema, aplicada em superfícies e fundos para maximizar a sensação de limpeza e organização.

## Typography

A tipografia utiliza uma combinação de duas fontes sans-serif para equilibrar personalidade e funcionalidade.

- **Manrope** é utilizada para títulos e elementos de destaque (Display/Headline), oferecendo um toque moderno e geométrico que diferencia a ferramenta.
- **Inter** é aplicada em todo o corpo de texto, formulários e labels. Sua legibilidade excepcional em tamanhos pequenos a torna ideal para o preenchimento de formulários densos e leitura de cláusulas contratuais.

**Hierarquia em PT-BR:** Dado que o Português costuma ocupar cerca de 20% a mais de espaço que o Inglês, as alturas de linha (line-height) foram ajustadas para evitar o aspecto de texto "espremido", garantindo o conforto visual.

## Layout & Spacing

Este design sistema utiliza um **Fixed Grid** centralizado para desktops para manter a densidade de informações sob controle, e um sistema fluido para dispositivos móveis.

- **Grid:** 12 colunas em desktop com gutters de 24px.
- **Escala de Spacing:** Baseada em múltiplos de 8px (8, 16, 24, 32, 48, 64).
- **Rimo Visual:** O uso de margens amplas (40px+) entre seções de formulários é obrigatório para evitar a percepção de complexidade excessiva. 
- **Reflow:** Em tablets, o grid reduz para 8 colunas. Em dispositivos móveis, para 4 colunas com margens laterais de 16px, transformando componentes horizontais (como steps de progresso) em listas verticais ou indicadores simplificados.

## Elevation & Depth

A profundidade é comunicada através de **Tonal Layers** e sombras ambientes extremamente sutis. O objetivo é criar uma interface que pareça organizada em camadas lógicas, sem distrações visuais.

- **Nível 0 (Fundo):** Pure White ou um cinza ultra-claro (#F7FAFC) para áreas de navegação.
- **Nível 1 (Cards):** Superfícies brancas com uma borda fina de 1px (#E2E8F0) e uma sombra "Soft" (0px 4px 12px rgba(0, 0, 0, 0.03)).
- **Nível 2 (Dropdowns/Modais):** Sombras mais profundas e difundidas para indicar sobreposição clara sobre o conteúdo principal (0px 12px 24px rgba(26, 43, 75, 0.08)).

O foco não é simular o mundo físico, mas sim criar uma separação clara entre o que é "base" e o que é "interativo".

## Shapes

O sistema utiliza o nível **Soft (1)** de arredondamento. 

- **Inputs e Botões:** 0.25rem (4px) de border-radius. Este valor confere um aspecto sério e arquitetural, evitando a informalidade de cantos muito arredondados.
- **Cards e Containers:** 0.5rem (8px) para criar uma contenção visual suave mas definida.
- **Checkboxes:** 2px de arredondamento para manter a harmonia com os campos de texto.

## Components

### Botões (Buttons)
- **Primary:** Fundo Deep Navy (#1A2B4B), texto branco. Transição de opacidade suave no hover.
- **Secondary:** Borda 1px Slate Gray, texto Slate Gray.
- **Ghost:** Texto Soft Blue, sem fundo, para ações secundárias ou "Voltar".

### Entradas de Formulário (Inputs)
- **Estado Padrão:** Borda 1px cinza claro, label em Inter Medium (14px).
- **Estado de Foco:** Borda Soft Blue (#3182CE) com um "glow" sutil (box-shadow externo de 2px).
- **Mensagens de Erro:** Texto em tom rubi sofisticado, nunca vermelho puro, mantendo a sobriedade.

### Indicadores de Progresso (Stepped Progress)
- Linhas finas conectando círculos numerados. O passo atual utiliza o Deep Navy; passos concluídos utilizam um ícone de "check" discreto em Soft Blue.

### Cards
- Utilizados para agrupar blocos lógicos de perguntas no formulário. Devem possuir padding interno generoso (32px) para permitir que o conteúdo "respire".

### Iconografia
- Estilo **Outline**, com traços finos (1.5pt). Os ícones devem ser puramente funcionais (ex: calendário para datas, clip para anexos), agindo como suportes visuais e não como decoração.