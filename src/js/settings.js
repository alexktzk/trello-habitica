import SettingsForm from './settings-form';

// eslint-disable-next-line no-undef
const trello = TrelloPowerUp.iframe();
const form = new SettingsForm(trello);
form.initialize();
