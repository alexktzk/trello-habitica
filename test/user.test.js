import User from '../src/js/user';

describe('User class', () => {
  describe('constructor', () => {
    const t = {};
    const storage = {};
    let user;

    beforeEach(() => {
      user = new User(t, storage);
    });

    it('assigns passed trello instance to local t variable', () => {
      expect(user.t).toBeDefined();
      expect(user.t).toBe(t);
    });

    it('assigns passed storage to local storage variable', () => {
      expect(user.storage).toBeDefined();
      expect(user.storage).toBe(storage);
    });
  });

  describe('.updateStats()', () => {
    const t = {};
    const storage = {};
    const expToNextLevel = 123;
    let user;
    let stats;

    beforeAll(() => {
      stats = {
        gp: 100,
        exp: 200,
        lvl: 37
      };

      storage.setUser = jest.fn(async () => {});
    });

    beforeEach(() => {
      user = new User(t, storage);
      user.notifyAboutStats = jest.fn(async () => {});
      user.calculateExpToNextLevel = jest.fn(() => expToNextLevel);
    });

    it('notifies about stats changes', async () => {
      await user.updateStats(stats);
      expect(user.notifyAboutStats).toBeCalledWith({
        gold: stats.gp,
        exp: stats.exp
      });
    });

    it('calculates how many exp is left to the next level', async () => {
      await user.updateStats(stats);
      expect(user.calculateExpToNextLevel).toBeCalledWith(stats.lvl);
    });

    it('saves user stats to the storage', async () => {
      await user.updateStats(stats);
      expect(user.storage.setUser).toBeCalledWith({
        lvl: stats.lvl,
        gold: stats.gp,
        exp: stats.exp,
        expToNextLevel
      });
    });
  });

  describe('.calculateExpToNextLevel()', () => {
    const t = {};
    const storage = {};
    const stats = {};
    let user;
    let currentUser;

    describe("when user's level was changed", () => {
      beforeAll(() => {
        stats.lvl = 37;
        currentUser = {
          // user gained a new level but we
          // have outdated data in the storage
          lvl: stats.lvl - 1,
          expToNextLevel: 1
        };
        storage.getUser = async () => currentUser;
      });

      it('calculates how many exp is left to the next level', async () => {
        user = new User(t, storage);
        const expToNextLevel = await user.calculateExpToNextLevel(stats.lvl);
        expect(expToNextLevel).toBeGreaterThan(0);
        expect(expToNextLevel).not.toBe(currentUser.expToNextLevel);
      });
    });

    describe("when user's level wasn't changed", () => {
      beforeAll(() => {
        stats.lvl = 37;
        currentUser = {
          lvl: stats.lvl,
          expToNextLevel: 1
        };
        storage.getUser = async () => currentUser;
      });

      it('returns already calculated exp from the storage', async () => {
        user = new User(t, storage);
        const expToNextLevel = await user.calculateExpToNextLevel(stats.lvl);
        expect(expToNextLevel).toBe(currentUser.expToNextLevel);
      });
    });
  });

  describe('.notifyAboutStats()', () => {
    const t = {};
    const storage = {};
    let user;
    let currentUser;
    let stats;

    beforeAll(() => {
      currentUser = {
        gold: 100,
        exp: 200
      };

      t.alert = jest.fn(async () => ({ notified: true }));
      storage.getUser = async () => currentUser;
    });

    describe('when stats notifications are disabled', () => {
      beforeAll(() => {
        storage.getSettings = async () => ({ showStatsNotifications: false });
      });

      it('does nothing', async () => {
        user = new User(t, storage);
        const result = await user.notifyAboutStats(currentUser);
        expect(result).toBe(undefined);
      });
    });

    describe('when stats notifications are enabled', () => {
      beforeAll(() => {
        storage.getSettings = async () => ({ showStatsNotifications: true });
      });

      describe('when user is gained exp and gold', () => {
        beforeAll(() => {
          stats = {
            gold: 101,
            exp: 201
          };
        });

        beforeEach(() => {
          user = new User(t, storage);
        });

        it('uses _gained_ word in the message', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching('gained')
            })
          );
        });

        it('display notification as success', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              display: 'success'
            })
          );
        });

        it('displays how many exp was gained', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching(
                `${stats.exp - currentUser.exp} exp`
              )
            })
          );
        });

        it('displays how many gold was gained', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching(
                `${(stats.gold - currentUser.gold).toFixed(2)} gold`
              )
            })
          );
        });

        it('displays the notification for 5 seconds', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              duration: 5
            })
          );
        });
      });

      describe('when user is lost exp and gold', () => {
        beforeAll(() => {
          stats = {
            gold: 99,
            exp: 199
          };
        });

        beforeEach(() => {
          user = new User(t, storage);
        });

        it('uses _lost_ word in the message', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching('lost')
            })
          );
        });

        it('display notification as error', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              display: 'error'
            })
          );
        });

        it('displays how many exp was lost', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching(
                `${stats.exp - currentUser.exp} exp`
              )
            })
          );
        });

        it('displays how many gold was lost', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              message: expect.stringMatching(
                `${(stats.gold - currentUser.gold).toFixed(2)} gold`
              )
            })
          );
        });

        it('displays the notification for 5 seconds', async () => {
          await user.notifyAboutStats(stats);
          expect(user.t.alert).toBeCalledWith(
            expect.objectContaining({
              duration: 5
            })
          );
        });
      });
    });
  });
});
