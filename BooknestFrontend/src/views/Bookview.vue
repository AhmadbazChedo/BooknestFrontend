<template>
  <div class="book-list-view">
    <h2>📚 Meine Bücher</h2>

    <div class="search-container">
      <div class="search-box">
        <h3><i class="fas fa-search"></i> Nach Titel suchen</h3>
        <div class="search-input">
          <input 
            v-model="searchTitle" 
            @keyup.enter="searchByTitle"
            placeholder="Titel eingeben..." 
            class="search-field"
          />
          <button @click="searchByTitle" class="search-btn">
            <i class="fas fa-search"></i> Suchen
          </button>
        </div>
      </div>
      
      <div class="search-box">
        <h3><i class="fas fa-tags"></i> Nach Genre suchen</h3>
        <div class="search-input">
          <input 
            v-model="searchGenre" 
            @keyup.enter="searchByGenre"
            placeholder="Genre eingeben..." 
            class="search-field"
          />
          <button @click="searchByGenre" class="search-btn">
            <i class="fas fa-search"></i> Suchen
          </button>
        </div>
      </div>
      
      <div class="search-box">
        <h3><i class="fas fa-star"></i> Filter</h3>
        <div class="filter-buttons">
          <button @click="loadAllBooks" class="filter-btn">Alle Bücher</button>
          <button @click="loadFavorites" class="filter-btn favorite-btn">
            <i class="fas fa-star"></i> Nur Favoriten
          </button>
        </div>
      </div>
    </div>

    <div v-if="books.length === 0" class="no-books">
      <p>Keine Bücher gefunden.</p>
    </div>

    <ul v-else class="book-list">
      <li v-for="book in books" :key="book.id" class="book-item">
        <div class="book-card" :class="{ 'favorite': book.favorite }" @click="goToBookDetail(book.id)">
          <div class="book-header">
            <div>
              <h3>{{ book.title }}</h3>
              <p class="author"><strong>Autor:</strong> {{ book.author }}</p>
            </div>
            <div v-if="book.favorite" class="favorite-star">
              <i class="fas fa-star"></i>
            </div>
          </div>
          
          <div class="book-details">
            <p><strong>Genre:</strong> {{ book.genre || 'Nicht angegeben' }}</p>
            <p><strong>Kapitel:</strong> {{ book.chapters?.length || 0 }}</p>
            <p><strong>Fortschritt:</strong> {{ book.readingProgress || 'Nicht angegeben' }}</p>
            
            <div v-if="getProgressPercentage(book.readingProgress) > 0" class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(book.readingProgress) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ getProgressPercentage(book.readingProgress) }}%</span>
            </div>
            
            <p v-if="book.summary"><strong>Zusammenfassung:</strong> {{ book.summary }}</p>
          </div>
          
          <div class="book-actions">
            <button 
              @click="toggleFavorite(book)"
              :class="['action-btn', book.favorite ? 'favorite-btn' : 'add-favorite-btn']"
            >
              <i :class="['fas', book.favorite ? 'fa-star' : 'fa-star-o']"></i>
              {{ book.favorite ? 'Favorit entfernen' : 'Zu Favoriten' }}
            </button>
            
            <button @click="updateProgress(book)" class="action-btn update-btn">
              <i class="fas fa-edit"></i> Fortschritt ändern
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

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
}

export default defineComponent({
  name: 'BookListView',
  data() {
    return {
      books: [] as Book[],
      searchTitle: '',
      searchGenre: '',
    }
  },
  methods: {
    requestBooks(): void {
      axios
        .get<Book[]>(apiEndpoint)
        .then((res) => {
          console.log('Bücher geladen:', res.data)
          this.books = res.data
        })
        .catch((error) => {
          console.error('Fehler beim Abrufen der Bücher:', error)
        })
    },
    
    loadAllBooks(): void {
      this.requestBooks()
    },
    
    async loadFavorites(): Promise<void> {
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/favorites`)
        this.books = response.data
        console.log('Favoriten geladen:', response.data)
      } catch (error) {
        console.error('Fehler beim Abrufen der Favoriten:', error)
      }
    },
    
    async searchByTitle(): Promise<void> {
      if (!this.searchTitle.trim()) {
        this.loadAllBooks()
        return
      }
      
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/title/${encodeURIComponent(this.searchTitle)}`)
        this.books = response.data
        console.log('Suchergebnisse (Titel):', response.data)
      } catch (error) {
        console.error('Fehler bei der Titelsuche:', error)
        this.books = []
      }
    },
    
    async searchByGenre(): Promise<void> {
      if (!this.searchGenre.trim()) {
        this.loadAllBooks()
        return
      }
      
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/genre/${encodeURIComponent(this.searchGenre)}`)
        this.books = response.data
        console.log('Suchergebnisse (Genre):', response.data)
      } catch (error) {
        console.error('Fehler bei der Genresuche:', error)
        this.books = []
      }
    },
    
    async toggleFavorite(book: Book): Promise<void> {
      try {
        const newFavoriteStatus = !book.favorite
        await axios.patch(`${apiEndpoint}/favorite/${book.id}?favorite=${newFavoriteStatus}`)
        book.favorite = newFavoriteStatus
        console.log(`Favoriten-Status geändert für "${book.title}": ${newFavoriteStatus}`)
      } catch (error) {
        console.error('Fehler beim Ändern des Favoriten-Status:', error)
      }
    },
    
    async updateProgress(book: Book): Promise<void> {
      const newProgress = prompt('Neuer Lesefortschritt (z.B. 75%, Seite 150, Kapitel 5):', book.readingProgress || '')
      if (newProgress === null) return
      
      try {
        await axios.patch(`${apiEndpoint}/progress/${book.id}?progress=${encodeURIComponent(newProgress)}`)
        book.readingProgress = newProgress
        console.log(`Fortschritt aktualisiert für "${book.title}": ${newProgress}`)
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Fortschritts:', error)
      }
    },
    
    getProgressPercentage(progress: string): number {
      if (!progress) return 0
      const match = progress.match(/(\d+)%/)
      return match ? parseInt(match[1]) : 0
    },
    
    goToBookDetail(bookId: number): void {
      this.$router.push(`/book/${bookId}`)
    },
  },
  mounted() {
    this.requestBooks()
  },
})
</script>

<style scoped>
.book-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

h2 {
  text-align: center;
  font-size: 32px;
  color: #333;
  margin-bottom: 40px;
}

.search-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.search-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-box h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 16px;
}

.search-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-field {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #5a6fd8;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.favorite-btn {
  background: #ffd700 !important;
  border-color: #ffd700 !important;
  color: #333 !important;
}

.favorite-btn:hover {
  background: #ffed4e !important;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0;
  list-style-type: none;
}

.book-item {
  margin: 0;
  padding: 0;
}

.book-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid #667eea;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.book-card.favorite {
  background: linear-gradient(135deg, #fff5cd, #ffeaa7);
  border-left-color: #fdcb6e;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.book-card h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 18px;
}

.author {
  margin: 0;
  color: #667eea;
  font-size: 14px;
}

.favorite-star {
  color: #fdcb6e;
  font-size: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.book-details p {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.progress-bar {
  flex: 1;
  background: #e2e8f0;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(135deg, #48bb78, #38a169);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-favorite-btn {
  background: #667eea;
  color: white;
}

.add-favorite-btn:hover {
  background: #5a6fd8;
}

.favorite-btn.action-btn {
  background: #ffd700;
  color: #333;
}

.favorite-btn.action-btn:hover {
  background: #ffed4e;
}

.update-btn {
  background: #48bb78;
  color: white;
}

.update-btn:hover {
  background: #38a169;
}

.no-books {
  text-align: center;
  font-size: 18px;
  color: #777;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 20px;
  border-radius: 10px;
}
</style>
