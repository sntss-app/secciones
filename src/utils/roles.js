/**
 * Guarda la sesión del usuario en el almacenamiento especificado
 * @param {Storage} storage - localStorage o sessionStorage
 * @param {Object} usuario - Datos del usuario desde la API
 */
export const storeUserSession = (storage, usuario) => {
    storage.setItem('matricula', usuario.matricula || '');
    storage.setItem('nombre', usuario.nombre || '');
    storage.setItem('correo', usuario.correo || '');
    storage.setItem('roleIds', JSON.stringify(usuario.roleIds || []));
    storage.setItem('roleNames', JSON.stringify(usuario.roleNames || []));
    
    if (usuario.foto_path) {
        storage.setItem('foto', usuario.foto_path);
    }
};

/**
 * Obtiene los roles del usuario desde localStorage
 * @returns {Array} Array de objetos con id y name
 */
export const getStoredRoles = () => {
    try {
        const roleNames = JSON.parse(localStorage.getItem('roleNames')) || [];
        const roleIds = JSON.parse(localStorage.getItem('roleIds')) || [];
        return roleNames.map((name, index) => ({
            id: roleIds[index] || null,
            name: name
        }));
    } catch (e) {
        return [];
    }
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {number|string} roleId - ID del rol (opcional)
 * @param {string} roleName - Nombre del rol (opcional)
 * @returns {boolean}
 */
export const hasStoredRole = (roleId, roleName) => {
    try {
        const roles = getStoredRoles();
        if (roleName) {
            return roles.some(r => r.name === roleName);
        }
        return roles.some(r => r.id === roleId);
    } catch (e) {
        return false;
    }
};

/**
 * Obtiene los IDs de los roles del usuario
 * @returns {Array} Array de IDs
 */
export const getStoredRoleIds = () => {
    try {
        return JSON.parse(localStorage.getItem('roleIds')) || [];
    } catch (e) {
        return [];
    }
};

/**
 * Obtiene los nombres de los roles del usuario
 * @returns {Array} Array de nombres
 */
export const getStoredRoleNames = () => {
    try {
        return JSON.parse(localStorage.getItem('roleNames')) || [];
    } catch (e) {
        return [];
    }
};

/**
 * Limpia la sesión del usuario
 */
export const clearUserSession = () => {
    localStorage.removeItem('matricula');
    localStorage.removeItem('nombre');
    localStorage.removeItem('correo');
    localStorage.removeItem('roleIds');
    localStorage.removeItem('roleNames');
    localStorage.removeItem('foto');
    sessionStorage.clear();
};
/**
 * Parsea los IDs de roles desde diferentes formatos
 * @param {string|array|number|object} roleIds - IDs en diferentes formatos
 * @returns {array} Array de IDs de roles (números)
 */
export const parseRoleIds = (roleIds) => {
  if (!roleIds) return [];
  
  // Si es array
  if (Array.isArray(roleIds)) {
    // Si contiene objetos con propiedad id
    if (roleIds.length > 0 && typeof roleIds[0] === 'object' && roleIds[0].id !== undefined) {
      return roleIds.map(item => Number(item.id)).filter(id => !isNaN(id));
    }
    // Si contiene números o strings
    return roleIds.map(id => Number(id)).filter(id => !isNaN(id));
  }
  
  // Si es un objeto con propiedad id
  if (typeof roleIds === 'object' && roleIds !== null && roleIds.id !== undefined) {
    return [Number(roleIds.id)].filter(id => !isNaN(id));
  }
  
  // Si es string separado por comas
  if (typeof roleIds === 'string') {
    if (roleIds.trim() === '') return [];
    return roleIds.split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => Number(id))
      .filter(id => !isNaN(id));
  }
  
  // Si es número
  if (typeof roleIds === 'number' && !isNaN(roleIds)) {
    return [roleIds];
  }
  
  return [];
};