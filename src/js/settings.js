import SettingsForm from './settings-form';

const trello = TrelloPowerUp.iframe();
const form = new SettingsForm(trello);
form.initialize();
