import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";
import { Header } from "@/components/Header";
import { ConfigWarning } from "@/components/ConfigWarning";
import { PlannerGrid } from "@/components/PlannerGrid";
import { leaveKey, type LeaveMap, type MemberRow } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const member = await getCurrentMember();

  if (!member) {
    let members: { id: string; name: string }[] = [];
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("members")
        .select("id, name")
        .order("name");
      if (error) throw error;
      members = data ?? [];
    } catch {
      return <ConfigWarning />;
    }

    return <LoginForm members={members} />;
  }

  const parsedYear = Number(searchParams.year);
  const year = Number.isInteger(parsedYear) ? parsedYear : new Date().getFullYear();

  let members: MemberRow[] = [];
  const leave: LeaveMap = {};

  try {
    const supabase = createServiceClient();
    const [membersResult, leaveResult] = await Promise.all([
      supabase.from("members").select("id, name, total_days").order("name"),
      supabase
        .from("leave_days")
        .select("member_id, date, status")
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`),
    ]);

    if (membersResult.error) throw membersResult.error;
    if (leaveResult.error) throw leaveResult.error;

    members = membersResult.data ?? [];
    for (const row of leaveResult.data ?? []) {
      leave[leaveKey(row.member_id, row.date)] = row.status as 1 | 2;
    }
  } catch {
    return <ConfigWarning />;
  }

  return (
    <div className="mx-auto max-w-[1600px] p-4">
      <Header memberName={member.name} year={year} />
      <PlannerGrid
        key={year}
        year={year}
        members={members}
        initialLeave={leave}
        currentMemberId={member.id}
      />
    </div>
  );
}
