import { DynamicForm } from "@/components/dynamic-form";
import { requireSession } from "@/lib/auth";
import { admissaoFormDefinition, getInitialValues } from "@/lib/forms/config";

export default async function AdmissaoPage() {
  await requireSession();

  return (
    <main className="container-page py-10">
      <DynamicForm
        definition={admissaoFormDefinition}
        defaultValues={getInitialValues(admissaoFormDefinition)}
      />
    </main>
  );
}
