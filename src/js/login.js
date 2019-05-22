import LoginForm from './login-form';

// eslint-disable-next-line no-undef
const trello = TrelloPowerUp.iframe();
const form = new LoginForm(trello);
form.initialize();
