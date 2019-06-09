import { ICONS, LIST_TYPES } from './constants';
import Storage from './storage';
import Sync from './sync';
import List from './list';

const syncing = {};

const syncWithHabitica = async t => {
  const id = t.getContext().card;

  // prevent duplicated tries to sync while previous sync in progress
  if (syncing[id]) return syncing[id];

  // start syncing
  syncing[id] = new Sync(t).start().then(() => {
    return setTimeout(() => delete syncing[id], 1000);
  });
  return syncing[id];
};

const priorityIcon = {
  0.1: ICONS.TRIVIAL,
  1: ICONS.EASY,
  1.5: ICONS.MEDIUM,
  2: ICONS.HARD
};

// eslint-disable-next-line no-undef
TrelloPowerUp.initialize({
  'board-buttons': async t => {
    let buttons;
    const currentUser = await new Storage(t).getUser();

    const settingsPage = tt =>
      tt.popup({
        title: 'Settings',
        url: './settings.html',
        height: 270
      });

    const loginPage = tt =>
      tt.popup({
        title: 'Log in Habitica',
        url: './login.html',
        height: 340
      });

    if (currentUser.loggedIn) {
      buttons = [
        {
          condition: 'always',
          icon: {
            dark: ICONS.EXP,
            light: ICONS.EXP
          },
          text: currentUser.exp
            ? `${currentUser.exp} / ${currentUser.expToNextLevel}`
            : '?'
        },
        {
          condition: 'always',
          icon: {
            dark: ICONS.GOLD,
            light: ICONS.GOLD
          },
          text: currentUser.gold ? currentUser.gold.toFixed(2) : '?'
        },
        {
          condition: 'always',
          icon: {
            dark: ICONS.HABITICA_LOGO,
            light: ICONS.HABITICA_LOGO
          },
          text: currentUser.name,
          callback: settingsPage
        }
      ];
    } else {
      buttons = [
        {
          condition: 'always',
          icon: {
            dark: ICONS.HABITICA_LOGO,
            light: ICONS.HABITICA_LOGO
          },
          text: 'Login',
          callback: loginPage
        }
      ];
    }

    return buttons;
  },
  'card-badges': async t => {
    const storage = new Storage(t);
    const currentUser = await storage.getUser();
    if (!currentUser.loggedIn) return [];

    return syncWithHabitica(t).then(async () => {
      const settings = await storage.getSettings();
      if (!settings.showBadges) return [];

      const taskData = await storage.getTask();

      return [
        { icon: taskData.id ? priorityIcon[taskData.priority] : null },
        { icon: taskData.done ? ICONS.CHECKED : null }
      ];
    });
  },
  'card-detail-badges': async t => {
    const taskData = await new Storage(t).getTask();
    if (!taskData.id) return [];

    return [
      {
        title: 'To-Do',
        text: 'Edit',
        callback: tt =>
          tt.popup({
            title: 'Edit To-Do',
            url: './edit-task.html',
            height: 240
          })
      }
    ];
  },
  'list-actions': async t => {
    const storage = new Storage(t);
    const currentUser = await storage.getUser();
    if (!currentUser.loggedIn) return [];

    return storage.getLists().then(lists => {
      return t.list('id').then(list => {
        const listType = lists[list.id];

        switch (listType) {
          case LIST_TYPES.DOING:
            return [
              {
                text: 'Unmark list as "Doing"',
                callback: tt => new List(tt).unmark()
              }
            ];
          case LIST_TYPES.DONE:
            return [
              {
                text: 'Unmark list as "Done"',
                callback: tt => new List(tt).unmark()
              }
            ];
          default:
            return [
              {
                text: 'Mark list as "Doing"',
                callback: tt => new List(tt).markAsDoing()
              },
              {
                text: 'Mark list as "Done"',
                callback: tt => new List(tt).markAsDone()
              }
            ];
        }
      });
    });
  }
});
