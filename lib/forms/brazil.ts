import type { FormOption } from "@/lib/forms/types";

export const brazilUfOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "AC", value: "AC" },
  { label: "AL", value: "AL" },
  { label: "AP", value: "AP" },
  { label: "AM", value: "AM" },
  { label: "BA", value: "BA" },
  { label: "CE", value: "CE" },
  { label: "DF", value: "DF" },
  { label: "ES", value: "ES" },
  { label: "GO", value: "GO" },
  { label: "MA", value: "MA" },
  { label: "MT", value: "MT" },
  { label: "MS", value: "MS" },
  { label: "MG", value: "MG" },
  { label: "PA", value: "PA" },
  { label: "PB", value: "PB" },
  { label: "PR", value: "PR" },
  { label: "PE", value: "PE" },
  { label: "PI", value: "PI" },
  { label: "RJ", value: "RJ" },
  { label: "RN", value: "RN" },
  { label: "RS", value: "RS" },
  { label: "RO", value: "RO" },
  { label: "RR", value: "RR" },
  { label: "SC", value: "SC" },
  { label: "SP", value: "SP" },
  { label: "SE", value: "SE" },
  { label: "TO", value: "TO" },
];

export const educationOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "Sem instrução", value: "sem_instrucao" },
  { label: "Ensino fundamental incompleto", value: "fundamental_incompleto" },
  { label: "Ensino fundamental completo", value: "fundamental_completo" },
  { label: "Ensino médio incompleto", value: "medio_incompleto" },
  { label: "Ensino médio completo", value: "medio_completo" },
  { label: "Ensino técnico", value: "tecnico" },
  { label: "Ensino superior incompleto", value: "superior_incompleto" },
  { label: "Ensino superior completo", value: "superior_completo" },
  { label: "Especialização", value: "especializacao" },
  { label: "Mestrado", value: "mestrado" },
  { label: "Doutorado", value: "doutorado" },
  { label: "Pós-doutorado", value: "pos_doutorado" },
];

export const raceOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "Pardo", value: "pardo" },
  { label: "Branco", value: "branco" },
  { label: "Preto", value: "preto" },
  { label: "Indígena", value: "indigena" },
  { label: "Amarelo", value: "amarelo" },
];

export const maritalStatusOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "Solteiro(a)", value: "solteiro" },
  { label: "Casado(a)", value: "casado" },
  { label: "União estável", value: "uniao_estavel" },
  { label: "Divorciado(a)", value: "divorciado" },
  { label: "Separado(a)", value: "separado" },
  { label: "Viúvo(a)", value: "viuvo" },
];

export const cnhCategoryOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "AB", value: "AB" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "ACC", value: "ACC" },
];

export const streetTypeOptions: FormOption[] = [
  { label: "Selecione", value: "" },
  { label: "Rua", value: "Rua" },
  { label: "Avenida", value: "Avenida" },
  { label: "Travessa", value: "Travessa" },
  { label: "Alameda", value: "Alameda" },
  { label: "Rodovia", value: "Rodovia" },
  { label: "Praça", value: "Praca" },
  { label: "Loteamento", value: "Loteamento" },
  { label: "Viela", value: "Viela" },
  { label: "Outros", value: "Outros" },
];

export const weekdays = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

export const scheduleColumns = [
  { key: "start", label: "Entrada" },
  { key: "lunchOut", label: "Saída almoço" },
  { key: "lunchIn", label: "Retorno almoço" },
  { key: "end", label: "Saída" },
];
