import type { NotificationRecord } from '../../shared/notification-center'

export type NotificationTab = 'All' | 'Unread' | 'Failed' | 'Oracle'
export interface NotificationGroup { key: string; latest: NotificationRecord; records: NotificationRecord[] }

export function notificationGroups(records: readonly NotificationRecord[], tab: NotificationTab, search: string): NotificationGroup[] {
  const query = search.trim().toLocaleLowerCase()
  const groups = new Map<string, NotificationGroup>()
  for (const record of [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    if (record.dismissedAt || (tab === 'Unread' && record.readAt) ||
      (tab === 'Failed' && record.severity !== 'error') ||
      (tab === 'Oracle' && record.kind !== 'oracle.message') ||
      (query && !`${record.title} ${record.body}`.toLocaleLowerCase().includes(query))) continue
    const key = record.sessionId ? JSON.stringify([record.computerId, record.sessionId]) : record.coalesceKey || record.id
    const group = groups.get(key)
    if (group) group.records.push(record)
    else groups.set(key, { key, latest: record, records: [record] })
  }
  return [...groups.values()]
}
