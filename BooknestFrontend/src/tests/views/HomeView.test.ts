import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import HomeView from '../../views/HomeView.vue'
import { useRouter } from 'vue-router'

vi.mock('axios')
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}))

describe('HomeView', () => {
  const mockRouter = {
    push: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.clearAllMocks()
  })

  it('should display books when loaded', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: '1984',
          author: 'George Orwell',
          genre: 'Dystopian',
          chapters: [1, 2, 3],
          summary: 'A dystopian novel',
          readingProgress: '0%',
          favorite: true,
        },
        {
          id: 2,
          title: 'Animal Farm',
          author: 'George Orwell',
          genre: 'Political Satire',
          chapters: [1, 2, 3, 4, 5, 6, 7],
          summary: 'Farm animals rebel',
          readingProgress: '0%',
          favorite: false,
        }
      ],
    })

    const wrapper = shallowMount(HomeView)

    await flushPromises()
    
    const bookCards = wrapper.findAll('.book-card')
    expect(bookCards).toHaveLength(2)
    expect(wrapper.find('.book-title').text()).toBe('1984')
  })

  it('should filter books by genre', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Fantasy Book',
          author: 'Fantasy Author',
          genre: 'Fantasy',
          chapters: [],
          summary: '',
          readingProgress: '0%',
          favorite: false,
        }
      ],
    })

    const wrapper = shallowMount(HomeView)

    await wrapper.vm.filterByGenre('Fantasy')
    await flushPromises()
    
    expect(axios.get).toHaveBeenCalledWith('https://booknestweb.onrender.com/books/genre/Fantasy')
    expect(wrapper.vm.selectedGenre).toBe('Fantasy')
    expect(wrapper.vm.currentFilter).toBe('genre')
  })

  it('should perform search by title', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Animal Farm',
          author: 'George Orwell',
          genre: 'Political Satire',
          chapters: [],
          summary: '',
          readingProgress: '0%',
          favorite: false,
        }
      ],
    })

    const wrapper = shallowMount(HomeView)

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Animal Farm')
    await searchInput.trigger('keyup.enter')
    
    await flushPromises()
    
    expect(axios.get).toHaveBeenCalledWith('https://booknestweb.onrender.com/books/title/Animal%20Farm')
  })

  it('should show no books message when empty', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [],
    })

    const wrapper = shallowMount(HomeView)

    await flushPromises()
    
    expect(wrapper.find('.no-books').exists()).toBe(true)
    expect(wrapper.find('.empty-icon').text()).toBe('🌟')
  })

  it('should close genre modal when clicking outside', async () => {
    const wrapper = shallowMount(HomeView)

    await wrapper.vm.showGenreModal()
    expect(wrapper.vm.isGenreModalOpen).toBe(true)
    
    const modalOverlay = wrapper.find('.genre-modal-overlay')
    await modalOverlay.trigger('click')
    
    expect(wrapper.vm.isGenreModalOpen).toBe(false)
  })

  it('should clear genre filter', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: [] })

    const wrapper = shallowMount(HomeView)

    await wrapper.vm.clearGenreFilter()
    
    expect(wrapper.vm.selectedGenre).toBe('')
    expect(wrapper.vm.isGenreModalOpen).toBe(false)
    expect(axios.get).toHaveBeenCalledWith('https://booknestweb.onrender.com/books')
  })

  it('should calculate progress percentage correctly', () => {
    const wrapper = shallowMount(HomeView)

    expect(wrapper.vm.getProgressPercentage('74%')).toBe(74)
    expect(wrapper.vm.getProgressPercentage('0%')).toBe(0)
    expect(wrapper.vm.getProgressPercentage('100%')).toBe(100)
    expect(wrapper.vm.getProgressPercentage('')).toBe(0)
  })

 
})