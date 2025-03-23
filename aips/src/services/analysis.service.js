import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/analysis";

class AnalysisService {
  async getUserAnalyses() {
    return axios.get(`${API_URL}/user`);
  }

  async getAnalysisById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  async createAnalysis(data) {
    return axios.post(API_URL, data);
  }

  async getAnalysisResults(id) {
    return axios.get(`${API_URL}/${id}/results`);
  }

  async getAllAnalyses() {
    return axios.get(API_URL);
  }
}

export default new AnalysisService(); 