import { PDFDocument, StandardFonts } from "pdf-lib";
import * as XLSX from "xlsx";

import {
  admissaoFormDefinition,
  movimentacoesFormDefinition,
} from "@/lib/forms/config";
import type { SubmissionRecord } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

const definitionsByFlow = {
  admissao: admissaoFormDefinition,
  movimentacoes: movimentacoesFormDefinition,
} as const;

type FlowKey = keyof typeof definitionsByFlow;

function getFlowLabel(flowType: SubmissionRecord["flowType"]) {
  return flowType === "admissao" ? "Admissao" : "Movimentacoes";
}

function getDefinition(flowType: SubmissionRecord["flowType"]) {
  const normalizedFlow = flowType === "admissao" ? "admissao" : "movimentacoes";
  return definitionsByFlow[normalizedFlow as FlowKey];
}

function stringifyValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Sim" : "Nao";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function escapeSpreadsheetFormula(value: string) {
  const trimmed = value.trimStart();
  if (!trimmed) {
    return value;
  }

  const firstChar = trimmed.charAt(0);
  if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@") {
    return `'${value}`;
  }

  return value;
}

export function getExportRows(submission: SubmissionRecord) {
  const definition = getDefinition(submission.flowType);
  const rows: Array<[string, string, string]> = [
    ["Resumo", "Fluxo", getFlowLabel(submission.flowType)],
    ["Resumo", "Status", submission.status],
    ["Resumo", "Empregador", submission.employerName || "-"],
    ["Resumo", "Colaborador", submission.employeeName || "-"],
    ["Resumo", "Criado por", submission.createdByUserName || submission.createdByUserEmail || "-"],
    ["Resumo", "Atualizado em", formatDate(String(submission.updatedAt))],
  ];

  const seenFields = new Set<string>();

  for (const section of definition.sections) {
    for (const field of section.fields) {
      rows.push([
        section.title,
        field.label,
        escapeSpreadsheetFormula(stringifyValue(submission.payload[field.name])),
      ]);
      seenFields.add(field.name);
    }
  }

  for (const [key, value] of Object.entries(submission.payload)) {
    if (seenFields.has(key)) {
      continue;
    }

    rows.push(["Campos adicionais", key, escapeSpreadsheetFormula(stringifyValue(value))]);
  }

  return rows;
}

export function buildWorkbookBuffer(submission: SubmissionRecord) {
  const workbook = XLSX.utils.book_new();
  const rows = [["Secao", "Campo", "Valor"], ...getExportRows(submission)];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
}

export async function buildPdfBuffer(submission: SubmissionRecord) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const rows = getExportRows(submission);

  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;

  const writeLine = (text: string, bold = false) => {
    if (y < 60) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
    }

    page.drawText(text, {
      x: 40,
      y,
      size: bold ? 12 : 10,
      font: bold ? fontBold : font,
    });
    y -= bold ? 18 : 14;
  };

  writeLine(`RH Flow - ${getFlowLabel(submission.flowType)}`, true);
  writeLine(`Status: ${submission.status}`);
  writeLine(`Colaborador: ${submission.employeeName || "-"}`);
  writeLine(`Empregador: ${submission.employerName || "-"}`);
  writeLine(`Atualizado em: ${formatDate(String(submission.updatedAt))}`);
  y -= 8;

  let currentSection = "";
  for (const [section, label, value] of rows) {
    if (section !== currentSection) {
      currentSection = section;
      y -= 4;
      writeLine(section, true);
    }

    writeLine(`${label}: ${value}`);
  }

  return Buffer.from(await pdf.save());
}

export function getExportFileName(submission: SubmissionRecord, extension: "pdf" | "xlsx") {
  const slug = (submission.employeeName || submission.id)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${submission.flowType}-${slug || submission.id}.${extension}`;
}
