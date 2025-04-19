import axios from 'axios';

// Base API URL configuration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";

// Global Axios configuration for CORS and headers
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Cache storage
let usersCache = null;
let rolesCache = null;
let lastUsersFetch = 0;
let lastRolesFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class AuthService {
    constructor() {
        this.setupAxiosInterceptors();
    }

    setupAxiosInterceptors() {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    async login(usernameOrEmail, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/signin`, {
                usernameOrEmail,
                password
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                this.setupAxiosInterceptors();
                window.dispatchEvent(new Event('auth-change'));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw this.handleError(error);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        usersCache = null;
        rolesCache = null;
        lastUsersFetch = 0;
        lastRolesFetch = 0;
        this.setupAxiosInterceptors();
        window.dispatchEvent(new Event('auth-change'));
    }

    async register(formData) {
        try {
            const response = await axios.post(`${API_URL}/auth/signup`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        
        const normalizedRole = role.toUpperCase();
        return user.roles.some(userRole => 
            userRole.toUpperCase() === normalizedRole || 
            userRole.toUpperCase() === 'ROLE_SUPER_ADMIN'
        );
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user?.permissions?.includes(permission) || false;
    }

    // User Management
    async getAllUsers() {
        const now = Date.now();
        if (usersCache && (now - lastUsersFetch) < CACHE_DURATION) {
            return usersCache;
        }
        
        try {
            const response = await axios.get(`${API_URL}/users`);
            usersCache = response.data;
            lastUsersFetch = now;
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserById(id) {
        try {
            const response = await axios.get(`${API_URL}/users/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createUser(userData) {
        try {
            const response = await axios.post(`${API_URL}/users`, userData);
            usersCache = null; // Invalidate users cache
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateUser(id, userData) {
        try {
            const response = await axios.put(`${API_URL}/users/${id}`, userData);
            usersCache = null; // Invalidate users cache
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteUser(id) {
        try {
            await axios.delete(`${API_URL}/users/${id}`);
            usersCache = null; // Invalidate users cache
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Role Management
    async getAllRoles() {
        const now = Date.now();
        if (rolesCache && (now - lastRolesFetch) < CACHE_DURATION) {
            return rolesCache;
        }
        
        try {
            const response = await axios.get(`${API_URL}/roles`);
            rolesCache = response.data;
            lastRolesFetch = now;
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getRoleById(id) {
        try {
            const response = await axios.get(`${API_URL}/roles/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createRole(roleData) {
        try {
            const response = await axios.post(`${API_URL}/roles`, roleData);
            rolesCache = null; // Invalidate roles cache
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateRole(id, roleData) {
        try {
            const response = await axios.put(`${API_URL}/roles/${id}`, roleData);
            rolesCache = null; // Invalidate roles cache
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteRole(id) {
        try {
            await axios.delete(`${API_URL}/roles/${id}`);
            rolesCache = null; // Invalidate roles cache
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // User-Role Management
    async assignRoleToUser(userId, roleId) {
        try {
            await axios.post(`${API_URL}/roles/${roleId}/users/${userId}`);
            usersCache = null; // Invalidate users cache as user roles changed
            rolesCache = null; // Invalidate roles cache as role assignments changed
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async removeRoleFromUser(userId, roleId) {
        try {
            await axios.delete(`${API_URL}/roles/${roleId}/users/${userId}`);
            usersCache = null; // Invalidate users cache as user roles changed
            rolesCache = null; // Invalidate roles cache as role assignments changed
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateUserRole(userId, role) {
        try {
            const response = await axios.post(`${API_URL}/users/${userId}/roles`, {
                role: role
            });
            usersCache = null; // Invalidate users cache as user roles changed
            rolesCache = null; // Invalidate roles cache as role assignments changed
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            return error.response.data || 'An error occurred';
        } else if (error.request) {
            return 'Server is not responding. Please check your connection.';
        } else {
            return error.message;
        }
    }

    async createSuperAdmin(username, email, password) {
        const data = {
            username: username,
            email: email,
            password: password,
            firstName: "",
            lastName: ""
        };
        
        return axios.post(`${API_URL}/users/superuser`, data);
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await axios.post(`${API_URL}/change-password`, {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;