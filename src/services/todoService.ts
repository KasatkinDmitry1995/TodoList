// 1. Описываем, как выглядит наша задача (Интерфейс)
export interface Todo {
  id: number;
  text: string;
  done: boolean;
  dateToComplete: string;
  duration: string;  
}

// Описываем, что должен уметь наш сервис (чтобы и localStorage, и сервер подчинялись правилам)
interface TodoService {
  getTodos(): Promise<Todo[]>;
  saveTodos(todos: Todo[]): Promise<boolean>;
}

// ==========================================
// 2. РЕАЛИЗАЦИЯ ДЛЯ LOCALSTORAGE
// ==========================================
const localStorageService: TodoService = {
  async getTodos(): Promise<Todo[]> {
    const saved = localStorage.getItem('my-todos');
    return saved ? JSON.parse(saved) : [];
  },
  
  async saveTodos(todos: Todo[]): Promise<boolean> {
    localStorage.setItem('my-todos', JSON.stringify(todos));
    return true; 
  }
};

// ==========================================
// 3. РЕАЛИЗАЦИЯ ДЛЯ БЭКЕНДА (Заготовка)
// ==========================================
const serverService: TodoService = {
  async getTodos(): Promise<Todo[]> {
    /*
    const response = await fetch('/api/todos');
    if (!response.ok) throw new Error('Ошибка загрузки');
    return await response.json();
    */
    return []; 
  },
  
  async saveTodos(todos: Todo[]): Promise<boolean> {
    /*
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todos)
    });
    */
    return true;
  }
};

// ==========================================
// 4. ПЕРЕКЛЮЧАТЕЛЬ
// ==========================================
export const todoService: TodoService = localStorageService; 
// export const todoService: TodoService = serverService;