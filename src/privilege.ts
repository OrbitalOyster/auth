const getUsers = 2;
const addUsersP = 3;
const editUsersP = 5;
const removeUsersP = 7;

export function allowedToGetUsers(p: number): boolean {
  return !!p && !(p % getUsers);
}

export function allowedToAddUsers(p: number): boolean {
  return !!p && !(p % addUsersP);
}

export function allowedToEditUsers(p: number): boolean {
  return !!p && !(p % editUsersP);
}

export function allowedToRemoveUsers(p: number): boolean {
  return !!p && !(p % removeUsersP);
}
