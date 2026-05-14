"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { scheduleColumns, weekdays } from "@/lib/forms/brazil";
import { admissaoSchema, movimentacoesSchema } from "@/lib/forms/config";
import type { FormDefinition, FormField, FormOption } from "@/lib/forms/types";
import { cn } from "@/lib/utils";

type DynamicFormProps = {
  definition: FormDefinition;
  defaultValues: Record<string, string | boolean>;
};

type SubmissionState = {
  kind: "idle" | "success" | "error";
  message: string;
};

type CityOptionsByField = Record<string, FormOption[]>;

const dependentRows = [1, 2, 3, 4, 5];

function spanClass(span: FormField["span"]) {
  switch (span) {
    case 2:
      return "field-col-span-2";
    case 3:
      return "field-col-span-3";
    case 4:
      return "field-col-span-4";
    case 6:
      return "field-col-span-6";
    case 8:
      return "field-col-span-8";
    default:
      return "field-col-span-12";
  }
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCurrency(value: string) {
  const digits = digitsOnly(value);
  const amount = Number(digits || "0") / 100;

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function applyMask(value: string, mask?: FormField["mask"]) {
  switch (mask) {
    case "cpf":
      return formatCpf(value);
    case "phone":
      return formatPhone(value);
    case "cep":
      return formatCep(value);
    case "currency":
      return formatCurrency(value);
    case "digits":
      return digitsOnly(value);
    default:
      return value;
  }
}

function getFieldType(field: FormField) {
  if (field.type === "email") {
    return "email";
  }

  if (field.type === "number") {
    return "number";
  }

  if (field.type === "date") {
    return "date";
  }

  return "text";
}

function getScheduleFieldName(dayId: string, columnKey: string) {
  return `${dayId}${columnKey.charAt(0).toUpperCase()}${columnKey.slice(1)}`;
}

export function DynamicForm({ definition, defaultValues }: DynamicFormProps) {
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState<string>("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    kind: "idle",
    message: "Preencha os campos e salve quando quiser.",
  });
  const [cityOptionsByField, setCityOptionsByField] = useState<CityOptionsByField>({});
  const [toastVisible, setToastVisible] = useState(false);

  const schema = definition.flowType === "admissao" ? admissaoSchema : movimentacoesSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchedValues = useWatch({ control });
  const values = useMemo(
    () => ((watchedValues || {}) as Record<string, string | boolean>),
    [watchedValues],
  );
  const dependentsCount = Number(values.dependentsCount || 0);
  const birthStateValue = String(values.birthState || "");
  const addressStateValue = String(values.state || "");
  const streetTypeValue = String(values.streetType || "");

  const sectionList = useMemo(
    () =>
      definition.sections.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    [definition.sections],
  );

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timer = window.setTimeout(() => setToastVisible(false), 3800);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  useEffect(() => {
    if (dependentsCount > 0) {
      return;
    }

    dependentRows.forEach((row) => {
      ["Name", "BirthDate", "Cpf"].forEach((suffix) => {
        const fieldName = `dependent${row}${suffix}`;
        if (values[fieldName]) {
          setValue(fieldName, "", { shouldDirty: true });
        }
      });
    });
  }, [dependentsCount, setValue, values]);

  useEffect(() => {
    const fieldsWithCities = definition.sections
      .flatMap((section) => section.fields)
      .filter((field) => field.autoComplete === "city" && field.dependsOn);

    fieldsWithCities.forEach((field) => {
      const selectedUf =
        field.dependsOn === "birthState" ? birthStateValue : addressStateValue;

      if (!selectedUf) {
        setCityOptionsByField((current) => ({
          ...current,
          [field.name]: [{ label: "Selecione a UF primeiro", value: "" }],
        }));
        setValue(field.name, "");
        return;
      }

      const controller = new AbortController();

      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`,
        { signal: controller.signal },
      )
        .then((response) => response.json())
        .then((items: Array<{ nome: string }>) => {
          const options = [
            { label: "Selecione", value: "" },
            ...items.map((item) => ({ label: item.nome, value: item.nome })),
          ];

          setCityOptionsByField((current) => ({
            ...current,
            [field.name]: options,
          }));
        })
        .catch(() => {
          setCityOptionsByField((current) => ({
            ...current,
            [field.name]: [{ label: "Não foi possível carregar os municípios", value: "" }],
          }));
        });

      return () => controller.abort();
    });
  }, [addressStateValue, birthStateValue, definition.sections, setValue]);

  const autoCompleteAddressFromCep = useCallback(
    async (rawCep: string) => {
      const cep = digitsOnly(rawCep);
      if (cep.length !== 8) {
        return;
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          return;
        }

        if (data.logradouro) {
          setValue("addressLine", data.logradouro, { shouldDirty: true });
        }
        if (data.complemento) {
          setValue("addressComplement", data.complemento, { shouldDirty: true });
        }
        if (data.bairro) {
          setValue("neighborhood", data.bairro, { shouldDirty: true });
        }
        if (data.uf) {
          setValue("state", data.uf, { shouldDirty: true });
        }
        if (data.localidade) {
          setValue("city", data.localidade, { shouldDirty: true });
        }
        if (data.logradouro && !streetTypeValue) {
          const detectedType = String(data.logradouro).split(" ")[0];
          setValue("streetType", detectedType, { shouldDirty: true });
        }
      } catch {
        // O preenchimento manual continua disponível se a busca falhar.
      }
    },
    [setValue, streetTypeValue],
  );

  async function submitForm(valuesToSubmit: Record<string, unknown>, status: "draft" | "submitted") {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: submissionId || undefined,
        flowType: definition.flowType,
        status,
        payload: valuesToSubmit,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Não foi possível salvar o formulário. Revise os campos preenchidos e tente novamente.",
      );
    }

    setSubmissionId(data.id);
    return data.id;
  }

  function renderScheduleTable() {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-medium">Dia</th>
              {scheduleColumns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekdays.map((day) => (
              <tr key={day.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{day.label}</td>
                {scheduleColumns.map((column) => {
                  const fieldName = getScheduleFieldName(day.id, column.key);
                  return (
                    <td key={fieldName} className="px-4 py-3">
                      <input placeholder="00:00" {...register(fieldName)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDependentsTable() {
    const disabled = dependentsCount <= 0;

    return (
      <div className="space-y-4">
        <div className="field-grid">
          <div className="field-col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="dependentsCount">
              Quantidade de dependentes
            </label>
            <input id="dependentsCount" type="number" min="0" {...register("dependentsCount")} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Dependente</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Nome</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Nascimento</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">CPF</th>
              </tr>
            </thead>
            <tbody>
              {dependentRows.map((row) => (
                <tr
                  key={row}
                  className={cn(
                    "border-b border-slate-100",
                    disabled ? "bg-slate-100/90 text-slate-400" : "bg-white",
                  )}
                >
                  <td className="px-4 py-3 font-medium">Dependente {row}</td>
                  <td className="px-4 py-3">
                    <input
                      disabled={disabled}
                      placeholder="Nome completo"
                      {...register(`dependent${row}Name`)}
                      className={cn(disabled && "bg-slate-100 text-slate-400")}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      disabled={disabled}
                      type="date"
                      {...register(`dependent${row}BirthDate`)}
                      className={cn(disabled && "bg-slate-100 text-slate-400")}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      disabled={disabled}
                      placeholder="000.000.000-00"
                      {...register(`dependent${row}Cpf`, {
                        onChange: (event) => {
                          setValue(`dependent${row}Cpf`, formatCpf(event.target.value), {
                            shouldDirty: true,
                          });
                        },
                      })}
                      className={cn(disabled && "bg-slate-100 text-slate-400")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "fixed right-5 top-20 z-[60] w-full max-w-sm rounded-2xl border px-5 py-4 shadow-lg transition-all duration-300",
          toastVisible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none",
          submissionState.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : submissionState.kind === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-slate-200 bg-white text-slate-700",
        )}
      >
        <p className="font-semibold">
          {submissionState.kind === "success"
            ? "Tudo certo"
            : submissionState.kind === "error"
              ? "Algo deu errado"
              : "Aviso"}
        </p>
        <p className="mt-1 text-sm leading-6">{submissionState.message}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Etapas do fluxo
          </p>
          <div className="mt-5 space-y-3">
            {sectionList.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-900">
                  {index + 1}
                </span>
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </aside>

        <form
          className="space-y-6"
          onSubmit={handleSubmit(async (formValues) => {
            try {
              await submitForm(formValues, "submitted");
              setSubmissionState({
                kind: "success",
                message: "Formulário concluído com sucesso. Você será redirecionado para a tela inicial.",
              });
              setToastVisible(true);
              window.setTimeout(() => {
                router.push("/");
                router.refresh();
              }, 1200);
            } catch (error) {
              setSubmissionState({
                kind: "error",
                message:
                  error instanceof Error
                    ? `${error.message} Se o problema continuar, revise os campos obrigatórios, confirme sua conexão e tente novamente.`
                    : "Não foi possível concluir o envio. Revise os campos e tente novamente.",
              });
              setToastVisible(true);
            }
          })}
        >
          <div className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Fluxo principal
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {definition.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{definition.subtitle}</p>
            <div
              className={cn(
                "mt-6 rounded-2xl border px-4 py-3 text-sm",
                submissionState.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : submissionState.kind === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              {submissionState.message}
            </div>
          </div>

          {definition.sections.map((section) => {
            const regularFields =
              section.id === "escala"
                ? section.fields.filter(
                    (field) =>
                      !field.name.endsWith("Start") &&
                      !field.name.endsWith("LunchOut") &&
                      !field.name.endsWith("LunchIn") &&
                      !field.name.endsWith("End"),
                  )
                : section.id === "dependentes"
                  ? section.fields.filter(
                      (field) => !field.name.startsWith("dependent") && field.name !== "dependentsCount",
                    )
                  : section.fields;

            return (
              <section key={section.id} id={section.id} className="card section-card p-8">
                <div className="border-b border-slate-200 pb-5">
                  <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                </div>

                {section.id === "escala" ? (
                  <div className="mt-6 space-y-6">
                    {renderScheduleTable()}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="scheduleNotes">
                        Observações da escala
                      </label>
                      <textarea id="scheduleNotes" {...register("scheduleNotes")} />
                    </div>
                  </div>
                ) : section.id === "dependentes" ? (
                  <div className="mt-6 space-y-6">
                    {renderDependentsTable()}
                    <div className="field-grid">
                      {regularFields.map((field) => {
                          const error = errors[field.name];
                          return (
                            <div key={field.name} className={spanClass(field.span)}>
                              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={field.name}>
                                {field.label}
                              </label>
                              {field.type === "textarea" ? (
                                <textarea id={field.name} {...register(field.name)} />
                              ) : (
                                <input id={field.name} type={getFieldType(field)} {...register(field.name)} />
                              )}
                              {error ? (
                                <p className="mt-2 text-sm text-rose-600">
                                  {String(error.message || "Campo inválido")}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="field-grid mt-6">
                    {regularFields.map((field) => {
                      const error = errors[field.name];
                      const dynamicOptions =
                        field.autoComplete === "city"
                          ? cityOptionsByField[field.name] || field.options
                          : field.options;
                      const isDisabled = Boolean(
                        field.disabledWhenZero && Number(values[field.disabledWhenZero] || 0) <= 0,
                      );

                      return (
                        <div key={field.name} className={spanClass(field.span)}>
                          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={field.name}>
                            {field.label}
                            {field.required ? " *" : ""}
                          </label>

                          {field.type === "textarea" ? (
                            <textarea
                              id={field.name}
                              disabled={isDisabled}
                              placeholder={field.placeholder}
                              {...register(field.name)}
                            />
                          ) : null}

                          {field.type === "text" ||
                          field.type === "date" ||
                          field.type === "email" ||
                          field.type === "number" ? (
                            <input
                              id={field.name}
                              type={getFieldType(field)}
                              disabled={isDisabled}
                              inputMode={field.mask === "digits" ? "numeric" : undefined}
                              placeholder={field.placeholder}
                              {...register(field.name, {
                                onChange: async (event) => {
                                  const masked = applyMask(event.target.value, field.mask);
                                  setValue(field.name, masked, { shouldDirty: true });

                                  if (field.autoComplete === "cep") {
                                    await autoCompleteAddressFromCep(masked);
                                  }
                                },
                              })}
                            />
                          ) : null}

                          {field.type === "select" ? (
                            <select id={field.name} disabled={isDisabled} {...register(field.name)}>
                              {dynamicOptions?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : null}

                          {field.type === "radio" ? (
                            <div className="flex flex-wrap gap-3">
                              {field.options?.map((option) => (
                                <label
                                  key={option.value}
                                  className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
                                >
                                  <input
                                    type="radio"
                                    value={option.value}
                                    disabled={isDisabled}
                                    {...register(field.name)}
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : null}

                          {field.type === "checkbox" ? (
                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                              <input id={field.name} type="checkbox" disabled={isDisabled} {...register(field.name)} />
                              <span>{field.label}</span>
                            </label>
                          ) : null}

                          {error ? (
                            <p className="mt-2 text-sm text-rose-600">
                              {String(error.message || "Campo inválido")}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          <div className="sticky bottom-4 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                reset(defaultValues);
                setSubmissionId("");
                setSubmissionState({
                  kind: "idle",
                  message: "Formulário limpo. Você pode preencher novamente.",
                });
              }}
              type="button"
            >
              Limpar
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                disabled={isSubmitting}
                onClick={handleSubmit(async (formValues) => {
                  try {
                    await submitForm(formValues, "draft");
                    setSubmissionState({
                      kind: "success",
                      message: "Rascunho salvo com sucesso.",
                    });
                    setToastVisible(true);
                  } catch (error) {
                    setSubmissionState({
                      kind: "error",
                      message:
                        error instanceof Error
                          ? `${error.message} Se o problema continuar, confirme sua conexão e tente novamente.`
                          : "Não foi possível salvar o rascunho.",
                    });
                    setToastVisible(true);
                  }
                })}
                type="button"
              >
                {isSubmitting ? "Salvando..." : "Salvar rascunho"}
              </button>

              <button
                className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Enviando..." : "Salvar e enviar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
