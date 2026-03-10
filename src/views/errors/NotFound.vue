<!-- views/errors/NotFound.vue -->
<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- Animated 404 Illustration -->
      <div class="error-illustration">
        <div class="error-number">
          <span class="digit">4</span>
          <div class="zero-container">
            <span class="digit zero">0</span>
            <div class="coin-stack">
              <div class="coin" v-for="i in 3" :key="i"></div>
            </div>
          </div>
          <span class="digit">4</span>
        </div>
        
        <div class="illustration-text">
          <i class="fas fa-file-invoice"></i>
          <i class="fas fa-hand-holding-usd"></i>
          <i class="fas fa-coins"></i>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message">
        <h1>404 - Haipatikani</h1>
        <p class="main-message">
          Samahani, ukurasa unaoutafuta haupo au umehamishwa.
        </p>
        <p class="sub-message">
          Huenda mkopo ulioomba au mteja unaemtafuta hayupo kwenye mfumo.
          Tafadhali hakikisha umeingiza taarifa sahihi.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Je, ungependa kwenda?</h3>
        
        <div class="action-grid">
          <router-link to="/dashboard" class="action-card">
            <div class="action-icon">
              <i class="fas fa-chart-pie"></i>
            </div>
            <div class="action-info">
              <span class="action-title">Dashibodi</span>
              <span class="action-desc">Rudi kwenye dashibodi kuu</span>
            </div>
          </router-link>

          <router-link to="/customers" class="action-card">
            <div class="action-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="action-info">
              <span class="action-title">Wateja</span>
              <span class="action-desc">Angalia orodha ya wateja</span>
            </div>
          </router-link>

          <router-link to="/loans" class="action-card">
            <div class="action-icon">
              <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="action-info">
              <span class="action-title">Mikopo</span>
              <span class="action-desc">Angalia mikopo yote</span>
            </div>
          </router-link>

          <router-link to="/payments" class="action-card">
            <div class="action-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="action-info">
              <span class="action-title">Malipo</span>
              <span class="action-desc">Rekodi malipo mpya</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <h3>Tafuta unachokihitaji</h3>
        
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            @keyup.enter="performSearch"
            placeholder="Tafuta kwa jina la mteja, namba ya mkopo..."
            class="search-input"
          />
          <button @click="performSearch" class="search-btn">
            Tafuta
          </button>
        </div>

        <!-- Popular Searches -->
        <div class="popular-searches">
          <span class="popular-label">Vinavyotafutwa sana:</span>
          <button @click="quickSearch('active loans')" class="popular-tag">
            <i class="fas fa-clock"></i> Mikopo inayoendelea
          </button>
          <button @click="quickSearch('defaulted')" class="popular-tag">
            <i class="fas fa-exclamation-triangle"></i> Mikopo iliyochelewa
          </button>
          <button @click="quickSearch('new customers')" class="popular-tag">
            <i class="fas fa-user-plus"></i> Wateja wapya
          </button>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <div class="help-card">
          <div class="help-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="help-content">
            <h4>Unahitaji msaada?</h4>
            <p>Wasiliana na msimamizi wa mfumo au angalia mwongozo wa matumizi.</p>
            <div class="help-links">
              <a href="#" @click.prevent="contactSupport" class="help-link">
                <i class="fas fa-headset"></i> Wasiliana nasi
              </a>
              <router-link to="/help" class="help-link">
                <i class="fas fa-book"></i> Mwongozo
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
        Rudi kwenye ukurasa uliotangulia
      </button>
    </div>

    <!-- Support Modal -->
    <div v-if="showSupportModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Wasiliana na Msaada</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitSupportRequest">
            <div class="form-group">
              <label for="name">Jina lako</label>
              <input 
                type="text" 
                id="name" 
                v-model="supportForm.name"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Barua pepe</label>
              <input 
                type="email" 
                id="email" 
                v-model="supportForm.email"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="message">Ujumbe wako</label>
              <textarea 
                id="message" 
                v-model="supportForm.message"
                class="form-control"
                rows="4"
                required
                placeholder="Elezea tatizo lako au swali ulilonalo..."
              ></textarea>
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              <span v-else>Tuma ujumbe</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showToast" class="toast-notification" :class="toastType">
      <i :class="toastIcon"></i>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const searchQuery = ref('')
const showSupportModal = ref(false)
const submitting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const supportForm = ref({
  name: '',
  email: '',
  message: ''
})

// Methods
const goBack = () => {
  router.go(-1)
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      path: '/search', 
      query: { q: searchQuery.value } 
    })
  }
}

const quickSearch = (term) => {
  searchQuery.value = term
  performSearch()
}

const contactSupport = () => {
  showSupportModal.value = true
}

const closeModal = () => {
  showSupportModal.value = false
  supportForm.value = {
    name: '',
    email: '',
    message: ''
  }
}

const submitSupportRequest = async () => {
  submitting.value = true
  
  // Simulate API call
  setTimeout(() => {
    submitting.value = false
    showSupportModal.value = false
    showToastMessage('Ujumbe wako umetumwa. Tutawasiliana nawe hivi karibuni.', 'success')
    
    // Reset form
    supportForm.value = {
      name: '',
      email: '',
      message: ''
    }
  }, 1500)
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Computed
const toastIcon = computed(() => {
  return toastType.value === 'success' 
    ? 'fas fa-check-circle' 
    : 'fas fa-exclamation-circle'
})
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  position: relative;
  overflow-y: auto;
}

.not-found-content {
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 50px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Illustration */
.error-illustration {
  text-align: center;
  margin-bottom: 30px;
}

.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.digit {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.zero-container {
  position: relative;
  display: inline-block;
}

.coin-stack {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.coin {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  margin-top: -15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  animation: bounce 2s infinite;
}

.coin:nth-child(1) { animation-delay: 0s; }
.coin:nth-child(2) { animation-delay: 0.3s; }
.coin:nth-child(3) { animation-delay: 0.6s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.illustration-text {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #cbd5e0;
  font-size: 2rem;
}

.illustration-text i {
  animation: float 3s ease-in-out infinite;
}

.illustration-text i:nth-child(1) { animation-delay: 0s; }
.illustration-text i:nth-child(2) { animation-delay: 0.2s; }
.illustration-text i:nth-child(3) { animation-delay: 0.4s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Error Message */
.error-message {
  text-align: center;
  margin-bottom: 40px;
}

.error-message h1 {
  font-size: 2.5rem;
  color: #1e3c72;
  margin-bottom: 15px;
  font-weight: 700;
}

.main-message {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
}

.sub-message {
  color: #666;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h3 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 1.3rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid #eef2f6;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #2196F3;
  background: white;
}

.action-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon i {
  font-size: 1.5rem;
  color: white;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 0.8rem;
  color: #666;
}

/* Search Section */
.search-section {
  margin-bottom: 40px;
}

.search-section h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.search-box {
  display: flex;
  gap: 10px;
  max-width: 500px;
  margin: 0 auto 20px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  z-index: 1;
}

.search-input {
  flex: 1;
  padding: 15px 15px 15px 45px;
  border: 2px solid #eef2f6;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  background: white;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
}

.search-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(30, 60, 114, 0.4);
}

.popular-searches {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.popular-label {
  color: #666;
  font-size: 0.9rem;
}

.popular-tag {
  padding: 8px 15px;
  background: #f0f4f8;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #4a5568;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.popular-tag:hover {
  background: #e2e8f0;
  color: #1e3c72;
  border-color: #1e3c72;
}

.popular-tag i {
  font-size: 0.8rem;
}

/* Help Section */
.help-section {
  margin-bottom: 40px;
}

.help-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.help-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon i {
  font-size: 2rem;
}

.help-content {
  flex: 1;
}

.help-content h4 {
  margin: 0 0 5px;
  font-size: 1.2rem;
}

.help-content p {
  margin: 0 0 15px;
  opacity: 0.9;
  font-size: 0.95rem;
}

.help-links {
  display: flex;
  gap: 15px;
}

.help-link {
  color: white;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.help-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Back Button */
.back-button {
  display: block;
  width: fit-content;
  margin: 0 auto;
  padding: 12px 30px;
  background: transparent;
  border: 2px solid #1e3c72;
  color: #1e3c72;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.back-button:hover {
  background: #1e3c72;
  color: white;
  transform: translateX(-5px);
}

.back-button i {
  margin-right: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(30, 60, 114, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInRight 0.3s ease;
  z-index: 1100;
  border-left: 4px solid #4CAF50;
}

.toast-notification.success {
  border-left-color: #4CAF50;
}

.toast-notification.error {
  border-left-color: #f44336;
}

.toast-notification i {
  font-size: 1.2rem;
}

.toast-notification.success i {
  color: #4CAF50;
}

.toast-notification.error i {
  color: #f44336;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .not-found-content {
    padding: 30px 20px;
  }

  .digit {
    font-size: 80px;
  }

  .error-message h1 {
    font-size: 2rem;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .help-card {
    flex-direction: column;
    text-align: center;
  }

  .help-links {
    justify-content: center;
  }

  .search-box {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }

  .popular-searches {
    flex-direction: column;
    align-items: stretch;
  }

  .popular-tag {
    justify-content: center;
  }

  .toast-notification {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}

@media (max-width: 480px) {
  .digit {
    font-size: 60px;
  }

  .error-message h1 {
    font-size: 1.5rem;
  }

  .main-message {
    font-size: 1rem;
  }

  .action-card {
    padding: 15px;
  }
}
</style>