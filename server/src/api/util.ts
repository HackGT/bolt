import moment from "moment";

/**
 * Return null if user is not an admin
 * @param val
 * @param isAdmin
 */
export function onlyIfAdmin(val: any, isAdmin: boolean) {
  return isAdmin ? val : null;
}

export function localTimestamp(createdAt: string): string {
  return moment(createdAt).toISOString(true);
}
