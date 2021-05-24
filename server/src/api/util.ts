import moment from "moment";

/**
 * Return null if user is not an admin
 */
export function onlyIfAdmin(val: any, isAdmin: boolean) {
  return isAdmin ? val : null;
}

export function localTimestamp(createdAt: Date): string {
  return moment(createdAt).toISOString(true);
}
