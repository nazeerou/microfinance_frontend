<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- Animated 404 Number -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit zero">
          <i class="fas fa-file-excel"></i>
        </span>
        <span class="digit">4</span>
      </div>

      <!-- Error Message -->
      <h1 class="error-title">Ukurasa Haupatikani</h1>

      <p class="error-message">
        Samahani, ukurasa unaoutafuta haupo au umehamishwa.
        <br />
        Tafadhali hakikisha URL ni sahihi au rudi kwenye dashibodi.
      </p>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Rudi Nyuma
        </button>

        <router-link to="/dashboard" class="btn-home">
          <i class="fas fa-home"></i>
          Nenda Dashibodi
        </router-link>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <p>Njia za haraka:</p>
        <div class="links-grid">
          <router-link to="/customers" class="quick-link">
            <i class="fas fa-users"></i>
            <span>Wateja</span>
          </router-link>
          <router-link to="/loans" class="quick-link">
            <i class="fas fa-hand-holding-usd"></i>
            <span>Mikopo</span>
          </router-link>
          <router-link to="/payments" class="quick-link">
            <i class="fas fa-money-bill-wave"></i>
            <span>Malipo</span>
          </router-link>
          <router-link to="/reports" class="quick-link">
            <i class="fas fa-chart-bar"></i>
            <span>Ripoti</span>
          </router-link>
        </div>
      </div>

      <!-- Help Text -->
      <div class="help-text">
        <i class="fas fa-question-circle"></i>
        <span>Unahitaji msaada? </span>
        <router-link to="/help" class="help-link">Wasiliana na Msaada</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Go back function
const goBack = () => {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // If no history, go to dashboard
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4e83ec 0%, #4e80ec 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.not-found-content {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
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

/* Animated 404 */
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;
}

.digit {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #667eea 0%, #4e80ec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: bounce 2s infinite;
  display: inline-block;
}

.digit.zero {
  animation-delay: 0.3s;
  font-size: 140px;
}

.digit.zero i {
  font-size: 120px;
  background: linear-gradient(135deg, #667eea 0%, #4e80ec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.error-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.error-message {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  padding: 0 20px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.btn-back,
.btn-home {
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  border: none;
}

.btn-back {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-back:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-home {
  background: linear-gradient(135deg, #667eea 0%, #4e80ec 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-back i,
.btn-home i {
  font-size: 14px;
}

/* Quick Links */
.quick-links {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #eef2f6;
}

.quick-links p {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  background: #f8f9fa;
  border-radius: 10px;
  text-decoration: none;
  color: #555;
  transition: all 0.3s;
  font-size: 13px;
}

.quick-link i {
  font-size: 24px;
  color: #667eea;
  transition: all 0.3s;
}

.quick-link:hover {
  background: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.quick-link:hover i,
.quick-link:hover span {
  color: white;
}

/* Help Text */
.help-text {
  margin-top: 30px;
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.help-text i {
  color: #667eea;
}

.help-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .digit {
    font-size: 80px;
  }

  .digit.zero i {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-message {
    font-size: 14px;
    padding: 0 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-back,
  .btn-home {
    width: 100%;
    justify-content: center;
  }

  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 30px 20px;
  }

  .digit {
    font-size: 60px;
  }

  .digit.zero i {
    font-size: 60px;
  }
}
</style>
