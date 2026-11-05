<script setup lang="ts">
import { computed } from 'vue'

// Принимаем модель в формате "HH:mm" (например, "01:30" = 1 час 30 минут)
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Разбиваем строку на часы и минуты
const getTimeParts = () => {
  const [hoursPart = '0', minutesPart = '0'] = (props.modelValue ?? '00:00').split(':')
  return {
    hours: Number(hoursPart),
    minutes: Number(minutesPart)
  }
}

const hours = computed({
  get: () => getTimeParts().hours,
  set: (val) => updateValue(val, minutes.value)
})

const minutes = computed({
  get: () => getTimeParts().minutes,
  set: (val) => updateValue(hours.value, val)
})

function updateValue(h: number, m: number) {
  const formattedHours = h.toString().padStart(2, '0')
  const formattedMinutes = m.toString().padStart(2, '0')
  emit('update:modelValue', `${formattedHours}:${formattedMinutes}`)
}

// Часы от 0 до 12
const hourOptions = Array.from({ length: 13 }, (_, i) => i) 
// Минуты с шагом 5 (0, 5, 10, ... 55)
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5) 
</script>

<template>
  <div class="time-picker">
    <!-- Выбор часов -->
    <select v-model="hours" class="time-select">
      <option v-for="h in hourOptions" :key="h" :value="h">
        {{ h }}ч
      </option>
    </select>

    <!-- Выбор минут -->
    <select v-model="minutes" class="time-select">
      <option v-for="m in minuteOptions" :key="m" :value="m">
        {{ m }}м
      </option>
    </select>
  </div>
</template>

<style scoped>
.time-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-bg-secondary, #f9f9f9);
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--radius-md);
  padding: 4px 8px;
}

.time-select {
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  appearance: none; 
  padding: 0;
}
</style>