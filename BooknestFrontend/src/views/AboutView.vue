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
      books: [
        { id: 1, title: 'Der Herr der Ringe', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
        { id: 2, title: '1984', author: 'George Orwell', genre: 'Dystopie' },
        { id: 3, title: 'Die Unendliche Geschichte', author: 'Michael Ende', genre: 'Fantasy' },
      ] as Book[], 
    };
  },
});
</script>

<style scoped>
.book-list-view {
  font-family: Arial, sans-serif;
  padding: 20px;
}

h2 {
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

.book-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-item h3 {
  margin: 0 0 10px 0;
  color: black;  /* Setzt den Text auf schwarz */
  background-color: white;  /* Weißer Hintergrund */
  padding: 5px;  /* Etwas Padding, um den Text vom Rand zu trennen */
  border-radius: 5px;  /* Abgerundete Ecken */
}


.book-item p {
 color: black;  /* Setzt den Text auf schwarz */
  background-color: white;  /* Weißer Hintergrund */
  padding: 5px;  /* Etwas Padding, um den Text vom Rand zu trennen */
  border-radius: 5px;  /* Abgerundete Ecken */
}

.book-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.no-books {
  text-align: center;
  font-size: 18px;
  color: #555;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 5px;
}
</style>
