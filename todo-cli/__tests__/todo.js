const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueLater, dueToday } = todoList();

describe("Todolist Test Suite", () => {
  beforeEach(() => {
    all.length = 0; 
  });

  test("Add a new todo in list", () => {
    const todoItemCount = all.length;
    add({
      title: "todo - 3",
      completed: false,
      dueDate: "2023-11-17", 
    });
    expect(all.length).toBe(todoItemCount + 1);
  });

  test("should mark a todo as complete", () => {
    add({
      title: "todo - 1",
      completed: false,
      dueDate: "2023-11-16", // Replace this with a past date
    });
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("retrieval of overdue items", () => {
    add({
      title: "Overdue",
      completed: false,
      dueDate: "2023-11-16", 
    });
    const todolist = overdue();
    expect(todolist.length).toBe(1); 
    expect(todolist[0].dueDate).toBe("2023-11-16"); 
  });

  test("retrieval of due today items", () => {
    add({
      title: "Due Today",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"), 
    });
    const todolist = dueToday();
    expect(todolist.length).toBe(1); 
    expect(todolist[0].dueDate).toBe(new Date().toLocaleDateString("en-CA")); 
  });

  test("retrieval of due later items", () => {
    add({
      title: "Due Later",
      completed: false,
      dueDate: "2023-11-18",
    });
    const todolist = dueLater();
    expect(todolist.length).toBe(1); 
    expect(todolist[0].dueDate).toBe("2023-11-18"); 
  });
});
