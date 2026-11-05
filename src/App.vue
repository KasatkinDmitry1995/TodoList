<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTodoStore } from './stores/todoStore'
import TimePicker from './components/TimePicker.vue'

const store = useTodoStore()

// Достаем реактивные данные для шаблона
// (методы можно использовать напрямую через store.methodName)
const { newTodoText, filteredTodos, currentFilter, newTodoDuration } = storeToRefs(store)

// Запускаем загрузку данных при старте
onMounted(() => {
  store.loadTodos()
})

function formatDuration(durationStr: string) {
  if (!durationStr || durationStr === '00:00') return ''
  
  const [hStr, mStr] = durationStr.split(':') as [string, string]
  const h = parseInt(hStr, 10) || 0
  const m = parseInt(mStr, 10) || 0
  
  const parts = []

  if (h > 0) parts.push(`${h}ч`)
  if (m > 0) parts.push(`${m}м`)
  
  return parts.join(' ')
}

</script>

<template>
  <div id="main">
    <h1>Список задач</h1>
    <div id="input-container">
      <input v-model="newTodoText" placeholder="Введи новую зачдчу..." />
      <TimePicker v-model="newTodoDuration" />
      <button @click="store.addTodo">Добавить</button>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
      <button 
        @click="store.setFilter('all')" 
        :class="{ active: currentFilter === 'all' }"
      >Все</button>
      <button 
        @click="store.setFilter('active')" 
        :class="{ active: currentFilter === 'active' }"
      >Активные</button>
      <button 
        @click="store.setFilter('completed')" 
        :class="{ active: currentFilter === 'completed' }"
      >Выполненные</button>
    </div>

    <ul id="todo-list">
      <li class="todo-item" v-for="todo in filteredTodos" :key="todo.id" :class="{ 'completed': todo.done }">
        <input type="checkbox" v-model="todo.done" />
        <span class="todo-text">{{ todo.text }}</span>
        <span v-if="todo.duration !== '00:00'" class="todo-duration">
            ⏱ {{ formatDuration(todo.duration) }}
        </span>
        <button class="delete-btn" @click="store.removeTodo(todo.id)" title="Удалить задачу">
          &times;
        </button>
      </li>
    </ul>

    <p v-if="filteredTodos.length === 0" style="color: gray;">
      Список пуст. Добавьте новую задачу или измените фильтр, чтобы увидеть задачи.
    </p>

  </div>  
</template>

<style scoped>
  #main {
    max-width: var(--main-width);
    margin: var(--spacing-md) auto;
    font-family: Arial, sans-serif;
    color: var(--color-text-main);
  }
  #input-container {
    display: flex;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-md);
  }
  #input-container input {
    flex-grow: 1;
    padding: var(--spacing-sm);
    font-size: var(--font-size-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }
  #input-container button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-md)  ;
    cursor: pointer;
  }
  #todo-list {
    list-style: none;
    padding-left: 0;
  }
  .todo-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm); border: 1px solid var(--color-border); margin-bottom: var(--spacing-sm); background: var(--color-bg-secondary);
    justify-content: space-between;
    border-radius: var(--radius-md);
  }
  .todo-item .todo-text {
    flex-grow: 1;
    margin-left: var(--spacing-sm);
  }
  .completed {
    background-color: var(--color-primary)!important; /* Светло-зеленый фон для выполненных задач */
    border: 1px solid var(--color-primary-hover);
  }
  .delete-btn {
    background: none;      /* Убираем серый фон */
    border: none;          /* Убираем рамку */
    color: var(--color-text-muted);           /* Делаем крестик серым (чтобы не отвлекал внимание) */
    font-size: var(--font-size-md);       /* Делаем его крупным */
    line-height: 1;        /* Выравниваем по высоте */
    cursor: pointer;       /* При наведении мышь становится "рукой" */
    padding: 0 var(--spacing-sm);        /* Небольшой отступ для удобного клика */
    transition: color 0.2s; /* Плавное изменение цвета при наведении */
  }

/* Эффект при наведении мыши */
  .delete-btn:hover {
    color:var(--color-danger);        /* Крестик становится красным */
  }

  button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-main);
  color: var(--color-text-main);
  border-radius: var(--radius-md); /* Вот оно, скругление! */
  cursor: pointer;
  transition: all 0.2s ease; /* Плавная смена цвета */
  font-family: inherit; /* Чтобы шрифт совпадал с остальным текстом */
}

  /* Стили для кнопок фильтра */
button.active {
  background: var(--color-primary);
  border: 1px solid var(--color-primary-hover);
}

.todo-duration {
  font-size: var(--font-size-sm);
  color: var(--color-text-main);
  background: var(--color-bg-main);
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-right: var(--spacing-sm);
  white-space: nowrap;
}

</style>
