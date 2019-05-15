import TaskForm from './task-form';

const trello = TrelloPowerUp.iframe();
const form = new TaskForm(trello);
form.initialize();
