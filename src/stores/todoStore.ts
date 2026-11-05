// src/stores/todoStore.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { todoService, type Todo } from '../services/todoService'

export const useTodoStore = defineStore('todo', () => {
  // ==========================================
  // 1. STATE (Данные)
  // ==========================================
  const todos = ref<Todo[]>([])
  const newTodoText = ref('')
  const newTodoDuration = ref('') // Примерное время выполнения (можно изменить по необходимости)
  const currentFilter = ref<'all' | 'active' | 'completed'>('all')

  // ==========================================
  // 2. ACTIONS (Методы)
  // ==========================================
  
  // Загрузка при старте
  async function loadTodos() {
    todos.value = await todoService.getTodos()
  }

  // Добавление
  function addTodo() {
    if (newTodoText.value.trim() === '') return
    
    todos.value.push({
      id: Date.now(),
      text: newTodoText.value.trim(),
      dateToComplete: new Date().toISOString().split('T')[0] ?? '', // Текущая дата в формате YYYY-MM-DD
      duration: newTodoDuration.value, // Примерное время выполнения (можно изменить по необходимости)
      done: false
    })
    newTodoText.value = '' // Очищаем поле ввода
    newTodoDuration.value = '00:00'
  }

  // Удаление
  function removeTodo(id: number) {
    todos.value = todos.value.filter(todo => todo.id !== id)
  }

  // Переключение галочки
  function toggleTodo(id: number) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.done = !todo.done
    }
  }

  // Смена фильтра
  function setFilter(filter: 'all' | 'active' | 'completed') {
    currentFilter.value = filter
  }

  // ==========================================
  // 3. GETTERS (Вычисляемые свойства)
  // ==========================================
  
  // Отфильтрованный список для отображения
  const filteredTodos = computed(() => {
    if (currentFilter.value === 'active') {
      return todos.value.filter(todo => !todo.done)
    }
    if (currentFilter.value === 'completed') {
      return todos.value.filter(todo => todo.done)
    }
    return todos.value
  })

  // ==========================================
  // 4. WATCHER (Автосохранение)
  // ==========================================
  // Следим за массивом todos и сохраняем при любом изменении
  watch(todos, async (newTodos) => {
    await todoService.saveTodos(newTodos)
  }, { deep: true })

  // Возвращаем всё, что должно быть доступно компонентам
  return {
    todos,
    newTodoText,
    currentFilter,
    filteredTodos,
    loadTodos,
    addTodo,
    removeTodo,
    toggleTodo,
    setFilter,
    newTodoDuration
  }
})