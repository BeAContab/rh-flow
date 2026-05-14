import { redirect } from "next/navigation";

import { DynamicForm } from "@/components/dynamic-form";
import { listAttachmentsForSubmission } from "@/lib/attachments";
import { requireAdminSession } from "@/lib/auth";
import {
  admissaoFormDefinition,
  getInitialValues,
  movimentacoesFormDefinition,
} from "@/lib/forms/config";
import { getSubmissionById } from "@/lib/submissions";

type EditReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReportPage({ params }: EditReportPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) {
    redirect("/relatorios");
  }

  const definition =
    submission.flowType === "admissao"
      ? admissaoFormDefinition
      : movimentacoesFormDefinition;
  const initialValues = getInitialValues(definition);
  Object.assign(initialValues, submission.payload);
  const initialAttachments = await listAttachmentsForSubmission(id);

  return (
    <main className="container-page py-10">
      <DynamicForm
        definition={definition}
        defaultValues={initialValues}
        initialAttachments={initialAttachments}
        initialSubmissionId={submission.id}
      />
    </main>
  );
}
