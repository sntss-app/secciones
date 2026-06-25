export const parseRoleIds = (value) => {
    if (value === null || value === undefined) return [];

    return String(value)
        .split(/[,\s]+/)
        .map(role => role.trim())
        .filter(Boolean);
};

export const parseStoredJsonArray = (key) => {
    try {
        const value = localStorage.getItem(key);
        if (!value) return [];
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const hasStoredRole = (roleId, roleName) => {
    const normalizedName = String(roleName).toLowerCase();
    const roleIds = parseRoleIds(localStorage.getItem('idRol'));
    if (roleIds.includes(String(roleId))) return true;

    const roleNameValue = String(localStorage.getItem('roleName') || '').toLowerCase();
    if (roleNameValue === normalizedName) return true;

    const roleNames = parseStoredJsonArray('roleNames').map(name => String(name).toLowerCase());
    if (roleNames.includes(normalizedName)) return true;

    const roles = parseStoredJsonArray('roles');
    return roles.some(role => (
        String(role?.id) === String(roleId) ||
        String(role?.name || '').toLowerCase() === normalizedName
    ));
};

export const storeUserSession = (storage, usuario) => {
    storage.setItem('matricula', usuario.matricula || '');
    storage.setItem('nombre', usuario.nombre || '');
    storage.setItem('correo', usuario.correo || '');
    storage.setItem('idRol', usuario.idRol === null || usuario.idRol === undefined ? '' : String(usuario.idRol));
    storage.setItem('roleName', usuario.roleName || '');
    storage.setItem('roles', JSON.stringify(usuario.roles || []));
    storage.setItem('roleNames', JSON.stringify(usuario.roleNames || []));
};
