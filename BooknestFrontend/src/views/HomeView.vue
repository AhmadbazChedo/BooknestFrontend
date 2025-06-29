<template>
  <div class="home-view">
    
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
          <button @click="loadAllBooks" :class="['chip', { 'active': currentFilter === 'all' }]">
            All
          </button>
          <button @click="loadFavorites" :class="['chip', { 'active': currentFilter === 'favorites' }]">
            Favorites
          </button>
          <button @click="showGenreModal" :class="['chip', { 'active': currentFilter === 'genre' }]">
            Genre {{ selectedGenre ? `(${selectedGenre})` : '' }}
          </button>
        </div>
      </div>
    </div>

    
    <div v-if="isGenreModalOpen" class="genre-modal-overlay" @click="closeGenreModal">
      <div class="genre-modal" @click.stop>
        <div class="modal-header">
          <h3>🎭 Select Genre</h3>
          <button @click="closeGenreModal" class="close-btn">❌</button>
        </div>
        
        <div class="genre-list">
          <button 
            v-for="genre in availableGenres" 
            :key="genre"
            @click="filterByGenre(genre)"
            :class="['genre-item', { 'selected': selectedGenre === genre }]"
          >
            {{ genre }}
          </button>
        </div>
        
        <div class="modal-actions">
          <button @click="clearGenreFilter" class="clear-btn">
            🗑️ Clear Filter
          </button>
        </div>
      </div>
    </div>

   
    <div class="books-section">
      
      <div class="books-header">
        <h2 class="books-title">
          Books
          <span v-if="selectedGenre" class="genre-indicator">{{ selectedGenre }}</span>
        </h2>
        <router-link to="/newbook" class="add-book-btn">
          ✨ Add Book
        </router-link>
      </div>

      
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading books...</p>
      </div>

     
      <div v-else-if="books.length === 0" class="no-books">
        <div class="empty-icon">🌟</div>
        <h3>{{ noResultsMessage }}</h3>
        <p>{{ noResultsSubtext }}</p>
        <router-link to="/newbook" class="add-first-book-btn">
          🚀 Add your first book
        </router-link>
      </div>

      
      <div v-else class="books-grid">
        <div 
          v-for="book in books" 
          :key="book.id" 
          class="book-card"
          @click="goToBookDetail(book.id)"
        >
          
          
          <div class="book-header">
            <h3 class="book-title">{{ book.title }}</h3>
            <div v-if="book.favorite" class="favorite-star">
              ⭐
            </div>
          </div>
          
          <p class="book-author">{{ book.author }}</p>
          
          
          <div class="book-genre">
            <span class="genre-badge">{{ book.genre }}</span>
          </div>
          
          
          <div class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercentage(book.readingProgress) + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ getProgressPercentage(book.readingProgress) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

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

export default defineComponent({
  name: 'HomeView',
  data() {
    return {
      books: [] as Book[],
      searchQuery: '',
      currentFilter: 'all' as 'all' | 'favorites' | 'genre',
      isLoading: false,
      isGenreModalOpen: false,
      selectedGenre: '',
      availableGenres: [
        'Fiction',
        'Non-Fiction',
        'Science Fiction',
        'Fantasy',
        'Mystery',
        'Romance',
        'Thriller',
        'Biography',
        'History',
        'Adventure',
        'Horror',
        'Poetry'
      ]
    }
  },
  computed: {
    noResultsMessage(): string {
      if (this.searchQuery) {
        return 'No search results found'
      }
      if (this.selectedGenre) {
        return `No ${this.selectedGenre} books found`
      }
      return this.currentFilter === 'favorites' ? 'No favorites yet' : 'No books available'
    },
    noResultsSubtext(): string {
      if (this.searchQuery) {
        return 'Try different search terms or check the spelling.'
      }
      if (this.selectedGenre) {
        return 'Try selecting a different genre or add books in this genre.'
      }
      return this.currentFilter === 'favorites' 
        ? 'Mark books as favorites to see them here.'
        : 'Add your first book to start building your library.'
    }
  },
  methods: {
    async loadAllBooks(): Promise<void> {
      this.isLoading = true
      this.currentFilter = 'all'
      this.searchQuery = ''
      this.selectedGenre = ''
      
      try {
        const response = await axios.get<Book[]>(apiEndpoint)
        this.books = response.data
        console.log('All books loaded:', response.data)
      } catch (error) {
        console.error('Error loading books:', error)
        this.books = []
      } finally {
        this.isLoading = false
      }
    },
    
    async loadFavorites(): Promise<void> {
      this.isLoading = true
      this.currentFilter = 'favorites'
      this.searchQuery = ''
      this.selectedGenre = ''
      
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/favorites`)
        this.books = response.data
        console.log('Favorites loaded:', response.data)
      } catch (error) {
        console.error('Error loading favorites:', error)
        this.books = []
      } finally {
        this.isLoading = false
      }
    },
    
    async performSearch(): Promise<void> {
      if (!this.searchQuery.trim()) {
        this.loadAllBooks()
        return
      }
      
      this.isLoading = true
      this.currentFilter = 'all'
      this.selectedGenre = ''
      
      try {
        let response = await axios.get<Book[]>(`${apiEndpoint}/title/${encodeURIComponent(this.searchQuery)}`)
        let results = response.data
        
        if (results.length === 0) {
          response = await axios.get<Book[]>(`${apiEndpoint}/genre/${encodeURIComponent(this.searchQuery)}`)
          results = response.data
        }
        
        this.books = results
        console.log('Search results:', results)
      } catch (error) {
        console.error('Search error:', error)
        this.books = []
      } finally {
        this.isLoading = false
      }
    },
    
    showGenreModal(): void {
      this.isGenreModalOpen = true
    },
    
    closeGenreModal(): void {
      this.isGenreModalOpen = false
    },
    
    async filterByGenre(genre: string): Promise<void> {
      this.isLoading = true
      this.currentFilter = 'genre'
      this.selectedGenre = genre
      this.searchQuery = ''
      this.isGenreModalOpen = false
      
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/genre/${encodeURIComponent(genre)}`)
        this.books = response.data
        console.log(`${genre} books loaded:`, response.data)
      } catch (error) {
        console.error('Error loading genre books:', error)
        this.books = []
      } finally {
        this.isLoading = false
      }
    },
    
    clearGenreFilter(): void {
      this.selectedGenre = ''
      this.isGenreModalOpen = false
      this.loadAllBooks()
    },
    
    getProgressPercentage(progress: string): number {
      if (!progress) return 0
      const match = progress.match(/(\d+)%/)
      return match ? parseInt(match[1]) : 0
    },
    
    goToBookDetail(bookId: number): void {
      this.$router.push(`/book/${bookId}`)
    },
    
    handleImageError(event: Event): void {
      const img = event.target as HTMLImageElement
      img.style.display = 'none'
    }
  },
  mounted() {
    this.loadAllBooks()
  },
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  width: 100vw; 
  background: #0a0a0a;
  color: #ffffff;
  padding: 2rem; 
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
  margin-bottom: 2rem; 
}

.simple-logo {
  font-size: 4rem; 
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.4));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.brand-title {
  font-size: 3rem; 
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 3px; 
  text-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
  to { text-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(102, 126, 234, 0.2); }
}

.brand-subtitle {
  color: #ccc;
  font-size: 1.1rem; 
  margin: 0.5rem 0 0 0;
  opacity: 0.7;
  font-style: italic;
}


.search-section {
  margin-bottom: 1.5rem;
}

.search-bar {
  width: 100%;
  max-width: 500px; 
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 15px 20px; 
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px; 
  color: #ffffff;
  font-size: 16px; 
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
  gap: 15px; 
  justify-content: center;
  flex-wrap: wrap;
}

.chip {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 12px 24px; 
  border-radius: 20px; 
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px; 
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.chip:hover {
  background: rgba(50, 50, 50, 0.9);
  border-color: rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chip.active {
  background: rgba(102, 126, 234, 0.8);
  border-color: rgba(102, 126, 234, 1);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
}


.books-section {
  max-width: 1600px; 
  width: 100%;
  position: relative;
  z-index: 1;
}

.books-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem; 
  padding: 0 2rem; 
}

.books-title {
  font-size: 2rem; 
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.add-book-btn {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  color: white;
  padding: 12px 24px; 
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px; 
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}


.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
  gap: 1.5rem; 
  max-width: 1600px; 
  margin: 0 auto;
  padding: 0 2rem; 
}


@media (min-width: 1600px) {
  .books-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
  }
}

@media (max-width: 899px) {
  .header-section {
    max-width: 100%;
    padding: 1rem;
  }
  
  .brand-title {
    font-size: 2rem; 
  }
  
  .simple-logo {
    font-size: 3rem; 
  }
  
  .books-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 1rem;
  }
}

.book-card {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; 
  padding: 1.5rem; 
  cursor: pointer;
  transition: all 0.4s;
  width: 100%;
  height: 180px; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.book-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.book-card:hover::before {
  left: 100%;
}

.book-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 15px rgba(102, 126, 234, 0.2);
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.book-title {
  font-size: 1.2rem; 
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 0.5rem;
}

.favorite-star {
  font-size: 1rem;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
}

.book-author {
  color: #bbb;
  font-size: 1rem; 
  margin: 0 0 0.8rem 0;
}


.progress-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.progress-bar {
  flex: 1;
  background: rgba(10, 10, 10, 0.8);
  border-radius: 6px;
  height: 4px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
  box-shadow: 0 0 6px rgba(102, 126, 234, 0.3);
}

.progress-text {
  font-size: 0.85rem; 
  color: #aaa;
  font-weight: 600;
  min-width: 35px; 
}

/* Genre Modal */
.genre-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.genre-modal {
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.2rem;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.genre-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 1.5rem;
}

.genre-item {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.genre-item:hover {
  background: rgba(50, 50, 50, 0.9);
  border-color: rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.genre-item.selected {
  background: rgba(102, 126, 234, 0.8);
  border-color: rgba(102, 126, 234, 1);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
}

.modal-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.clear-btn {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b7a;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: rgba(220, 53, 69, 0.5);
  transform: translateY(-1px);
}


.genre-indicator {
  font-size: 0.8rem;
  color: rgba(102, 126, 234, 1);
  background: rgba(102, 126, 234, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 0.5rem;
  font-weight: 500;
}

.book-genre {
  margin-bottom: 0.5rem;
}

.genre-badge {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(102, 126, 234, 1);
  padding: 4px 12px; 
  border-radius: 10px; 
  font-size: 0.8rem; 
  font-weight: 600;
}
</style>
