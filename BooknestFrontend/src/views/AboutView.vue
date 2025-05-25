<template>
  <div class="book-list-view">
    <h2>Meine Bücher</h2>
    <div v-if="books.length === 0" class="no-books">
      <p>Keine Bücher gefunden.</p>
    </div>
    <ul v-else>
      <li v-for="book in books" :key="book.id" class="book-item">
        <h3>{{ book.title }}</h3>
        <p><strong>Autor:</strong> {{ book.author }}</p>
        <p><strong>Genre:</strong> {{ book.genre }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const apiEndpoint = `${baseURL}/books`;

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
}

export default defineComponent({
  name: 'BookListView',
  data() {
    return {
      books: [] as Book[],
    };
  },
  mounted() {
    fetch(apiEndpoint)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Fehler beim Laden: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.books = data;
      })
      .catch(error => {
        console.error("Fehler beim Abrufen der Bücher:", error);
      });
  },
});
</script>
