"use client";

import { useRef, useState } from "react";

import {
  allowedAttachmentExtensions,
  maxAttachmentsPerSubmission,
  maxFilesPerUpload,
} from "@/lib/attachment-policy";
import type { AttachmentRecord } from "@/lib/schema";
import { formatFileSize } from "@/lib/utils";

type AttachmentsDropzoneProps = {
  existingAttachments: AttachmentRecord[];
  onPendingFilesChange: (files: File[]) => void;
  pendingFiles: File[];
};

export function AttachmentsDropzone({
  existingAttachments,
  onPendingFilesChange,
  pendingFiles,
}: AttachmentsDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function appendFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const merged = [...pendingFiles];

    for (const file of files) {
      const alreadyIncluded = merged.some(
        (pendingFile) =>
          pendingFile.name === file.name &&
          pendingFile.size === file.size &&
          pendingFile.lastModified === file.lastModified,
      );

      if (!alreadyIncluded) {
        merged.push(file);
      }
    }

    onPendingFilesChange(merged);
  }

  return (
    <section className="card p-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-semibold text-slate-900">Documentos anexos</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Arraste arquivos para esta area ou clique para selecionar documentos de apoio. Cada arquivo pode ter ate 4 MB, com no maximo {maxFilesPerUpload} por envio e {maxAttachmentsPerSubmission} por relatorio.
        </p>
      </div>

      <div
        className={`mt-6 rounded-[1.75rem] border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-[var(--primary)] bg-slate-50"
            : "border-slate-300 bg-slate-50/80"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          appendFiles(Array.from(event.dataTransfer.files));
        }}
        role="button"
        tabIndex={0}
      >
        <p className="text-base font-semibold text-slate-900">Solte os arquivos aqui</p>
        <p className="mt-2 text-sm text-slate-600">
          Ou clique para escolher PDFs, imagens, DOC, DOCX, XLS e XLSX.
        </p>

        <input
          accept={allowedAttachmentExtensions.join(",")}
          ref={inputRef}
          className="hidden"
          multiple
          onChange={(event) => appendFiles(Array.from(event.target.files || []))}
          type="file"
        />
      </div>

      {pendingFiles.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Pendentes de upload
          </p>
          <div className="mt-4 space-y-3">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPendingFilesChange(
                      pendingFiles.filter((_, pendingIndex) => pendingIndex !== index),
                    );
                  }}
                  type="button"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {existingAttachments.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Ja anexados
          </p>
          <div className="mt-4 space-y-3">
            {existingAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{attachment.fileName}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(attachment.size)}</p>
                </div>
                <a
                  className="text-sm font-medium text-slate-900 transition hover:text-slate-700"
                  href={`/api/attachments/${attachment.id}`}
                >
                  Baixar
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
