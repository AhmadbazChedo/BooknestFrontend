<template>
  <div class="book-detail">
    
    <div class="stars-container">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <div class="header-section">
      <div class="brand-section">
        <div class="simple-logo">🌌</div>
        <h1 class="brand-title">BOOKNEST</h1>
        <p class="brand-subtitle">Explore the Universe of Books</p>
      </div>
      
      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            @keyup.enter="performSearch"
            placeholder="Search books..." 
            class="search-input"
          />
        </div>
      </div>
      
      <div class="filter-section">
        <div class="filter-chips">
          <router-link to="/" class="chip chip-back">
            ← Back to Books
          </router-link>
        </div>
      </div>
    </div>

    <div class="book-content-section">
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading book...</p>
      </div>
      
      <div v-else class="book-detail-container">
        <div class="book-detail-header">
          <div class="book-cover">
            <div v-if="book.coverImage" class="cover-image">
              <img :src="book.coverImage" :alt="book.title" />
            </div>
            <div v-else class="cover-placeholder">
              <div class="cover-title">{{ book.title }}</div>
            </div>
          </div>
          
          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <p class="book-author">by {{ book.author }}</p>
            <div class="book-meta">
              <span class="genre-badge">{{ book.genre }}</span>
              <div v-if="book.favorite" class="favorite-indicator">
                ⭐ Favorite
              </div>
            </div>
            
            <div class="progress-section">
              <h3>Reading Progress</h3>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(book.readingProgress) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ getProgressPercentage(book.readingProgress) }}%</span>
            </div>
          </div>
          
          <div class="book-actions">
            <router-link :to="`/edit/${book.id}`" class="edit-btn">
              ✏️ Edit
            </router-link>
          </div>
        </div>
        
        <div class="book-details-grid">
          <div class="detail-card" v-if="book.summary">
            <h3>📖 Summary</h3>
            <p>{{ book.summary }}</p>
          </div>
          
          <div class="detail-card">
            <h3>📊 Book Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Genre:</span>
                <span class="info-value">{{ book.genre }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Chapters:</span>
                <span class="info-value">{{ book.chapters?.length || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">{{ book.id }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-card" v-if="book.chapters && book.chapters.length > 0">
            <h3>📚 Chapters</h3>
            <div class="chapters-grid">
              <div v-for="chapter in book.chapters" :key="chapter" class="chapter-badge">
                Chapter {{ chapter }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="toggleFavorite" class="favorite-btn">
            {{ book.favorite ? '⭐ Remove from Favorites' : '⭐ Add to Favorites' }}
          </button>
          
          <button @click="showDeleteConfirmation" class="delete-btn">
            🗑️ Delete Book
          </button>
        </div>
      </div>
    </div>

    <DeleteConfirmation 
      :show="showDeleteModal" 
      @confirm="confirmDelete" 
      @cancel="cancelDelete" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import DeleteConfirmation from '../components/DeleteConfirmation.vue'

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL ??
                  'https://booknestweb.onrender.com'
const apiEndpoint = baseURL + '/books'

interface Book {
  id: number
  title: string
  author: string
  genre: string
  chapters: number[]
  summary: string
  readingProgress: string
  favorite: boolean
  coverImage?: string
}

const route = useRoute()
const router = useRouter()

const book = ref<Book>({
  id: 0,
  title: '',
  author: '',
  genre: '',
  chapters: [],
  summary: '',
  readingProgress: '0%',
  favorite: false,
  coverImage: ''
})

const isLoading = ref(true)
const searchQuery = ref('')
const showDeleteModal = ref(false)

const loadBook = async (): Promise<void> => {
  const bookId = route.params.id
  if (!bookId) {
    router.push('/')
    return
  }
  
  try {
    const response = await axios.get<Book>(`${apiEndpoint}/${bookId}`)
    book.value = response.data
    console.log('Book loaded:', response.data)
  } catch (error) {
    console.error('Error loading book:', error)
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const toggleFavorite = async (): Promise<void> => {
  try {
    const updatedBook = { ...book.value, favorite: !book.value.favorite }
    await axios.put(`${apiEndpoint}/${book.value.id}`, updatedBook)
    book.value.favorite = !book.value.favorite
    console.log('Favorite status updated')
  } catch (error) {
    console.error('Error updating favorite:', error)
  }
}

const showDeleteConfirmation = (): void => {
  console.log('Show delete confirmation')
  showDeleteModal.value = true
}

const confirmDelete = async (): Promise<void> => {
  console.log('Deleting book:', book.value.id)
  
  try {
    await axios.delete(`${apiEndpoint}/${book.value.id}`)
    console.log('Book deleted successfully')
    showDeleteModal.value = false
    router.push('/')
  } catch (error) {
    console.error('Error deleting book:', error)
    alert('Error deleting book!')
    showDeleteModal.value = false
  }
}

const cancelDelete = (): void => {
  console.log('Delete cancelled')
  showDeleteModal.value = false
}

const performSearch = (): void => {
  if (searchQuery.value.trim()) {
    router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

const getProgressPercentage = (progress: string): number => {
  if (!progress) return 0
  const match = progress.match(/(\d+)%/)
  return match ? parseInt(match[1]) : 0
}

onMounted(() => {
  loadBook()
})
</script>

<style scoped>
.book-detail {
  min-height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  padding: 1rem;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.stars {
  background-image: 
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 150px 150px;
  animation: move-stars 300s linear infinite;
}

.stars2 {
  background-image: 
    radial-gradient(2px 2px at 25% 15%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 60% 45%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 80% 25%, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 40% 75%, rgba(255,255,255,0.3), transparent);
  background-repeat: repeat;
  background-size: 250px 250px;
  animation: move-stars 400s linear infinite reverse;
}

.stars3 {
  background-image: 
    radial-gradient(2px 2px at 35% 55%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 65% 85%, rgba(255,255,255,0.4), transparent),
    radial-gradient(2px 2px at 20% 90%, rgba(255,255,255,0.2), transparent);
  background-repeat: repeat;
  background-size: 400px 400px;
  animation: move-stars 500s linear infinite;
}

@keyframes move-stars {
  from { transform: translateX(0); }
  to { transform: translateX(-100px); }
}

.header-section {
  max-width: 500px;
  width: 100%;
  text-align: center;
  padding: 1rem 0 2rem 0;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.brand-section {
  margin-bottom: 1.5rem;
}

.simple-logo {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.4));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
  to { text-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(102, 126, 234, 0.2); }
}

.brand-subtitle {
  color: #ccc;
  font-size: 0.8rem;
  margin: 0.3rem 0 0 0;
  opacity: 0.7;
  font-style: italic;
}

.search-section {
  margin-bottom: 1rem;
}

.search-bar {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.search-input::placeholder {
  color: #888;
}

.filter-section {
  margin-bottom: 0.5rem;
}

.filter-chips {
  display: flex;
  justify-content: center;
}

.chip {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  text-decoration: none;
}

.chip-back {
  background: rgba(102, 126, 234, 0.8);
  border-color: rgba(102, 126, 234, 1);
}

.chip:hover {
  background: rgba(50, 50, 50, 0.9);
  border-color: rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.book-content-section {
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid rgba(102, 126, 234, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.book-detail-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.book-cover {
  width: 200px;
  height: 300px;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.3)"/><circle cx="80" cy="40" r="0.5" fill="rgba(255,255,255,0.4)"/><circle cx="40" cy="80" r="1.5" fill="rgba(255,255,255,0.2)"/></svg>');
  opacity: 0.3;
}

.cover-title {
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  z-index: 1;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.book-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.book-author {
  font-size: 1.2rem;
  color: #ccc;
  margin: 0 0 1rem 0;
  font-style: italic;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.genre-badge {
  background: rgba(102, 126, 234, 0.3);
  color: rgba(102, 126, 234, 1);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.favorite-indicator {
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 600;
}

.progress-section h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}

.progress-bar {
  background: rgba(10, 10, 10, 0.8);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
}

.progress-text {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.book-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-actions .edit-btn {
  background: rgba(102, 126, 234, 0.8);
  color: white;
  border: 1px solid rgba(102, 126, 234, 1);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.book-actions .edit-btn:hover {
  background: rgba(102, 126, 234, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.favorite-btn, .delete-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.favorite-btn {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.favorite-btn:hover {
  background: rgba(255, 193, 7, 0.3);
  transform: translateY(-2px);
}

.delete-btn {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  transform: translateY(-2px);
}

.book-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.detail-card h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-card p {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #aaa;
  font-size: 0.9rem;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.chapter-badge {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(102, 126, 234, 1);
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .book-detail-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .favorite-btn, .delete-btn {
    width: 200px;
  }
}
</style>