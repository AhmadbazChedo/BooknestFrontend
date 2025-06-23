import { createRouter, createWebHistory } from 'vue-router'
import Bookview from '@/views/Bookview.vue'
import NewBook from '@/views/NewBook.vue'

const routes = [
  { path: '/', component: Bookview },
  { path: '/books', component: Bookview },
  { path: '/newbook', component: NewBook }, 
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
