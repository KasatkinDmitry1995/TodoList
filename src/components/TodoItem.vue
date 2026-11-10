<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Todo } from '../services/todoService'
import { useTodoStore } from '../stores/todoStore';
import { vFocus } from '../directives/focus'
import {Pencil, Trash, CirclePlus, Circle, CircleCheckBig, Clock10, Check, X} from '@lucide/vue'

// Компонент принимает одну задачу
const props = defineProps<{ todo: Todo }>()

const todoStore = useTodoStore()

const subtasks = computed(() => {
  return todoStore.subtasksByParentId(props.todo.id)
})

const isAddingSubtask = ref(false)
const isEditing = ref(false)
const editText = ref('')
const subtaskText = ref('')

function saveSubtask() {
  if (subtaskText.value.trim() === '') {
    isAddingSubtask.value = false
    return
  }

  // Вызываем addTodo из Pinia, передавая parentId!
  todoStore.addTodo({
    text: subtaskText.value.trim(),
    duration: '00:00', 
    parentId: props.todo.id, // <-- Вот тут связываем
    date: undefined           // У подзадачи нет своей даты
  })

  subtaskText.value = ''
  isAddingSubtask.value = false
}

function startEdit()
{
  isEditing.value = true
  editText.value = props.todo.text
}

function saveEdit()
{
  if(editText.value === '') return

  todoStore.updateTodo(props.todo.id, editText.value)
  isEditing.value = false
}

function cancelEdit()
{
  isEditing.value = false
  editText.value = ''
}

// И сообщает родителю, что с ней хотят сделать
const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'remove', id: number): void
}>()

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
    <li class="todo-wrapper">
      <div class="todo-item" :class="{ 'completed': todo.done }">
        <label class="checkbox-wrapper">
          <input 
              type="checkbox" 
              :checked="todo.done" 
              @change="emit('toggle', todo.id)"
              class="sr-only"/>
          <span class="-btn">
            <Circle v-show="!todo.done" />
            <CircleCheckBig v-show="todo.done" />
          </span>
        </label>

        <span class="todo-text">
          <input
            v-if="isEditing"
            v-model="editText"
            v-focus
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            class="edit-input"
          />
          <template v-else>{{ todo.text }}</template>
        </span>

        <span v-if="todo.duration !== '00:00'" class="todo-duration">
            <Clock10 :strokeWidth="1.2"/> 
            <span>{{ formatDuration(todo.duration) }}</span>
        </span>
        <button
          v-if="!isEditing"
          class="edit-icon-btn"
          title="Редактировать"
          @click="startEdit"
        >
          <Pencil />
        </button>
        <template v-else>
          <button
            class="save-icon-btn"
            title="Сохранить"
            @click="saveEdit"
          >
            <Check />
          </button>
          <button
            class="cancel-icon-btn"
            title="Отмена"
            @click="cancelEdit"
          >
            <X />
          </button>
        </template>
        <button v-if="!isAddingSubtask" @click="isAddingSubtask = true" class="add-sub-icon-btn" title="Добавить подзадачу">
          <CirclePlus />
        </button>
        <button class="delete-icon-btn" @click="emit('remove', todo.id)">
          <Trash />
        </button>
        
      </div>

      <div v-if="isAddingSubtask" class="subtask-form">
        <input 
          v-model="subtaskText" 
          v-focus
          @keyup.enter="saveSubtask"
          placeholder="Что нужно сделать внутри этой задачи?" 
          class="subtask-input"
        />
        <button @click="saveSubtask" class="save-icon-btn">OK</button>
        <button @click="isAddingSubtask = false; subtaskText = ''" class="cancel-icon-btn">Отмена</button>
      </div>

      <ul v-if="subtasks.length > 0" class="subtasks-list">
        <TodoItem 
          v-for="sub in subtasks" 
          :key="sub.id" 
          :todo="sub"
          @toggle="emit('toggle', $event)"
          @remove="emit('remove', $event)"
        />
      </ul>

    </li>
</template>

<style scoped>

/* ===== Кнопки-иконки ===== */
[class$="-btn"],
[class*="-btn "] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  transition: background-color 0.2s, color 0.2s;
}

[class$="-btn"]:hover,
[class*="-btn "]:hover {
  color: var(--color-secondary);
}

/* ===== Чекбокс ===== */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== Элемент списка ===== */
.todo-wrapper {
  list-style: none;
  margin-bottom: var(--spacing-xs);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s, border-color 0.2s;
  color: var(--color-text-main);
}

.todo-item .todo-text {
  flex-grow: 1;
  margin-left: 0; /* отступ теперь через gap */
}

/* ===== Выполненная задача ===== */
.todo-item.completed {
  --btn-color: var(--color-white);
  --btn-color-hover: var(--color-white);
  --color-text-main: var(--color-white);
  --color-text-muted: var(--color-white);
  background-color: var(--color-primary);
  border-color: var(--color-primary-hover);
}

.todo-item.completed [class$="-btn"],
.todo-item.completed [class*="-btn "] {
  color: var(--btn-color);
}

.todo-item.completed [class$="-btn"]:hover,
.todo-item.completed [class*="-btn "]:hover {
  color: var(--btn-color-hover);
  background: transparent;
  opacity: 0.8;
}

/* ===== Длительность ===== */
.todo-duration {
  font-size: var(--font-size-sm);
  padding: 2px var(--spacing-xs);
  display:inline-flex;
  white-space: nowrap;
  align-items: center;
}

/* ===== Подзадачи ===== */
.subtasks-list {
  margin-left: var(--spacing-md);
  margin-top: var(--spacing-xs);
  padding-left: var(--spacing-sm);
  border-left: 2px solid var(--color-border);
}

.subtask-form {
  display: flex;
  gap: var(--spacing-sm);
  margin-left: 30px;
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-bg-main);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.subtask-input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-md);
  background: var(--color-bg-main);
}

</style>