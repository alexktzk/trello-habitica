import LoginForm from './login-form';

const trello = TrelloPowerUp.iframe();
const form = new LoginForm(trello);
form.initialize();
