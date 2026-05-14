export type FlowType = "admissao" | "movimentacoes";

export type FormOption = {
  label: string;
  value: string;
};

export type FormField = {
  name: string;
  label: string;
  type:
    | "text"
    | "date"
    | "select"
    | "textarea"
    | "radio"
    | "checkbox"
    | "email"
    | "number";
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
  span?: 2 | 3 | 4 | 6 | 8 | 12;
  mask?: "cpf" | "phone" | "cep" | "currency" | "digits";
  dependsOn?: string;
  autoComplete?: "city" | "cep";
  disabledWhenZero?: string;
};

export type FormSection = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
};

export type FormDefinition = {
  flowType: FlowType;
  title: string;
  subtitle: string;
  sections: FormSection[];
};
