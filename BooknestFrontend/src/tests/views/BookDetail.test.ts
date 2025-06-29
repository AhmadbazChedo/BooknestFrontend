import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import BookDetail from '../../views/BookDetail.vue'
import { useRoute, useRouter } from 'vue-router'

vi.mock('axios')
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}))

describe('BookDetail', () => {
  const mockRoute = {
    params: {
      id: '157',
    },
  }

  const mockRouter = {
    push: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue(mockRoute as any)
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.clearAllMocks()
  })

  it('should display book details when loaded', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Animal Farm',
        author: 'George Orwell',
        genre: 'Political Satire',
        chapters: [1, 2, 3, 4, 5, 6, 7],
        summary: 'A group of farm animals rebel against their human farmer, hoping to create a society where all animals are equal',
        readingProgress: '0%',
        favorite: true,
        coverImage: 'https://example.com/animal-farm.jpg',
      },
    })

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    expect(wrapper.find('.book-title').text()).toBe('Animal Farm')
    expect(wrapper.find('.book-author').text()).toBe('by George Orwell')
    expect(wrapper.find('.genre-badge').text()).toBe('Political Satire')
    expect(wrapper.find('.favorite-indicator').exists()).toBe(true)
  })

  it('should display progress bar with correct percentage', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        chapters: [],
        summary: '',
        readingProgress: '74%',
        favorite: false,
      },
    })

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    const progressText = wrapper.find('.progress-text')
    expect(progressText.text()).toBe('74%')
    
    const progressFill = wrapper.find('.progress-fill')
    expect(progressFill.attributes('style')).toContain('width: 74%')
  })

  
  it('should toggle favorite status when favorite button clicked', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        chapters: [],
        summary: '',
        readingProgress: '0%',
        favorite: false,
      },
    })

    vi.mocked(axios, true).put.mockResolvedValueOnce({})

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    const favoriteBtn = wrapper.find('.favorite-btn')
    expect(favoriteBtn.text()).toContain('Add to Favorites')
    
    await favoriteBtn.trigger('click')
    await flushPromises()
    
    expect(axios.put).toHaveBeenCalledWith(
      'https://booknestweb.onrender.com/books/157',
      expect.objectContaining({ favorite: true })
    )
  })

  it('should navigate to edit page when edit button clicked', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        chapters: [],
        summary: '',
        readingProgress: '0%',
        favorite: false,
      },
    })

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    const editBtn = wrapper.find('.edit-btn')
    expect(editBtn.attributes('to')).toBe('/edit/157')
  })

  it('should handle search functionality', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        chapters: [],
        summary: '',
        readingProgress: '0%',
        favorite: false,
      },
    })

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Animal Farm')
    await searchInput.trigger('keyup.enter')
    
    expect(mockRouter.push).toHaveBeenCalledWith('/?search=Animal%20Farm')
  })

  it('should display chapters when available', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        chapters: [1, 2, 3, 4, 5],
        summary: 'Test summary',
        readingProgress: '0%',
        favorite: false,
      },
    })

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    const chapterBadges = wrapper.findAll('.chapter-badge')
    expect(chapterBadges).toHaveLength(5)
    expect(chapterBadges[0].text()).toBe('Chapter 1')
    expect(chapterBadges[4].text()).toBe('Chapter 5')
  })

  it('should redirect to home when book not found', async () => {
    vi.mocked(axios, true).get.mockRejectedValueOnce(new Error('Book not found'))

    const wrapper = shallowMount(BookDetail)

    await flushPromises()
    
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('should show loading state initially', () => {
    const wrapper = shallowMount(BookDetail)
    
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })
})