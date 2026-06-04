import { adminModules, seedRolePermissions } from '../mock/seedData.js';
import storageService from './storageService.js';

const roleLabels = {
  admin: '管理员',
  operator: '运营',
  customer: '前台用户',
};

const adminSafeguards = ['dashboard', 'roles'];
const knownModuleKeys = adminModules.map((module) => module.key);

function uniqueKnownModules(moduleNames) {
  return [...new Set(moduleNames)].filter((moduleName) => knownModuleKeys.includes(moduleName));
}

function normalizePermissions(permissions) {
  const merged = {
    ...seedRolePermissions,
    ...(permissions || {}),
  };

  return Object.fromEntries(
    Object.entries(merged).map(([role, moduleNames]) => {
      const baseModules = Array.isArray(moduleNames) ? moduleNames : [];
      // Keep the administrator able to see the dashboard and recover permission
      // settings even after an aggressive role edit.
      const safeguardedModules = role === 'admin' ? [...baseModules, ...adminSafeguards] : baseModules;
      return [role, uniqueKnownModules(safeguardedModules)];
    }),
  );
}

/**
 * Provides role-to-module permission configuration for the admin console.
 *
 * Permissions are persisted in localStorage so the "角色管理" page is genuinely
 * configurable. Every write is normalized to known module keys and then guarded
 * with administrator recovery permissions.
 */
export function createPermissionService(storage = storageService) {
  function getPermissions() {
    const permissions = normalizePermissions(storage.read(storage.keys.rolePermissions, seedRolePermissions));
    storage.write(storage.keys.rolePermissions, permissions);
    return permissions;
  }

  return {
    getModules() {
      return adminModules;
    },
    getRolePermissions() {
      return getPermissions();
    },
    canAccess(role, moduleName) {
      return Boolean(getPermissions()[role]?.includes(moduleName));
    },
    updateRolePermissions(role, moduleNames) {
      const permissions = getPermissions();
      const nextPermissions = normalizePermissions({
        ...permissions,
        [role]: moduleNames,
      });
      storage.write(storage.keys.rolePermissions, nextPermissions);
      return nextPermissions;
    },
    resetRolePermissions() {
      const permissions = normalizePermissions(seedRolePermissions);
      storage.write(storage.keys.rolePermissions, permissions);
      return permissions;
    },
  };
}

const permissionService = createPermissionService();

export const rolePermissions = seedRolePermissions;
export const modules = adminModules;

export function canAccess(role, moduleName) {
  return permissionService.canAccess(role, moduleName);
}

export function getRolePermissions() {
  return permissionService.getRolePermissions();
}

export function getAdminModules() {
  return permissionService.getModules();
}

export function updateRolePermissions(role, moduleNames) {
  return permissionService.updateRolePermissions(role, moduleNames);
}

export function resetRolePermissions() {
  return permissionService.resetRolePermissions();
}

export function getRoleLabel(role) {
  return roleLabels[role] || role;
}

export default permissionService;
