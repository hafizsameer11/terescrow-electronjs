import type { ChatRow } from '@renderer/api/queries/admin.chat.queries'
import type { AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces'

function numId(v: string | number | undefined): number {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function chatRowToAgentData(row: ChatRow): AgentToCustomerChatData {
  const c = row.customer
  const a = row.agent
  return {
    id: numId(row.id),
    customer: {
      id: numId(c?.id),
      username: c?.username ?? '—',
      firstname: c?.firstname ?? '',
      lastname: c?.lastname ?? '',
      role: c?.role ?? 'customer',
      profilePicture: c?.profilePicture ?? '',
      country: c?.country ?? '',
    },
    recentMessage: row.recentMessage
      ? {
          id: numId(row.recentMessage.id),
          message: row.recentMessage.message ?? '',
          createdAt: row.recentMessage.createdAt ?? '',
        }
      : null,
    recentMessageTimestamp: row.recentMessage?.createdAt ?? null,
    chatStatus: row.chatStatus ?? 'pending',
    department: row.department
      ? {
          id: numId(row.department.id),
          title: row.department.title ?? '',
          Type: row.department.Type ?? '',
          niche: row.department.niche ?? '',
        }
      : { id: 0, title: '', Type: '', niche: '' },
    category: row.category
      ? {
          id: numId(row.category.id),
          title: row.category.title ?? '',
        }
      : undefined,
    messagesCount: 0,
    transactionsCount: row.transactionsCount ?? 0,
    transactions: (row.transactions || []).map((t) => ({
      id: numId(t.id),
      amount: t.amount ?? undefined,
      amountNaira: t.amountNaira ?? undefined,
    })),
    agent: {
      id: numId(a?.id),
      username: a?.username ?? '',
      firstname: a?.firstname ?? '',
      lastname: a?.lastname ?? '',
      role: a?.role ?? '',
      profilePicture: a?.profilePicture ?? '',
    },
    createdAt: row.createdAt ?? '',
  }
}
