import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import EditBook from '../../views/EditBook.vue'
import { useRoute, useRouter } from 'vue-router'

vi.mock('axios')
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}))


vi.mock('../../components/DeleteConfirmation.vue', () => ({
  default: {
    name: 'DeleteConfirmation',
    template: '<div></div>',
    props: ['show'],
    emits: ['confirm', 'cancel']
  }
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

  

  it('should initialize empty form for new book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteNew as any)

    const wrapper = mount(EditBook)
    await flushPromises()
    
    const titleInput = wrapper.find('input[id="title"]')
    const authorInput = wrapper.find('input[id="author"]')
    
    expect(titleInput.element.value).toBe('')
    expect(authorInput.element.value).toBe('')
    expect(wrapper.text()).toContain('Add New Book')
  })

  it('should save new book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteNew as any)
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { id: 123 },
    })

    const wrapper = mount(EditBook)
    await flushPromises()
    
  
    const titleInput = wrapper.find('input[id="title"]')
    const authorInput = wrapper.find('input[id="author"]')
    const genreSelect = wrapper.find('select[id="genre"]')
    
    await titleInput.setValue('New Book')
    await authorInput.setValue('New Author')
    await genreSelect.setValue('Fiction')
    
   
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()
    
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
    vi.mocked(axios.get).mockResolvedValueOnce({
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
    vi.mocked(axios.put).mockResolvedValueOnce({})

    const wrapper = mount(EditBook)
    await flushPromises()
    
    const titleInput = wrapper.find('input[id="title"]')
    await titleInput.setValue('Updated Title')
    
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()
    
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
    vi.mocked(axios.get).mockResolvedValueOnce({
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

    const wrapper = mount(EditBook)
    await flushPromises()
    
    const deleteBtn = wrapper.find('.delete-btn')
    await deleteBtn.trigger('click')
    await flushPromises()
    
    
    const deleteConfirmation = wrapper.findComponent({ name: 'DeleteConfirmation' })
    expect(deleteConfirmation.exists()).toBe(true)
    expect(deleteConfirmation.props('show')).toBe(true)
  })

  it('should delete book', async () => {
    vi.mocked(useRoute).mockReturnValue(mockRouteEdit as any)
    vi.mocked(axios.get).mockResolvedValueOnce({
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
    vi.mocked(axios.delete).mockResolvedValueOnce({})

    const wrapper = mount(EditBook)
    await flushPromises()
    
   
    const deleteBtn = wrapper.find('.delete-btn')
    await deleteBtn.trigger('click')
    await flushPromises()
    
    
    const deleteConfirmation = wrapper.findComponent({ name: 'DeleteConfirmation' })
    await deleteConfirmation.vm.$emit('confirm')
    await flushPromises()
    
    expect(axios.delete).toHaveBeenCalledWith('https://booknestweb.onrender.com/books/157')
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })
})