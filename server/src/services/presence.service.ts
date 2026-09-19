const onlineUserIds = new Set<string>();

export function addOnlineUser(userId: string): number {
  onlineUserIds.add(userId);
  return onlineUserIds.size;
}

export function removeOnlineUser(userId: string): number {
  onlineUserIds.delete(userId);
  return onlineUserIds.size;
}

export function getOnlineUserCount(): number {
  return onlineUserIds.size;
}
