const todoList = () => {
  const all = [];

  const add = (todoItem) => {
    all.push(todoItem);
  };

  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    let today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate < today);
  };

  const dueToday = () => {
    let today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate === today);
  };

  const dueLater = () => {
    let today = new Date().toLocaleDateString("en-CA");
    return all.filter((item) => item.dueDate > today);
  };

  const toDisplayableList = (list) => {
    return list
      .map(
        (item) =>
          `${item.completed ? "[x]" : "[ ]"} ${item.title} ${
            item.dueDate != today ? item.dueDate : " "
          }`
      )
      .join("\n");
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
  };
};

module.exports = todoList;
