import SettingsForm from './settings-form'

let trello = TrelloPowerUp.iframe()
let form = new SettingsForm(trello)
form.initialize()
