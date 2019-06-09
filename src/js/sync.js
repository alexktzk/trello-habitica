/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */

import { CARD_SCOPES, LIST_TYPES } from './constants';
import Storage from './storage';
import Task from './task';

export default class Sync {
  constructor(trello, storage = new Storage(trello)) {
    this.t = trello;
    this.storage = storage;
    this.task = undefined;
  }

  currentTask() {
    this.task = this.task || new Task(this.t, this.storage);
    return this.task;
  }

  async start() {
    const card = await this.t.card('id', 'idList', 'members');
    const settings = await this.storage.getSettings();
    const taskData = await this.storage.getTask();

    // Skips the cards that are not assigned to user.
    // Removes the badge if card was already synced.
    if (settings.scope === CARD_SCOPES.ASSIGNED_TO_ME) {
      const me = this.t.getContext().member;
      if (!card.members.some(member => member.id === me)) {
        return this.handleScoped(taskData);
      }
    }

    const lists = await this.storage.getLists();
    const listType = lists[card.idList];

    return this.handle(taskData, listType);
  }

  handleScoped(taskData) {
    if (taskData.id) {
      if (taskData.done) {
        return this.currentTask()
          .handleUndo()
          .then(() => this.currentTask().handleRemove());
      } else {
        return this.currentTask().handleRemove();
      }
    }
  }

  handle(taskData, listType) {
    if (listType === LIST_TYPES.DOING) {
      if (taskData.id) {
        if (taskData.done) {
          return this.currentTask().handleUndo();
        }
      } else {
        return this.currentTask().handleAdd();
      }
    } else if (listType === LIST_TYPES.DONE) {
      if (taskData.id) {
        if (!taskData.done) {
          return this.currentTask().handleDo();
        }
      } else {
        return this.currentTask()
          .handleAdd()
          .then(() => this.currentTask().handleDo());
      }
    } else {
      if (taskData.id) {
        if (taskData.done) {
          return this.currentTask()
            .handleUndo()
            .then(() => this.currentTask().handleRemove());
        } else {
          return this.currentTask().handleRemove();
        }
      }
    }
  }
}
