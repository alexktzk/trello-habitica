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

  getTask() {
    this.task = this.task || new Task(this.t, this.storage);
    return this.task;
  }

  async start() {
    const card = await this.t.card('id', 'idList', 'members');
    const settings = await this.storage.getSettings();
    const taskData = await this.storage.getTask();

    // Skips the cards that are not assigned to user.
    // Remove the badge if card was already synced.
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
        return this.getTask()
          .handleUndo()
          .then(() => this.getTask().handleRemove());
      } else {
        return this.getTask().handleRemove();
      }
    }
  }

  handle(taskData, listType) {
    if (listType === LIST_TYPES.DOING) {
      if (taskData.id) {
        if (taskData.done) {
          return this.getTask().handleUndo();
        }
      } else {
        return this.getTask().handleAdd();
      }
    } else if (listType === LIST_TYPES.DONE) {
      if (taskData.id) {
        if (!taskData.done) {
          return this.getTask().handleDo();
        }
      } else {
        return this.getTask()
          .handleAdd()
          .then(() => this.getTask().handleDo());
      }
    } else {
      if (taskData.id) {
        if (taskData.done) {
          return this.getTask()
            .handleUndo()
            .then(() => this.getTask().handleRemove());
        } else {
          return this.getTask().handleRemove();
        }
      }
    }
  }
}
