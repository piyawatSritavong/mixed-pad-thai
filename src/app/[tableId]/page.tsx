import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import CustomerApp from "./CustomerApp";

export default async function TablePage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;

  const table = await queryOne<{ table_number: string }>(
    "SELECT table_number FROM restaurant_tables WHERE table_number = $1 AND is_active = TRUE",
    [tableId]
  ).catch(() => null);

  if (!table) notFound();

  return <CustomerApp tableId={tableId} />;
}
