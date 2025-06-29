<template>
  <div class="search-view">
    <h2>🔍 Bücher durchsuchen</h2>
    
    <div class="search-container">
      <div class="search-box">
        <h3><i class="fas fa-heading"></i> Nach Titel suchen</h3>
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
        <h3><i class="fas fa-star"></i> Spezialfilter</h3>
        <div class="filter-buttons">
          <button @click="loadFavorites" class="filter-btn favorite-btn">
            <i class="fas fa-star"></i> Nur Favoriten
          </button>
          <button @click="clearSearch" class="filter-btn">
            <i class="fas fa-refresh"></i> Zurücksetzen
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length === 0 && hasSearched" class="no-results">
      <i class="fas fa-search"></i>
      <h3>Keine Ergebnisse gefunden</h3>
      <p>Versuche andere Suchbegriffe oder überprüfe die Schreibweise.</p>
    </div>

    <div v-if="searchResults.length > 0" class="results-info">
      <p>{{ searchResults.length }} Buch(ü)er gefunden</p>
    </div>

    <ul v-if="searchResults.length > 0" class="book-list">
      <li v-for="book in searchResults" :key="book.id" class="book-item">
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
            <p v-if="book.summary"><strong>Zusammenfassung:</strong> {{ book.summary }}</p>
          </div>
          
          <div class="book-actions">
            <button 
              @click="toggleFavorite(book)"
              :class="['action-btn', book.favorite ? 'favorite-btn' : 'add-favorite-btn']"
            >
              <i :class="['fas', book.favorite ? 'fa-star' : 'fa-star-o']"></i>
              {{ book.favorite ? 'Favorit' : 'Favorit +' }}
            </button>
            
            <button @click="updateProgress(book)" class="action-btn update-btn">
              <i class="fas fa-edit"></i> Fortschritt
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
  name: 'SearchView',
  data() {
    return {
      searchTitle: '',
      searchGenre: '',
      searchResults: [] as Book[],
      hasSearched: false,
    }
  },
  methods: {
    async searchByTitle(): Promise<void> {
      if (!this.searchTitle.trim()) return
      
      this.hasSearched = true
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/title/${encodeURIComponent(this.searchTitle)}`)
        this.searchResults = response.data
        console.log('Suchergebnisse (Titel):', response.data)
      } catch (error) {
        console.error('Fehler bei der Titelsuche:', error)
        this.searchResults = []
      }
    },
    
    async searchByGenre(): Promise<void> {
      if (!this.searchGenre.trim()) return
      
      this.hasSearched = true
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/genre/${encodeURIComponent(this.searchGenre)}`)
        this.searchResults = response.data
        console.log('Suchergebnisse (Genre):', response.data)
      } catch (error) {
        console.error('Fehler bei der Genresuche:', error)
        this.searchResults = []
      }
    },
    
    async loadFavorites(): Promise<void> {
      this.hasSearched = true
      try {
        const response = await axios.get<Book[]>(`${apiEndpoint}/favorites`)
        this.searchResults = response.data
        console.log('Favoriten geladen:', response.data)
      } catch (error) {
        console.error('Fehler beim Abrufen der Favoriten:', error)
        this.searchResults = []
      }
    },
    
    clearSearch(): void {
      this.searchTitle = ''
      this.searchGenre = ''
      this.searchResults = []
      this.hasSearched = false
    },
    
    async toggleFavorite(book: Book): Promise<void> {
      try {
        const newFavoriteStatus = !book.favorite
        await axios.patch(`${apiEndpoint}/favorite/${book.id}?favorite=${newFavoriteStatus}`)
        book.favorite = newFavoriteStatus
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
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Fortschritts:', error)
      }
    },
    
    goToBookDetail(bookId: number): void {
      this.$router.push(`/book/${bookId}`)
    },
  }
})
</script>

<style scoped>
.search-view {
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

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-results i {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.results-info {
  margin-bottom: 20px;
  color: #666;
  font-weight: 500;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0;
  list-style-type: none;
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
}

.book-details p {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
}

.book-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-favorite-btn {
  background: #667eea;
  color: white;
}

.favorite-btn.action-btn {
  background: #ffd700;
  color: #333;
}

.update-btn {
  background: #48bb78;
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
</style>