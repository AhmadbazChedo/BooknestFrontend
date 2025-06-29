<template>
  <div class="edit-book">
    
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
          <router-link :to="`/book/${bookId}`" class="chip chip-back">
            ← Back to Book
          </router-link>
        </div>
      </div>
    </div>

   
    <div class="edit-content-section">
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading book...</p>
      </div>
      
      <div v-else class="edit-form-container">
        <div class="form-header">
          <h2>✏️ {{ isNewBook ? 'Add New Book' : 'Edit Book' }}</h2>
        </div>
        
        <form @submit.prevent="saveBook" class="edit-form">
        
          <div class="cover-section">
            <div class="cover-preview">
              <div v-if="formData.coverImage" class="cover-image">
                <img :src="formData.coverImage" :alt="formData.title" @error="handleImageError" />
              </div>
              <div v-else class="cover-placeholder">
                <div class="cover-title">{{ formData.title || 'Book Cover' }}</div>
              </div>
            </div>
            
            <div class="cover-input-section">
              <div class="form-group">
                <label for="cover-url">📷 Cover Image URL</label>
                <input 
                  id="cover-url"
                  v-model="formData.coverImage" 
                  type="url" 
                  placeholder="https://example.com/book-cover.jpg"
                  class="form-input"
                />
                <div class="form-hint">Enter a direct URL to an image (PNG, JPG, JPEG)</div>
              </div>
              
              <button 
                type="button" 
                @click="clearCoverImage" 
                v-if="formData.coverImage"
                class="clear-cover-btn"
              >
                🗑️ Remove Cover
              </button>
            </div>
          </div>
          
         
          <div class="form-grid">
           
            <div class="form-section">
              <h3>📚 Basic Information</h3>
              
              <div class="form-group">
                <label for="title">Title *</label>
                <input 
                  id="title"
                  v-model="formData.title" 
                  type="text" 
                  required 
                  placeholder="Enter book title..."
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="author">Author *</label>
                <input 
                  id="author"
                  v-model="formData.author" 
                  type="text" 
                  required 
                  placeholder="Enter author name..."
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="genre">Genre *</label>
                <select 
                  id="genre"
                  v-model="formData.genre" 
                  required 
                  class="form-select"
                >
                  <option value="">Select genre...</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Biography">Biography</option>
                  <option value="History">History</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Horror">Horror</option>
                  <option value="Poetry">Poetry</option>
                </select>
              </div>
            </div>
            
           
            <div class="form-section">
              <h3>📊 Progress & Details</h3>
              
              <div class="form-group">
                <label for="progress">Reading Progress (%)</label>
                <input 
                  id="progress"
                  v-model.number="progressValue" 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  class="form-range"
                />
                <div class="range-value">{{ progressValue }}%</div>
              </div>
              
              <div class="form-group">
                <label for="chapters">Chapters (comma-separated)</label>
                <input 
                  id="chapters"
                  v-model="chaptersInput" 
                  type="text" 
                  placeholder="1, 2, 3, 4, 5..."
                  class="form-input"
                />
                <div class="form-hint">Enter chapter numbers separated by commas</div>
              </div>
              
              <div class="form-group">
                <label>
                  <input 
                    v-model="formData.favorite" 
                    type="checkbox" 
                    class="form-checkbox"
                  />
                  ⭐ Mark as favorite
                </label>
              </div>
            </div>
          </div>
          
          
          <div class="form-section full-width">
            <h3>📖 Summary</h3>
            <div class="form-group">
              <textarea 
                v-model="formData.summary" 
                placeholder="Enter book summary or description..."
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>
          </div>
          
          
          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="isSaving">
              {{ isSaving ? '💫 Saving...' : (isNewBook ? '🚀 Add Book' : '💾 Save Changes') }}
            </button>
            
            <button type="button" @click="cancelEdit" class="cancel-btn">
              ❌ Cancel
            </button>
            
            <button 
              v-if="!isNewBook" 
              type="button" 
              @click="showDeleteConfirmation" 
              class="delete-btn"
            >
              🗑️ Delete Book
            </button>
          </div>
        </form>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import DeleteConfirmation from '../components/DeleteConfirmation.vue' 

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL ?? 'https://booknestweb.onrender.com'
const apiEndpoint = baseURL + '/books'

interface Book {
  id?: number
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

const bookId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)
const isNewBook = computed(() => !bookId.value)

const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')
const showDeleteModal = ref(false) 

const formData = ref<Book>({
  title: '',
  author: '',
  genre: '',
  chapters: [],
  summary: '',
  readingProgress: '0%',
  favorite: false,
  coverImage: ''
})

const progressValue = ref(0)
const chaptersInput = ref('')

const loadBook = async (): Promise<void> => {
  if (!bookId.value) {
    isLoading.value = false
    return
  }
  
  try {
    const response = await axios.get<Book>(`${apiEndpoint}/${bookId.value}`)
    
    formData.value = {
      id: response.data.id,
      title: response.data.title || '',
      author: response.data.author || '',
      genre: response.data.genre || '', 
      chapters: response.data.chapters || [],
      summary: response.data.summary || '',
      readingProgress: response.data.readingProgress || '0%',
      favorite: response.data.favorite || false,
      coverImage: response.data.coverImage || ''
    }
    
   
    const match = formData.value.readingProgress.match(/(\d+)%/)
    progressValue.value = match ? parseInt(match[1]) : 0
    
    
    chaptersInput.value = formData.value.chapters.length > 0 
      ? formData.value.chapters.join(', ') 
      : ''
    
    console.log('Book loaded for editing:', formData.value)
  } catch (error) {
    console.error('Error loading book:', error)
    alert('Error loading book!')
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const handleImageError = (): void => {
  console.log('Image failed to load:', formData.value.coverImage)
 
}

const clearCoverImage = (): void => {
  formData.value.coverImage = ''
}

const saveBook = async (): Promise<void> => {
  isSaving.value = true
  
  try {
   
    const bookData: Book = {
      ...formData.value,
      readingProgress: `${progressValue.value}%`,
      chapters: chaptersInput.value 
        ? chaptersInput.value.split(',').map(ch => parseInt(ch.trim())).filter(ch => !isNaN(ch))
        : [],
      coverImage: formData.value.coverImage || undefined
    }
    
    if (isNewBook.value) {
      
      const response = await axios.post<Book>(apiEndpoint, bookData)
      console.log('Book created:', response.data)
      router.push(`/book/${response.data.id}`)
    } else {
      
      bookData.id = bookId.value!
      await axios.put(`${apiEndpoint}/${bookId.value}`, bookData)
      console.log('Book updated:', bookData)
      router.push(`/book/${bookId.value}`)
    }
  } catch (error) {
    console.error('Error saving book:', error)
    alert('Error saving book!')
  } finally {
    isSaving.value = false
  }
}

const deleteBook = (): void => {
  
  showDeleteModal.value = true
}

const showDeleteConfirmation = (): void => {
  console.log('Show delete confirmation') 
  showDeleteModal.value = true
}

const confirmDelete = async (): Promise<void> => {
  if (!bookId.value) return
  
  console.log('Deleting book:', bookId.value) 
  
  try {
    await axios.delete(`${apiEndpoint}/${bookId.value}`)
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

const cancelEdit = (): void => {
  if (isNewBook.value) {
    router.push('/')
  } else {
    router.push(`/book/${bookId.value}`)
  }
}

const performSearch = (): void => {
  if (searchQuery.value.trim()) {
    router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

onMounted(() => {
  loadBook()
})
</script>

<style scoped>
.edit-book {
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
  max-width: 800px; 
  width: 100%;
  text-align: center;
  padding: 2rem 0 3rem 0;
  margin-bottom: 2rem;
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


.edit-content-section {
  max-width: 1400px; 
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

.edit-form-container {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}


.cover-section {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cover-preview {
  width: 150px;
  height: 225px;
  position: relative;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.cover-title {
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.cover-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.clear-cover-btn {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b7a;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s;
  width: fit-content;
}

.clear-cover-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: rgba(220, 53, 69, 0.5);
  transform: translateY(-1px);
}


.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section.full-width {
  grid-column: 1 / -1;
}

.form-section h3 {
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input, .form-select, .form-textarea {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-range {
  width: 100%;
  height: 6px;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.range-value {
  text-align: center;
  color: #ffffff;
  font-weight: 600;
  margin-top: 0.5rem;
  padding: 5px 10px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: rgba(102, 126, 234, 0.8);
}

.form-hint {
  color: #aaa;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}


.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn, .cancel-btn, .delete-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.save-btn {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 1), rgba(118, 75, 162, 1));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(30, 30, 30, 0.8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(50, 50, 50, 0.9);
  transform: translateY(-2px);
}

.delete-btn {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b7a;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: rgba(220, 53, 69, 0.5);
  transform: translateY(-2px);
}


@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .cover-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .cover-preview {
    width: 120px;
    height: 180px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions button {
    width: 200px;
  }
}
</style>