import { listAll, getSettings } from "@/lib/data";
import { ResourceTable } from "./ResourceTable";
import { createResource } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [resources, settings] = await Promise.all([listAll(), getSettings()]);
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] font-extrabold">משאבים</h1>
        <form action={createResource}>
          <button className="btn-primary">+ משאב חדש</button>
        </form>
      </div>
      <ResourceTable resources={resources} categories={settings.categories} />
    </div>
  );
}
