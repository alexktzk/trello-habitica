import TaskForm from './task-form';

// eslint-disable-next-line no-undef
const trello = TrelloPowerUp.iframe();
const form = new TaskForm(trello);
form.initialize();
