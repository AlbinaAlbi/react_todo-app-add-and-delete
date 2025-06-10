import { useEffect, useRef, useState } from 'react';
import { TodoappFooter } from '../TodoappFooter';
import { TodoappHeader } from '../TodoappHeader';
import { TodoappMain } from '../TodoappMain';
import { Todo } from '../../types/Todo';
import { FilterType } from '../../types/Filter';
import { deleteTodo, getTodos } from '../../api/todos';
import { errorNotification } from '../../utils/errorFunction';
interface TodoappContentProps {
  setErrorNotification: (msg: string) => void;
}

export const TodoappContent: React.FC<TodoappContentProps> = ({
  setErrorNotification,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterStyle, setFilterStyle] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTodos()
      .then(data => {
        const newData = data.map(todo => ({ ...todo, isLoaded: true }));

        setTodos(newData);
      })
      .catch(() => setErrorNotification('Unable to load todos'));
  }, [setErrorNotification]);

  const filteredTodos = todos.filter(todo => {
    switch (filterStyle) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      case 'all':
      default:
        return true;
    }
  });

  const handleClearCompletedButton = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setTodos(prev =>
      prev.map(todo => (todo.completed ? { ...todo, isLoaded: false } : todo)),
    );

    await Promise.all(
      completedTodos.map(async todo => {
        try {
          await deleteTodo(todo.id);
          setTodos(prev => prev.filter(t => t.id !== todo.id));
        } catch {
          setTodos(prev =>
            prev.map(t =>
              t.id === todo.id ? { ...todo, isLoaded: true } : todo,
            ),
          );
          errorNotification('Unable to delete a todo', setErrorNotification);
        }
      }),
    );
  };

  return (
    <div className="todoapp__content">
      <TodoappHeader
        setTodos={setTodos}
        todos={todos}
        setErrorNotification={setErrorNotification}
        inputRef={inputRef}
      />

      <TodoappMain
        todos={filteredTodos}
        setTodos={setTodos}
        setErrorNotification={setErrorNotification}
        inputRef={inputRef}
      />

      <TodoappFooter
        todos={todos}
        setFilterStyle={setFilterStyle}
        handleClearCompletedButton={handleClearCompletedButton}
        inputRef={inputRef}
      />
    </div>
  );
};
