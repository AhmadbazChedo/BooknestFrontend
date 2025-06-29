<template>
  <div class="new-book-view">
    
    <div class="header">
      <router-link to="/" class="back-btn">
        Back to Books
      </router-link>
      <h1 class="page-title">Add New Book</h1>
    </div>

   
    <div class="form-container">
      <div class="book-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            v-model="newBook.title"
            type="text"
            placeholder="Enter book title"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="author">Author</label>
          <input
            id="author"
            v-model="newBook.author"
            type="text"
            placeholder="Enter author name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="genre">Genre</label>
          <input
            id="genre"
            v-model="newBook.genre"
            type="text"
            placeholder="Enter genre"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="chapters">Chapters</label>
          <input
            id="chapters"
            v-model="chaptersInput"
            type="text"
            placeholder="e.g. 1,2,3,4,5"
            class="form-input"
          />
          <small class="form-hint"
            >Enter chapter numbers separated by commas</small
          >
        </div>

        <div class="form-group">
          <label for="progress">Reading Progress</label>
          <input
            id="progress"
            v-model="newBook.readingProgress"
            type="text"
            placeholder="e.g. 25%, Page 150, Chapter 3"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="summary">Summary</label>
          <textarea
            id="summary"
            v-model="newBook.summary"
            placeholder="Enter a brief summary of the book"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="newBook.favorite"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            Mark as favorite
          </label>
        </div>

        <div class="form-actions">
          <button
            @click="addBook"
            class="add-btn"
            :disabled="!isFormValid"
          >
            Add Book
          </button>
          <router-link to="/" class="cancel-btn">
            Cancel
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

const baseURL = import.meta.env.VITE_APP_BACKEND_BASE_URL ??
                  'https://booknestweb.onrender.com'
const apiEndpoint = baseURL + '/books'

interface Book {
  title: string
  author: string
  genre: string
  chapters: number[]
  summary: string
  readingProgress: string
  favorite: boolean
}

export default defineComponent({
  name: 'NewBook',
  data() {
    return {
      newBook: {
        title: '',
        author: '',
        genre: '',
        chapters: [] as number[],
        summary: '',
        readingProgress: '',
        favorite: false
      } as Book,
      chaptersInput: ''
    }
  },
  computed: {
    isFormValid(): boolean {
      return this.newBook.title.trim() !== '' && 
             this.newBook.author.trim() !== '' && 
             this.newBook.genre.trim() !== ''
    }
  },
  methods: {
    async addBook(): Promise<void> {
      if (!this.isFormValid) return

    
      let processedChapters: number[] = []
      if (this.chaptersInput && this.chaptersInput.trim()) {
        processedChapters = this.chaptersInput
          .split(',')
          .map(ch => {
            const trimmed = ch.trim()
            const parsed = parseInt(trimmed)
            return isNaN(parsed) ? 0 : parsed
          })
          .filter(ch => ch > 0) 
      }
      
      const bookData = {
        ...this.newBook,
        chapters: processedChapters
      }
      
      console.log('Adding book with data:', bookData) 

      try {
        const response = await axios.post(apiEndpoint, bookData)
        console.log('Book added successfully:', response.data)
        
        
        this.newBook = {
          title: '',
          author: '',
          genre: '',
          chapters: [],
          summary: '',
          readingProgress: '',
          favorite: false
        }
        this.chaptersInput = ''
        
        this.$router.push('/')
      } catch (error) {
        console.error('Error adding book:', error)
        if (axios.isAxiosError(error)) {
          console.error('Error details:', error.response?.data)
          alert(`Error adding book: ${error.response?.data?.message || error.message}`)
        } else {
          alert(`Error adding book: ${String(error)}`)
        }
      }
    }
  }
})
</script>

<style scoped>
.new-book-view {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.header {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  text-align: center;
}

.back-btn {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  margin-bottom: 20px;
  align-self: flex-start;
}

.back-btn:hover {
  color: #5a6fd8;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.form-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.book-form {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #888;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #888;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  position: relative;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.add-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.add-btn:disabled {
  background: #444;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-btn {
  background: transparent;
  color: #888;
  border: 1px solid #444;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.cancel-btn:hover {
  background: #444;
  color: #ffffff;
}


@media (max-width: 768px) {
  .new-book-view {
    padding: 20px 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .book-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .book-form {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}
</style>