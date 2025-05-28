<template>
  <div class="book-list-view">
    <h2>📚 Meine Bücher</h2>

    <div v-if="books.length === 0" class="no-books">
      <p>Keine Bücher gefunden.</p>
    </div>

    <ul v-else class="book-list">
      <li v-for="book in books" :key="book.id" class="book-item">
        <div class="book-card">
          <h3>{{ book.title }}</h3>
          <p><strong>Autor:</strong> {{ book.author }}</p>
          <p><strong>Genre:</strong> {{ book.genre }}</p>
          <p><strong>Kapitel:</strong> {{ book.chapters.length }}</p>
          <p><strong>Fortschritt:</strong> {{ book.readingProgress }}</p>
          <p><strong>Zusammenfassung:</strong> {{ book.summary }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL ??
                  'https://booknestweb3.onrender.com'
const apiEndpoint = https://booknestweb3.onrender.com/books

interface Book {
  id: number
  title: string
  author: string
  genre: string
  chapters: number[]
  summary: string
  readingProgress: string
}

export default defineComponent({
  name: 'BookListView',
  data() {
    return {
      books: [] as Book[],
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
  },
  mounted() {
    this.requestBooks()
  },
})
</script>

<style scoped>
.book-list-view {
  max-width: 900px;
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

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.book-card h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 20px;
}

.book-card p {
  margin: 6px 0;
  color: #555;
  font-size: 14px;
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
