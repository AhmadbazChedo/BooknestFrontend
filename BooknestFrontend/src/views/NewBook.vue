<template>
  <div class="book-list-view">
    <h2>📚 Meine Bücher</h2>

    <form @submit.prevent="addBook" class="book-form">
      <input v-model="newBook.title" placeholder="Titel" required />
      <input v-model="newBook.author" placeholder="Autor" required />
      <input v-model="newBook.genre" placeholder="Genre" required />
      <input v-model.number="chapterCount" type="number" min="1" placeholder="Kapitelanzahl" required />
      <input v-model="newBook.readingProgress" placeholder="Fortschritt (z.B. 0%)" required />
      <textarea v-model="newBook.summary" placeholder="Zusammenfassung" required></textarea>
      <button type="submit" class="add-book-btn">Buch hinzufügen</button>
    </form>

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
          <button class="delete-btn" @click="confirmDelete(book.id)" title="Buch löschen">
            <svg class="trash-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M3 6h18v2H3V6zm2 3h14l-1.5 13h-11L5 9zm5 2v7h2v-7h-2zm-4 0v7h2v-7H6zm8 0v7h2v-7h-2z"/>
            </svg>
          </button>
        </div>
      </li>
    </ul>

 
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="confirm-box">
        <p>Willst du das Buch wirklich löschen?</p>
        <button @click="deleteBook(confirmedId)" class="yes-btn">Ja</button>
        <button @click="showConfirm = false" class="no-btn">Nein</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL 
const apiEndpoint = baseURL + '/books'

export default defineComponent({
  data() {
    return {
      books: [] as Array<any>,
      newBook: {
        title: '',
        author: '',
        genre: '',
        chapters: [] as number[],
        summary: '',
        readingProgress: '',
      },
      chapterCount: 1,
      showConfirm: false,
      confirmedId: null as number | null,
    }
  },
  methods: {
    requestBooks(): void {
      axios
        .get(apiEndpoint)
        .then((res) => {
          this.books = res.data
        })
        .catch((error) => {
          console.error('Fehler beim Abrufen der Bücher:', error)
        })
    },
    async addBook() {
     
      this.newBook.chapters = Array.from({ length: this.chapterCount }, (_, i) => i + 1)
      try {
        const res = await axios.post(apiEndpoint, this.newBook)
        this.books.push(res.data)
 
        this.newBook = {
          title: '',
          author: '',
          genre: '',
          chapters: [],
          summary: '',
          readingProgress: '',
        }
        this.chapterCount = 1
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Buchs:', error)
      }
    },
    confirmDelete(id: number) {
      this.confirmedId = id
      this.showConfirm = true
    },
    async deleteBook(id: number | null) {
      if (id === null) return
      try {
        await axios.delete(`${apiEndpoint}/${id}`)
        this.books = this.books.filter(book => book.id !== id)
      } catch (error) {
        console.error('Fehler beim Löschen des Buchs:', error)
      } finally {
        this.showConfirm = false
        this.confirmedId = null
      }
    },
  },
  mounted() {
    this.requestBooks()
  }
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

.book-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto 30px auto;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.book-form input,
.book-form textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 15px;
}
.book-form textarea {
  resize: vertical;
  min-height: 60px;
}
.add-book-btn {
  margin: 0;
  display: block;
  padding: 10px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-book-btn:hover {
  background-color: #388e3c;
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
.delete-btn {
  margin-top: 12px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: border 0.2s, background 0.2s;
}
.delete-btn .trash-icon {
  color: #e53935;
  width: 20px;
  height: 20px;
  transition: color 0.2s, filter 0.2s;
}
.delete-btn:hover {
  border: 2px solid #e53935;
  background: #fff;
}
.delete-btn:hover .trash-icon {
  filter: invert(1) grayscale(1) brightness(0.7);
}

.confirm-dialog {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.confirm-box {
  background: #fff;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  text-align: center;
  color: #111;
}
.yes-btn, .no-btn {
  margin: 10px 12px 0 12px;
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
}
.yes-btn {
  background: #e53935;
  color: #fff;
}
.no-btn {
  background: #eee;
  color: #333;
}
.yes-btn:hover {
  background: #b71c1c;
}
.no-btn:hover {
  background: #ccc;
}
</style>