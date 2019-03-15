import TaskForm from './task-form'

let trello = TrelloPowerUp.iframe()
let form = new TaskForm(trello)
form.initialize()
