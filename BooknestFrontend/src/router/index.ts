import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookDetail from '../views/BookDetail.vue'
import EditBook from '../views/EditBook.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/book/:id',
      name: 'BookDetail',
      component: BookDetail
    },
    {
      path: '/edit/:id',
      name: 'EditBook',
      component: EditBook
    },
    {
      path: '/newbook',
      name: 'NewBook',
      component: EditBook
    }
  ]
})

export default router
