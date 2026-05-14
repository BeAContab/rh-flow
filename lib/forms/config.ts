import { z } from "zod";

import {
  brazilUfOptions,
  cnhCategoryOptions,
  educationOptions,
  maritalStatusOptions,
  raceOptions,
  streetTypeOptions,
} from "@/lib/forms/brazil";
import type { FormDefinition, FormField } from "@/lib/forms/types";

const yesNoOptions = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
];

const contractOptions = [
  { label: "Selecione", value: "" },
  { label: "Empregado", value: "empregado" },
  { label: "Intermitente", value: "intermitente" },
  { label: "Aprendiz", value: "aprendiz" },
  { label: "Estagiário", value: "estagiario" },
];

const workdayOptions = [
  { label: "Selecione", value: "" },
  { label: "Horário diário com folga fixa", value: "fixa" },
  { label: "Horário diário com folga variável", value: "variavel" },
  { label: "12 x 36", value: "12x36" },
  { label: "12 x 60", value: "12x60" },
  { label: "Outros", value: "outros" },
];

function fieldsToSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "checkbox") {
      shape[field.name] = z.boolean().optional();
      continue;
    }

    const base = z.string().trim();
    shape[field.name] = field.required
      ? base.min(1, `${field.label} é obrigatório`)
      : base.optional().or(z.literal(""));
  }

  return z.object(shape);
}

export const admissaoFormDefinition: FormDefinition = {
  flowType: "admissao",
  title: "Fluxo de Admissão",
  subtitle:
    "Cadastre um novo colaborador, organize a coleta de dados e salve o formulário diretamente no banco.",
  sections: [
    {
      id: "empregador",
      title: "Dados do empregador",
      description: "Informações da empresa solicitante e da unidade.",
      fields: [
        { name: "employerName", label: "Empregador", type: "text", required: true, span: 8 },
        {
          name: "branchType",
          label: "Matriz ou filial",
          type: "radio",
          required: true,
          options: [
            { label: "Matriz", value: "matriz" },
            { label: "Filial", value: "filial" },
          ],
          span: 4,
        },
        { name: "employerRegistration", label: "Cadastro", type: "date", span: 4 },
      ],
    },
    {
      id: "empregado",
      title: "Dados do empregado",
      description: "Identificação básica do colaborador.",
      fields: [
        { name: "employeeName", label: "Empregado", type: "text", required: true, span: 8 },
        { name: "employeeRegistration", label: "Cadastro", type: "date", span: 4 },
      ],
    },
    {
      id: "pessoais",
      title: "Dados pessoais",
      description: "Informações civis, sociais e de origem.",
      fields: [
        {
          name: "educationLevel",
          label: "Grau de instrução",
          type: "select",
          options: educationOptions,
          span: 4,
        },
        { name: "birthDate", label: "Data de nascimento", type: "date", required: true, span: 4 },
        { name: "pis", label: "PIS", type: "text", span: 4, mask: "digits" },
        {
          name: "sex",
          label: "Sexo",
          type: "select",
          options: [
            { label: "Selecione", value: "" },
            { label: "Masculino", value: "masculino" },
            { label: "Feminino", value: "feminino" },
            { label: "Outro", value: "outro" },
          ],
          span: 4,
        },
        { name: "race", label: "Raça", type: "select", options: raceOptions, span: 4 },
        {
          name: "maritalStatus",
          label: "Estado civil",
          type: "select",
          options: maritalStatusOptions,
          span: 4,
        },
        {
          name: "birthState",
          label: "UF de nascimento",
          type: "select",
          options: brazilUfOptions,
          span: 3,
        },
        {
          name: "birthCity",
          label: "Município de nascimento",
          type: "select",
          options: [{ label: "Selecione a UF primeiro", value: "" }],
          dependsOn: "birthState",
          autoComplete: "city",
          span: 6,
        },
        { name: "disability", label: "Deficiência", type: "text", span: 4 },
        { name: "visaType", label: "Tipo de visto", type: "text", span: 4 },
        { name: "nationality", label: "Nacionalidade", type: "text", span: 4 },
        { name: "originCountry", label: "País de origem", type: "text", span: 4 },
        { name: "arrivalDate", label: "Data de chegada", type: "date", span: 4 },
      ],
    },
    {
      id: "documentos",
      title: "Documentação",
      description: "Documentos trabalhistas, civis e de identificação.",
      fields: [
        { name: "ctpsDigital", label: "CTPS digital", type: "radio", options: yesNoOptions, span: 4 },
        { name: "ctpsNumber", label: "Número da CTPS", type: "text", span: 4, mask: "digits" },
        { name: "ctpsSeries", label: "Série CTPS", type: "text", span: 4, mask: "digits" },
        { name: "ctpsState", label: "UF CTPS", type: "select", options: brazilUfOptions, span: 3 },
        { name: "ctpsIssueDate", label: "Expedição CTPS", type: "date", span: 3 },
        { name: "cpf", label: "CPF", type: "text", required: true, span: 6, mask: "cpf" },
        { name: "rg", label: "RG", type: "text", span: 4, mask: "digits" },
        { name: "rgIssuer", label: "Órgão emissor", type: "text", span: 4 },
        { name: "rgState", label: "UF do RG", type: "select", options: brazilUfOptions, span: 4 },
        { name: "rgIssueDate", label: "Expedição RG", type: "date", span: 4 },
        { name: "cnh", label: "CNH", type: "text", span: 4, mask: "digits" },
        {
          name: "cnhCategory",
          label: "Categoria CNH",
          type: "select",
          options: cnhCategoryOptions,
          span: 4,
        },
        { name: "voterTitle", label: "Título eleitoral", type: "text", span: 4, mask: "digits" },
        { name: "voterZone", label: "Zona", type: "text", span: 4, mask: "digits" },
        { name: "voterSection", label: "Seção", type: "text", span: 4, mask: "digits" },
        { name: "phone", label: "Telefone", type: "text", span: 4, mask: "phone" },
      ],
    },
    {
      id: "endereco",
      title: "Endereço e filiação",
      description: "Dados residenciais e familiares.",
      fields: [
        {
          name: "zipCode",
          label: "CEP",
          type: "text",
          span: 3,
          mask: "cep",
          autoComplete: "cep",
        },
        {
          name: "streetType",
          label: "Logradouro",
          type: "select",
          options: streetTypeOptions,
          span: 3,
        },
        { name: "addressLine", label: "Endereço", type: "text", span: 6 },
        { name: "addressNumber", label: "Número", type: "number", span: 2 },
        { name: "addressComplement", label: "Complemento", type: "text", span: 4 },
        { name: "neighborhood", label: "Bairro", type: "text", span: 4 },
        { name: "state", label: "UF", type: "select", options: brazilUfOptions, span: 2 },
        {
          name: "city",
          label: "Município",
          type: "select",
          options: [{ label: "Selecione a UF primeiro", value: "" }],
          dependsOn: "state",
          autoComplete: "city",
          span: 4,
        },
        { name: "motherName", label: "Nome da mãe", type: "text", span: 6 },
        { name: "fatherName", label: "Nome do pai", type: "text", span: 6 },
        {
          name: "email",
          label: "E-mail",
          type: "email",
          span: 6,
          placeholder: "exemplo@empresa.com.br",
        },
      ],
    },
    {
      id: "contrato",
      title: "Dados do contrato",
      description: "Informações contratuais, cargo e salário.",
      fields: [
        { name: "contractType", label: "Tipo de contrato", type: "select", options: contractOptions, span: 4 },
        { name: "admissionDate", label: "Data de admissão", type: "date", span: 4 },
        { name: "department", label: "Departamento", type: "text", span: 4 },
        { name: "firstJob", label: "Primeiro emprego", type: "radio", options: yesNoOptions, span: 4 },
        { name: "receivingInsurance", label: "Recebendo seguro", type: "radio", options: yesNoOptions, span: 4 },
        { name: "reemployment", label: "Reemprego", type: "radio", options: yesNoOptions, span: 4 },
        { name: "role", label: "Cargo", type: "text", span: 4 },
        { name: "cbo", label: "CBO", type: "text", span: 4, mask: "digits" },
        { name: "salary", label: "Salário contratual", type: "text", span: 4, mask: "currency" },
        { name: "hazardPay", label: "Periculosidade", type: "text", span: 4 },
        { name: "insalubrityPay", label: "Insalubridade", type: "text", span: 4 },
        { name: "productivityPay", label: "Produtividade", type: "text", span: 4 },
      ],
    },
    {
      id: "beneficios",
      title: "Benefícios, descontos e jornada",
      description: "Descontos, vale-transporte e regime de trabalho.",
      fields: [
        { name: "unionDiscount", label: "Descontar sindical", type: "radio", options: yesNoOptions, span: 4 },
        { name: "valeTransporte", label: "Vale-transporte", type: "radio", options: yesNoOptions, span: 4 },
        { name: "transportQuantity", label: "Quantidade de vale", type: "text", span: 4, mask: "digits" },
        { name: "transportType", label: "Tipo de vale", type: "text", span: 4 },
        { name: "trialDays", label: "Dias de experiência inicial", type: "number", span: 4 },
        { name: "extensionDays", label: "Dias de prorrogação", type: "number", span: 4 },
        { name: "workdayType", label: "Tipo de jornada", type: "select", options: workdayOptions, span: 6 },
      ],
    },
    {
      id: "escala",
      title: "Escala semanal",
      description: "Horários informados pelo solicitante.",
      fields: [
        { name: "mondayStart", label: "Segunda entrada", type: "text", span: 12, placeholder: "08:00" },
        { name: "mondayLunchOut", label: "Segunda saída almoço", type: "text", span: 12, placeholder: "12:00" },
        { name: "mondayLunchIn", label: "Segunda retorno almoço", type: "text", span: 12, placeholder: "13:00" },
        { name: "mondayEnd", label: "Segunda saída", type: "text", span: 12, placeholder: "17:00" },
        { name: "tuesdayStart", label: "Terça entrada", type: "text", span: 12 },
        { name: "tuesdayLunchOut", label: "Terça saída almoço", type: "text", span: 12 },
        { name: "tuesdayLunchIn", label: "Terça retorno almoço", type: "text", span: 12 },
        { name: "tuesdayEnd", label: "Terça saída", type: "text", span: 12 },
        { name: "wednesdayStart", label: "Quarta entrada", type: "text", span: 12 },
        { name: "wednesdayLunchOut", label: "Quarta saída almoço", type: "text", span: 12 },
        { name: "wednesdayLunchIn", label: "Quarta retorno almoço", type: "text", span: 12 },
        { name: "wednesdayEnd", label: "Quarta saída", type: "text", span: 12 },
        { name: "thursdayStart", label: "Quinta entrada", type: "text", span: 12 },
        { name: "thursdayLunchOut", label: "Quinta saída almoço", type: "text", span: 12 },
        { name: "thursdayLunchIn", label: "Quinta retorno almoço", type: "text", span: 12 },
        { name: "thursdayEnd", label: "Quinta saída", type: "text", span: 12 },
        { name: "fridayStart", label: "Sexta entrada", type: "text", span: 12 },
        { name: "fridayLunchOut", label: "Sexta saída almoço", type: "text", span: 12 },
        { name: "fridayLunchIn", label: "Sexta retorno almoço", type: "text", span: 12 },
        { name: "fridayEnd", label: "Sexta saída", type: "text", span: 12 },
        { name: "saturdayStart", label: "Sábado entrada", type: "text", span: 12 },
        { name: "saturdayLunchOut", label: "Sábado saída almoço", type: "text", span: 12 },
        { name: "saturdayLunchIn", label: "Sábado retorno almoço", type: "text", span: 12 },
        { name: "saturdayEnd", label: "Sábado saída", type: "text", span: 12 },
        { name: "sundayStart", label: "Domingo entrada", type: "text", span: 12 },
        { name: "sundayLunchOut", label: "Domingo saída almoço", type: "text", span: 12 },
        { name: "sundayLunchIn", label: "Domingo retorno almoço", type: "text", span: 12 },
        { name: "sundayEnd", label: "Domingo saída", type: "text", span: 12 },
        { name: "scheduleNotes", label: "Observações da escala", type: "textarea", span: 12 },
      ],
    },
    {
      id: "dependentes",
      title: "Dependentes e controle interno",
      description: "Dependentes para salário-família e dados finais do processo.",
      fields: [
        { name: "dependentsCount", label: "Quantidade de dependentes", type: "number", span: 3 },
        { name: "dependent1Name", label: "Dependente 1 nome", type: "text", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent1BirthDate", label: "Dependente 1 nascimento", type: "date", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent1Cpf", label: "Dependente 1 CPF", type: "text", span: 12, mask: "cpf", disabledWhenZero: "dependentsCount" },
        { name: "dependent2Name", label: "Dependente 2 nome", type: "text", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent2BirthDate", label: "Dependente 2 nascimento", type: "date", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent2Cpf", label: "Dependente 2 CPF", type: "text", span: 12, mask: "cpf", disabledWhenZero: "dependentsCount" },
        { name: "dependent3Name", label: "Dependente 3 nome", type: "text", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent3BirthDate", label: "Dependente 3 nascimento", type: "date", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent3Cpf", label: "Dependente 3 CPF", type: "text", span: 12, mask: "cpf", disabledWhenZero: "dependentsCount" },
        { name: "dependent4Name", label: "Dependente 4 nome", type: "text", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent4BirthDate", label: "Dependente 4 nascimento", type: "date", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent4Cpf", label: "Dependente 4 CPF", type: "text", span: 12, mask: "cpf", disabledWhenZero: "dependentsCount" },
        { name: "dependent5Name", label: "Dependente 5 nome", type: "text", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent5BirthDate", label: "Dependente 5 nascimento", type: "date", span: 12, disabledWhenZero: "dependentsCount" },
        { name: "dependent5Cpf", label: "Dependente 5 CPF", type: "text", span: 12, mask: "cpf", disabledWhenZero: "dependentsCount" },
        { name: "executionDate", label: "Data de execução", type: "date", span: 4 },
        { name: "releaseDate", label: "Data de liberação", type: "date", span: 4 },
        { name: "requestDate", label: "Data de solicitação", type: "date", span: 4 },
        { name: "internalNotes", label: "Observações internas", type: "textarea", span: 12 },
      ],
    },
  ],
};

export const movimentacoesFormDefinition: FormDefinition = {
  flowType: "movimentacoes",
  title: "Rescisão, Férias e Alterações",
  subtitle:
    "Registre alterações cadastrais, alterações salariais, férias e eventos de rescisão em um único fluxo.",
  sections: [
    {
      id: "identificacao",
      title: "Dados do empregador e empregado",
      description: "Unidade solicitante e identificação do colaborador.",
      fields: [
        { name: "employerName", label: "Empregador", type: "text", required: true, span: 8 },
        {
          name: "branchType",
          label: "Matriz ou filial",
          type: "radio",
          options: [
            { label: "Matriz", value: "matriz" },
            { label: "Filial", value: "filial" },
          ],
          span: 4,
        },
        { name: "workerName", label: "Empregado", type: "text", required: true, span: 8 },
        { name: "registration", label: "Cadastro", type: "date", span: 4 },
      ],
    },
    {
      id: "pessoais",
      title: "Alteração de dados pessoais",
      description: "Dados civis, documentos e endereço atualizados.",
      fields: [
        { name: "maritalStatus", label: "Estado civil", type: "select", options: maritalStatusOptions, span: 4 },
        { name: "pis", label: "PIS", type: "text", span: 4, mask: "digits" },
        {
          name: "sex",
          label: "Sexo",
          type: "select",
          options: [
            { label: "Selecione", value: "" },
            { label: "Masculino", value: "masculino" },
            { label: "Feminino", value: "feminino" },
            { label: "Outro", value: "outro" },
          ],
          span: 4,
        },
        { name: "disability", label: "Deficiência", type: "text", span: 4 },
        { name: "educationLevel", label: "Grau de instrução", type: "select", options: educationOptions, span: 4 },
        { name: "visaType", label: "Tipo de visto", type: "text", span: 4 },
        { name: "ctpsNumber", label: "Número CTPS", type: "text", span: 3, mask: "digits" },
        { name: "ctpsSeries", label: "Série CTPS", type: "text", span: 3, mask: "digits" },
        { name: "ctpsState", label: "UF CTPS", type: "select", options: brazilUfOptions, span: 3 },
        { name: "ctpsIssueDate", label: "Expedição CTPS", type: "date", span: 3 },
        { name: "rg", label: "RG", type: "text", span: 3, mask: "digits" },
        { name: "rgIssuer", label: "Órgão emissor", type: "text", span: 3 },
        { name: "rgState", label: "UF do RG", type: "select", options: brazilUfOptions, span: 3 },
        { name: "cnh", label: "CNH", type: "text", span: 3, mask: "digits" },
        { name: "cnhCategory", label: "Categoria CNH", type: "select", options: cnhCategoryOptions, span: 3 },
        { name: "voterTitle", label: "Título eleitoral", type: "text", span: 3, mask: "digits" },
        { name: "voterZone", label: "Zona", type: "text", span: 3, mask: "digits" },
        { name: "voterSection", label: "Seção", type: "text", span: 3, mask: "digits" },
        { name: "phone", label: "Telefone", type: "text", span: 3, mask: "phone" },
        { name: "zipCode", label: "CEP", type: "text", span: 3, mask: "cep", autoComplete: "cep" },
        { name: "state", label: "UF", type: "select", options: brazilUfOptions, span: 2 },
        {
          name: "city",
          label: "Município",
          type: "select",
          options: [{ label: "Selecione a UF primeiro", value: "" }],
          dependsOn: "state",
          autoComplete: "city",
          span: 4,
        },
        { name: "streetType", label: "Logradouro", type: "select", options: streetTypeOptions, span: 3 },
        { name: "addressLine", label: "Endereço", type: "text", span: 6 },
        { name: "addressNumber", label: "Número", type: "number", span: 2 },
        { name: "addressComplement", label: "Complemento", type: "text", span: 4 },
        { name: "neighborhood", label: "Bairro", type: "text", span: 4 },
      ],
    },
    {
      id: "contratual",
      title: "Alteração contratual e salarial",
      description: "Cargo, departamento e motivações de alteração.",
      fields: [
        { name: "role", label: "Cargo", type: "text", span: 4 },
        { name: "cbo", label: "CBO", type: "text", span: 4, mask: "digits" },
        { name: "department", label: "Departamento", type: "text", span: 4 },
        { name: "salary", label: "Salário contratual", type: "text", span: 4, mask: "currency" },
        { name: "salaryChangeReason", label: "Motivo da alteração salarial", type: "textarea", span: 8 },
      ],
    },
    {
      id: "beneficios",
      title: "Benefícios e jornada",
      description: "Descontos, adicionais e regime de trabalho.",
      fields: [
        { name: "unionDiscount", label: "Descontar sindical", type: "radio", options: yesNoOptions, span: 4 },
        { name: "hazardPay", label: "Periculosidade", type: "text", span: 4 },
        { name: "insalubrityPay", label: "Insalubridade", type: "text", span: 4 },
        { name: "productivityPay", label: "Produtividade", type: "text", span: 4 },
        { name: "valeTransporte", label: "Vale-transporte", type: "radio", options: yesNoOptions, span: 4 },
        { name: "transportQuantity", label: "Quantidade", type: "text", span: 2, mask: "digits" },
        { name: "transportType", label: "Tipo", type: "text", span: 6 },
        { name: "workdayType", label: "Tipo de jornada", type: "select", options: workdayOptions, span: 6 },
      ],
    },
    {
      id: "escala",
      title: "Escala semanal",
      description: "Horários praticados na jornada do colaborador.",
      fields: [
        { name: "mondayStart", label: "Segunda entrada", type: "text", span: 12, placeholder: "08:00" },
        { name: "mondayLunchOut", label: "Segunda saída almoço", type: "text", span: 12, placeholder: "12:00" },
        { name: "mondayLunchIn", label: "Segunda retorno almoço", type: "text", span: 12, placeholder: "13:00" },
        { name: "mondayEnd", label: "Segunda saída", type: "text", span: 12, placeholder: "17:00" },
        { name: "tuesdayStart", label: "Terça entrada", type: "text", span: 12 },
        { name: "tuesdayLunchOut", label: "Terça saída almoço", type: "text", span: 12 },
        { name: "tuesdayLunchIn", label: "Terça retorno almoço", type: "text", span: 12 },
        { name: "tuesdayEnd", label: "Terça saída", type: "text", span: 12 },
        { name: "wednesdayStart", label: "Quarta entrada", type: "text", span: 12 },
        { name: "wednesdayLunchOut", label: "Quarta saída almoço", type: "text", span: 12 },
        { name: "wednesdayLunchIn", label: "Quarta retorno almoço", type: "text", span: 12 },
        { name: "wednesdayEnd", label: "Quarta saída", type: "text", span: 12 },
        { name: "thursdayStart", label: "Quinta entrada", type: "text", span: 12 },
        { name: "thursdayLunchOut", label: "Quinta saída almoço", type: "text", span: 12 },
        { name: "thursdayLunchIn", label: "Quinta retorno almoço", type: "text", span: 12 },
        { name: "thursdayEnd", label: "Quinta saída", type: "text", span: 12 },
        { name: "fridayStart", label: "Sexta entrada", type: "text", span: 12 },
        { name: "fridayLunchOut", label: "Sexta saída almoço", type: "text", span: 12 },
        { name: "fridayLunchIn", label: "Sexta retorno almoço", type: "text", span: 12 },
        { name: "fridayEnd", label: "Sexta saída", type: "text", span: 12 },
        { name: "saturdayStart", label: "Sábado entrada", type: "text", span: 12 },
        { name: "saturdayLunchOut", label: "Sábado saída almoço", type: "text", span: 12 },
        { name: "saturdayLunchIn", label: "Sábado retorno almoço", type: "text", span: 12 },
        { name: "saturdayEnd", label: "Sábado saída", type: "text", span: 12 },
        { name: "sundayStart", label: "Domingo entrada", type: "text", span: 12 },
        { name: "sundayLunchOut", label: "Domingo saída almoço", type: "text", span: 12 },
        { name: "sundayLunchIn", label: "Domingo retorno almoço", type: "text", span: 12 },
        { name: "sundayEnd", label: "Domingo saída", type: "text", span: 12 },
        { name: "scheduleNotes", label: "Observações da escala", type: "textarea", span: 12 },
      ],
    },
    {
      id: "ferias",
      title: "Férias",
      description: "Período aquisitivo, gozo e abono.",
      fields: [
        { name: "accrualStart", label: "Período aquisitivo início", type: "date", span: 4 },
        { name: "accrualEnd", label: "Período aquisitivo fim", type: "date", span: 4 },
        { name: "vacationDays", label: "Dias de direito", type: "number", span: 4 },
        { name: "cashBonus", label: "Abono pecuniário", type: "radio", options: yesNoOptions, span: 4 },
        { name: "vacationStart", label: "Início das férias", type: "date", span: 4 },
        { name: "vacationEnd", label: "Final das férias", type: "date", span: 4 },
        { name: "bonusStart", label: "Início do abono", type: "date", span: 4 },
        { name: "bonusEnd", label: "Final do abono", type: "date", span: 4 },
      ],
    },
    {
      id: "rescisao",
      title: "Rescisão",
      description: "Motivo, aviso prévio e observações do desligamento.",
      fields: [
        {
          name: "terminationCause",
          label: "Causa da demissão",
          type: "select",
          options: [
            { label: "Selecione", value: "" },
            { label: "Pedido de demissão", value: "pedido" },
            { label: "Dispensa sem justa causa", value: "sem_justa_causa" },
            { label: "Dispensa com justa causa", value: "justa_causa" },
            { label: "Mútuo acordo", value: "acordo" },
            { label: "Término de contrato", value: "termino" },
          ],
          span: 6,
        },
        { name: "noticeWorked", label: "Aviso prévio trabalhado", type: "radio", options: yesNoOptions, span: 6 },
        { name: "terminationDate", label: "Data da demissão", type: "date", span: 4 },
        { name: "noticeDate", label: "Data do aviso", type: "date", span: 4 },
        { name: "noticeDays", label: "Quantidade de dias de aviso", type: "number", span: 4 },
        { name: "terminationReason", label: "Motivo da rescisão", type: "textarea", span: 12 },
        { name: "reductionTwoHours", label: "Redução de 2 horas", type: "radio", options: yesNoOptions, span: 4 },
        { name: "reductionSevenDays", label: "Redução de 7 dias", type: "radio", options: yesNoOptions, span: 4 },
        { name: "waiveNoticeDiscount", label: "Dispensa desconto aviso", type: "radio", options: yesNoOptions, span: 4 },
        { name: "terminationNotes", label: "Observações", type: "textarea", span: 12 },
      ],
    },
    {
      id: "controle",
      title: "Controle interno",
      description: "Campos de acompanhamento operacional.",
      fields: [
        { name: "executionDate", label: "Data de execução", type: "date", span: 4 },
        { name: "releaseDate", label: "Data de liberação", type: "date", span: 4 },
        { name: "requestDate", label: "Data de solicitação", type: "date", span: 4 },
        { name: "internalNotes", label: "Observações internas", type: "textarea", span: 12 },
      ],
    },
  ],
};

export const admissaoSchema = fieldsToSchema(
  admissaoFormDefinition.sections.flatMap((section) => section.fields),
);
export const movimentacoesSchema = fieldsToSchema(
  movimentacoesFormDefinition.sections.flatMap((section) => section.fields),
);

export function getInitialValues(definition: FormDefinition) {
  const values: Record<string, string | boolean> = {};

  for (const section of definition.sections) {
    for (const field of section.fields) {
      values[field.name] = field.type === "checkbox" ? false : "";
    }
  }

  return values;
}
