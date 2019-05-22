import { TRELLO_ICON } from './constants';
import Storage from './storage';
import HabiticaApi from './habitica-api';

export default class Task {
  constructor(
    trello,
    storage = new Storage(trello),
    API = new HabiticaApi(trello, storage)
  ) {
    this.t = trello;
    this.storage = storage;
    this.API = API;
  }

  async getTemplate(card) {
    const cardUrl = `https://trello.com/c/${card.shortLink}`;
    const settings = await this.storage.getSettings();
    const icon = settings.prependIcon ? `![](${TRELLO_ICON})&ensp;` : '';

    return {
      type: 'todo',
      priority: settings.priority,
      text: `### ${icon}${card.name}`,
      notes: `[Open in Trello](${cardUrl})`
    };
  }

  async handleAdd() {
    const card = await this.t.card('name', 'shortLink');
    const params = await this.getTemplate(card);

    return this.API.addTask(params).then(res =>
      this.storage.setTask({
        id: res.data.id,
        text: res.data.text,
        notes: res.data.notes,
        priority: res.data.priority
      })
    );
  }

  async handleRemove() {
    const task = await this.storage.getTask();

    return this.API.removeTask(task.id).then(() => this.storage.removeTask());
  }

  async handleDo() {
    const task = await this.storage.getTask();

    return this.API.doTask(task.id).then(() =>
      this.storage.setTask({ done: true })
    );
  }

  async handleUndo() {
    const task = await this.storage.getTask();

    return this.API.undoTask(task.id).then(() =>
      this.storage.setTask({ done: false })
    );
  }

  async handleUpdate(params) {
    const task = await this.storage.getTask();

    return this.API.updateTask(task.id, params).then(res =>
      this.storage.setTask({
        priority: res.data.priority
      })
    );
  }
}
