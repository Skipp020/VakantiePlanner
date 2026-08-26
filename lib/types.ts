export type LeaveStatus = 1 | 2; // 1 = optie, 2 = bevestigd

export type MemberRow = {
  id: string;
  name: string;
  hours_per_week: number;
  working_days: number[]; // 1=ma .. 5=vr
};

export type LeaveMap = Record<string, LeaveStatus>; // key: `${memberId}__${dateISO}`

export function leaveKey(memberId: string, dateISO: string) {
  return `${memberId}__${dateISO}`;
}
