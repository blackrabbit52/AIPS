import axios from 'axios';

// Définir l'URL de base correcte
const API_URL = "http://localhost:8080/api/v1/auth/";

// Désactiver toute configuration globale d'axios
delete axios.defaults.baseURL;
delete axios.defaults.headers.common['Accept'];
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.request.handlers = [];
axios.interceptors.response.handlers = [];

class AuthService {
    async login(email, password) {
        const response = await axios.post(`${API_URL}/signin`, {
            usernameOrEmail: email,
            password: password
        });
        if (response.data) {
            localStorage.setItem('token', response.data);
            this.setupAxiosInterceptors();
        }
        return response.data;
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    async register(username, email, password) {
        try {
            const response = await axios.post(API_URL + "register", {
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return response;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else if (error.request) {
                throw new Error('Server is not responding. Please check your connection.');
            } else {
                throw new Error('Error creating account.');
            }
        }
    }

    getCurrentUser() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                return JSON.parse(atob(token.split('.')[1]));
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                return decoded.exp * 1000 > Date.now();
            } catch {
                return false;
            }
        }
        return false;
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
        
        axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.logout();
                }
                return Promise.reject(error);
            }
        );
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
        if (error.response) {
            // Le serveur a répondu avec un code d'erreur
            return {
                message: error.response.data.message || "Une erreur est survenue",
                status: error.response.status
            };
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            return {
                message: "Le serveur ne répond pas",
                status: 503
            };
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            return {
                message: error.message,
                status: 500
            };
        }
    }

    createSuperAdmin(username, email, password) {
        return axios.post(API_URL + "/create-super-admin", {
            username,
            email,
            password
        });
    }
}

const authServiceInstance = new AuthService();
export default authServiceInstance; 