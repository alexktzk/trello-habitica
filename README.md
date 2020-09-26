## [Trello](https://trello.com) Integration with [Habitica](https://habitica.com)

This Power-Up([?](https://trello.com/en/guide/power-up-productivity)) will keep your Trello cards in sync with Habitica. **No coding is required**; just fill in the form and you're all set!

## How to use?

Each Power-Up is associated with a team. Once a Power-Up has been added to a team, it will be available to all of the boards that belong to that team. So [create a team](https://trello.com/en/guide/create-a-team.html) if you don't have one.

To add a new Power-Up to your team, navigate to the [Power-Ups Administration page](https://trello.com/power-ups/admin), choose your team and click **Create a Power-Up**.

Now it's time to fill in the form.

1. First, name your Power-Up.
2. To work properly this Power-Up requires some permissions. Make sure you've checked all of the following:

- board-buttons
- card-badges
- card-detail-badges
- list-actions

3. Provide the URL to your Power-Up.

- The easiest way is to use the url provided below. As a bonus you will receive all upcoming updates without any changes from your side.  
  `https://alexktzk.github.io/trello-habitica`
- Or you can fork this repository, publish **gh-pages** branch to [GitHub Pages](https://pages.github.com) and use your own url.

4. Now you can navigate to one of the boards of the team and activate your Power-Up! You will find it in the **Custom** section.
5. _**To start the sync process, open any list menu (three dots) and select either "Mark list as Doing" or "Mark list as Done."**_

![](https://github.com/alexktzk/trello-habitica/blob/master/docs/img/ui.png)

## Developing Power Up

Clone the Git repo

```
$ git clone git://github.com/alexktzk/trello-habitica
$ cd trello-habitica
```

Install packages

```
$ npm install
```

### Run

For quick start run

```
$ npm start
```

It builds the project and runs [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) to watch and update when any of the files are changed.

### Live testing

In order to test your code directly on a Trello board you should obtain a public url that points to your local web server. For this purpose install [ngrok](https://ngrok.com/).

```
$ ngrok http 8080
```

This command generates 2 public urls, http and https. \
Trello allows to serve Power-Ups only over https.

Once you've done just grab your public url and pass it to the Power-Up form as **Iframe connector URL**.

### Deploy

```
$ npm run deploy
```

That's it, you're live. Try to check your repo's [Github Pages](https://pages.github.com/) url.

The script generates and pushes the **dist** folder to **gh-pages**. For this, it creates and switches branches under the hood. Therefore, if you have any uncommited changes it will fail to run.
