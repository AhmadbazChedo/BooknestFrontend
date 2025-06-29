import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import EditBook from '../../views/EditBook.vue'
import { useRoute, useRouter } from 'vue-router'

vi.mock('axios')
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}))

describe('EditBook', () => {
  const mockRouteEdit = {
    params: {
      id: '157',
    },
  }

  const mockRouteNew = {
    params: {},
  }

  const mockRouter = {
    push: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.clearAllMocks()
  })

  it('should load existing book for editing', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteEdit as any)
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Animal Farm',
        author: 'George Orwell',
        genre: 'Political Satire',
        chapters: [1, 2, 3, 4, 5, 6, 7],
        summary: 'Farm animals rebel',
        readingProgress: '0%',
        favorite: false,
        coverImage: 'https://example.com/cover.jpg',
      },
    })

    const wrapper = shallowMount(EditBook)

    await flushPromises()
    
    expect(wrapper.vm.formData.title).toBe('Animal Farm')
    expect(wrapper.vm.formData.author).toBe('George Orwell')
    expect(wrapper.vm.formData.genre).toBe('Political Satire')
    expect(wrapper.vm.isNewBook).toBe(false)
  })

  it('should initialize empty form for new book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteNew as any)

    const wrapper = shallowMount(EditBook)

    await flushPromises()
    
    expect(wrapper.vm.formData.title).toBe('')
    expect(wrapper.vm.formData.author).toBe('')
    expect(wrapper.vm.isNewBook).toBe(true)
  })

  it('should save new book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteNew as any)
    vi.mocked(axios, true).post.mockResolvedValueOnce({
      data: { id: 123 },
    })

    const wrapper = shallowMount(EditBook)

    await wrapper.vm.$nextTick()
    
    wrapper.vm.formData.title = 'New Book'
    wrapper.vm.formData.author = 'New Author'
    wrapper.vm.formData.genre = 'Fiction'
    
    await wrapper.vm.saveBook()
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://booknestweb.onrender.com/books',
      expect.objectContaining({
        title: 'New Book',
        author: 'New Author',
        genre: 'Fiction',
      })
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/book/123')
  })

  it('should update existing book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteEdit as any)
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: 157,
        title: 'Animal Farm',
        author: 'George Orwell',
        genre: 'Political Satire',
        chapters: [],
        summary: '',
        readingProgress: '0%',
        favorite: false,
      },
    })
    vi.mocked(axios, true).put.mockResolvedValueOnce({})

    const wrapper = shallowMount(EditBook)

    await flushPromises()
    
    wrapper.vm.formData.title = 'Updated Title'
    
    await wrapper.vm.saveBook()
    
    expect(axios.put).toHaveBeenCalledWith(
      'https://booknestweb.onrender.com/books/157',
      expect.objectContaining({
        title: 'Updated Title',
      })
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/book/157')
  })

  it('should show delete confirmation modal', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteEdit as any)
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

    const wrapper = shallowMount(EditBook)

    await flushPromises()
    
    await wrapper.vm.showDeleteConfirmation()
    
    expect(wrapper.vm.showDeleteModal).toBe(true)
  })

  it('should delete book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteEdit as any)
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
    vi.mocked(axios, true).delete.mockResolvedValueOnce({})

    const wrapper = shallowMount(EditBook)

    await flushPromises()
    
    await wrapper.vm.confirmDelete()
    
    expect(axios.delete).toHaveBeenCalledWith('https://booknestweb.onrender.com/books/157')
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

 
})