import axios from 'axios';

// Base API URL configuration
const API_URL = "http://localhost:8080/api/v1";

// Global Axios configuration for CORS and headers
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // Required for CORS

class AuthService {
    async login(usernameOrEmail, password) {
        console.log('Login attempt:', { usernameOrEmail, password });
        try {
            const response = await axios.post(`${API_URL}/auth/signin`, {
                usernameOrEmail,
                password
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Server response:', response.data);
            if (response.data.token) {
                // Store token separately
                localStorage.setItem('token', response.data.token);
                // Store user data
                localStorage.setItem('user', JSON.stringify(response.data));
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                // Trigger authentication state change
                window.dispatchEvent(new Event('auth-change'));
            }
            return response.data;
        } catch (error) {
            console.error('Authentication error:', error);
            throw this.handleError(error);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('auth-change'));
    }

    async register(formData) {
        console.log('Registration attempt:', formData);
        try {
            const response = await axios.post(`${API_URL}/auth/signup`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Server response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Detailed error:', error);
            throw this.handleError(error);
        }
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            
            // Ajouter des logs pour le débogage
            console.log('Current user:', user);
            
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    isAuthenticated() {
        const user = this.getCurrentUser();
        const token = user?.token || localStorage.getItem('token');
        const isValid = !!token;
        
        // Debug logs
        console.log('Auth check:', {
            hasToken: !!token,
            hasUser: !!user,
            isValid
        });
        
        return isValid;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user?.authorities?.some(auth => auth.authority === permission) || false;
    }

    setupAxiosInterceptors() {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

    // Nouvelles méthodes pour le backoffice
    async getAllUsers() {
        return axios.get(`${API_URL}/users`).then(response => response.data);
    }

    async getUserById(id) {
        return axios.get(`${API_URL}/users/${id}`).then(response => response.data);
    }

    async updateUser(id, userData) {
        return axios.put(`${API_URL}/users/${id}`, userData).then(response => response.data);
    }

    async deleteUser(id) {
        return axios.delete(`${API_URL}/users/${id}`);
    }

    async getAllRoles() {
        return axios.get(`${API_URL}/roles`).then(response => response.data);
    }

    async getRoleById(id) {
        return axios.get(`${API_URL}/roles/${id}`).then(response => response.data);
    }

    async createRole(roleData) {
        return axios.post(`${API_URL}/roles`, roleData).then(response => response.data);
    }

    async updateRole(id, roleData) {
        return axios.put(`${API_URL}/roles/${id}`, roleData).then(response => response.data);
    }

    async deleteRole(id) {
        return axios.delete(`${API_URL}/roles/${id}`);
    }

    handleError(error) {
        console.error('Error processing:', error);
        if (error.response) {
            // Server returned error response
            return error.response.data || 'An error occurred';
        } else if (error.request) {
            // Request made but no response received
            console.error('No response from server:', error.request);
            return 'Server is not responding. Please check your connection.';
        } else {
            // Request configuration error
            console.error('Request configuration error:', error.message);
            return error.message;
        }
    }

    async createSuperAdmin(username, email, password) {
        const data = {
            username: username,
            email: email,
            password: password,
            firstName: "",  // Valeur par défaut
            lastName: ""    // Valeur par défaut
        };
        
        return axios.post(`${API_URL}/users/superuser`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
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

    async updateUserRole(userId, role) {
        try {
            const response = await axios.post(`${API_URL}/users/${userId}/roles`, {
                role: role
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

const authServiceInstance = new AuthService();
export default authServiceInstance; 