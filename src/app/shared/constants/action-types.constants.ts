export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export const ACTION_ICONS = {
  [ActionType.CREATE]: 'fa-solid fa-plus',
  [ActionType.READ]: 'fa-solid fa-eye',
  [ActionType.UPDATE]: 'fa-regular fa-pen-to-square',
  [ActionType.DELETE]: 'fa-regular fa-trash-can'
};

export const ACTION_COLORS = {
  [ActionType.CREATE]: 'success',
  [ActionType.READ]: 'info',
  [ActionType.UPDATE]: 'info',
  [ActionType.DELETE]: 'danger'
}; 