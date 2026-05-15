const maxSubmissionPayloadBytes = 200 * 1024;
const maxSubmissionPayloadDepth = 8;
const maxSubmissionPayloadEntries = 500;

type ValidationState = {
  entries: number;
};

function validateNode(value: unknown, depth: number, state: ValidationState) {
  if (depth > maxSubmissionPayloadDepth) {
    throw new Error(`O formulario excede a profundidade maxima permitida de ${maxSubmissionPayloadDepth} niveis.`);
  }

  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    state.entries += value.length;
    if (state.entries > maxSubmissionPayloadEntries) {
      throw new Error(`O formulario excede o limite de ${maxSubmissionPayloadEntries} campos/itens.`);
    }

    for (const item of value) {
      validateNode(item, depth + 1, state);
    }
    return;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    state.entries += entries.length;
    if (state.entries > maxSubmissionPayloadEntries) {
      throw new Error(`O formulario excede o limite de ${maxSubmissionPayloadEntries} campos/itens.`);
    }

    for (const [, nestedValue] of entries) {
      validateNode(nestedValue, depth + 1, state);
    }
  }
}

export function parseAndValidateSubmissionRequestBody(rawBody: string) {
  const bodySize = Buffer.byteLength(rawBody, "utf-8");
  if (bodySize > maxSubmissionPayloadBytes) {
    throw new Error(`O formulario excede o tamanho maximo permitido de ${Math.floor(maxSubmissionPayloadBytes / 1024)} KB.`);
  }

  const parsed = JSON.parse(rawBody) as unknown;
  validateNode(parsed, 1, { entries: 0 });

  return parsed;
}
