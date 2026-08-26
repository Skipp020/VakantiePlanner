export type LeaveStatus = 1 | 2; // 1 = optie, 2 = bevestigd

export type MemberRow = {
  id: string;
  name: string;
  total_days: number;
};

export type LeaveMap = Record<string, LeaveStatus>; // key: `${memberId}__${dateISO}`

export function leaveKey(memberId: string, dateISO: string) {
  return `${memberId}__${dateISO}`;
}
