import axios from 'axios';

const API_URL = "http://localhost:8000/api/v1/analysis";
const DATASETS_URL = "http://localhost:8000/api/v1/datasets";
const MODELS_URL = "http://localhost:8000/api/v1/models";

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

  // New methods for personality analysis features

  /**
   * Check if the ML models are available for analysis
   * @returns {Promise} Response from the API
   */
  async checkModelsStatus() {
    return axios.get(`${API_URL}/check_models_status/`);
  }

  /**
   * Analyze personality based on text input
   * @param {string} text - Text to be analyzed
   * @returns {Promise} Response containing task ID for tracking
   */
  async analyzeText(text) {
    return axios.post(`${API_URL}/analyze_text/`, { text });
  }

  /**
   * Analyze personality based on social media profile
   * @param {Object} data - Social media profile details
   * @param {string} data.platform - Social media platform (twitter, facebook, linkedin)
   * @param {string} data.username - Social media username/handle
   * @param {string} data.start_date - Start date for post collection (YYYY-MM-DD)
   * @param {string} data.end_date - End date for post collection (YYYY-MM-DD)
   * @returns {Promise} Response containing task ID for tracking
   */
  async analyzeSocialMedia(data) {
    return axios.post(`${API_URL}/analyze_social_media/`, data);
  }

  /**
   * Check the status of an analysis task
   * @param {string} taskId - The ID of the task to check
   * @param {boolean} includeProgress - Whether to include detailed progress information
   * @returns {Promise} Response containing task status and results if completed
   */
  async checkTaskStatus(taskId, includeProgress = true) {
    return axios.get(`${API_URL}/task_status/`, {
      params: { 
        task_id: taskId,
        include_progress: includeProgress
      }
    });
  }

  /**
   * Download datasets and train ML models
   * @param {Array} modelTypes - Types of models to train (default: ["MBTI", "OCEAN"])
   * @param {number} dataLimit - Maximum number of data samples to use for training (optional)
   * @param {boolean} showTotalCount - Whether to include total data count in response
   * @param {boolean} allowAlternativeFormats - Whether to accept non-CSV formats for datasets
   * @returns {Promise} Response containing task ID for tracking
   */
  async fetchAndTrainModels(modelTypes = ["MBTI", "OCEAN"], dataLimit = null, showTotalCount = true, allowAlternativeFormats = true) {
    const requestData = { 
      model_types: modelTypes,
      show_total_count: showTotalCount,
      allow_alternative_formats: allowAlternativeFormats,
      force_limit: true,
      convert_ocean_format: true,
      check_existing_files: true,
      ocean_filename: 'IPIP-FFM-data-8Nov2018'
    };
    
    if (dataLimit && !isNaN(dataLimit) && dataLimit > 0) {
      requestData.data_limit = parseInt(dataLimit);
      console.log(`Training with data limit: ${dataLimit} samples`);
    }
    
    return axios.post(`${DATASETS_URL}/fetch_and_train/`, requestData);
  }

  /**
   * Download Kaggle datasets
   * @returns {Promise} Response containing task ID for tracking
   */
  async fetchKaggleDatasets() {
    return axios.post(`${DATASETS_URL}/fetch_kaggle_datasets/`);
  }

  /**
   * Train personality models on existing datasets
   * @param {Object} data - Training configuration
   * @param {Array} data.dataset_ids - IDs of datasets to use for training
   * @param {string} data.model_type - Type of model to train (MBTI or OCEAN)
   * @returns {Promise} Response containing task ID for tracking
   */
  async trainModel(data) {
    return axios.post(`${MODELS_URL}/train_model/`, data);
  }

  /**
   * Get all available datasets
   * @returns {Promise} Response containing list of datasets
   */
  async getAllDatasets() {
    return axios.get(DATASETS_URL);
  }

  /**
   * Get all trained models
   * @returns {Promise} Response containing list of trained models
   */
  async getAllModels() {
    return axios.get(MODELS_URL);
  }

  /**
   * Activate a specific model
   * @param {number} modelId - ID of the model to activate
   * @returns {Promise} Response containing activation status
   */
  async activateModel(modelId) {
    return axios.post(`${MODELS_URL}/${modelId}/activate/`);
  }

  /**
   * Check if models are currently being trained
   * @returns {Promise} Response containing training status and progress
   */
  async checkTrainingStatus() {
    return axios.get(`${API_URL}/training_status/`);
  }

  /**
   * Obtenir le nombre total de données dans le dataset
   * @param {string} datasetId - ID du dataset
   * @returns {Promise} Response containing dataset total count
   */
  async getDatasetTotalCount(datasetId) {
    return axios.get(`${DATASETS_URL}/${datasetId}/count`);
  }

  /**
   * Analyser un échantillon aléatoire de données du dataset
   * @param {string} datasetId - ID du dataset
   * @param {number} sampleSize - Nombre d'entrées à analyser (échantillon)
   * @returns {Promise} Response containing analysis of random sample
   */
  async analyzeRandomSample(datasetId, sampleSize = 100) {
    return axios.post(`${API_URL}/analyze_random_sample/`, {
      dataset_id: datasetId,
      sample_size: sampleSize
    });
  }
}

export default new AnalysisService(); 