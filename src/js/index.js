import { ICONS, LIST_TYPES } from './constants';
import Storage from './storage';
import Sync from './sync';
import List from './list';

let syncing = {};

const syncWithHabitica = async t => {
  let id = t.getContext().card;

  // prevent duplicated tries to sync while previous sync in progress
  if (syncing[id]) return syncing[id];

  // start syncing
  syncing[id] = new Sync(t).start().then(() => {
    return setTimeout(() => delete syncing[id], 1000);
  });
  return syncing[id];
};

TrelloPowerUp.initialize({
  'board-buttons': async t => {
    let currentUser = await new Storage(t).getUser();

    let settingsPage = t =>
      t.popup({
        title: 'Habitica settings',
        url: './settings.html',
        height: 394
      });

    let loginPage = t =>
      t.popup({
        title: 'Log in Habitica',
        url: './login.html',
        height: 340
      });

    return [
      {
        icon: ICONS.HABITICA,
        text: currentUser.loggedIn ? currentUser.name : 'Login',
        callback: currentUser.loggedIn ? settingsPage : loginPage
      },
      {
        icon: ICONS.NOTIFICATIONS,
        text: ' ',
        callback: t =>
          t.popup({
            title: "What's new?",
            url: './changelog/',
            height: 525
          })
      }
    ];
  },
  'card-badges': async t => {
    let storage = new Storage(t);
    let currentUser = await storage.getUser();
    if (!currentUser.loggedIn) return [];

    return syncWithHabitica(t).then(async () => {
      let settings = await storage.getSettings();
      if (!settings.showBadges) return [];

      let taskData = await storage.getTask();
      return [
        { icon: taskData.id ? ICONS.TASK_DOING : null },
        { icon: taskData.done ? ICONS.TASK_DONE : null }
      ];
    });
  },
  'card-detail-badges': async t => {
    let taskData = await new Storage(t).getTask();
    if (!taskData.id) return [];

    return [
      {
        title: 'To-Do',
        text: 'Edit',
        callback: t =>
          t.popup({
            title: 'Edit To-Do',
            url: './edit-task.html',
            height: 240
          })
      }
    ];
  },
  'list-actions': async t => {
    let storage = new Storage(t);
    let currentUser = await storage.getUser();
    if (!currentUser.loggedIn) return [];

    return storage.getLists().then(lists => {
      return t.list('id').then(list => {
        const listType = lists[list.id];

        if (listType === LIST_TYPES.DOING) {
          return [
            {
              text: 'Unmark list as "Doing"',
              callback: t => new List(t).unmark()
            }
          ];
        } else if (listType === LIST_TYPES.DONE) {
          return [
            {
              text: 'Unmark list as "Done"',
              callback: t => new List(t).unmark()
            }
          ];
        } else {
          return [
            {
              text: 'Mark list as "Doing"',
              callback: t => new List(t).markAsDoing()
            },
            {
              text: 'Mark list as "Done"',
              callback: t => new List(t).markAsDone()
            }
          ];
        }
      });
    });
  }
});
