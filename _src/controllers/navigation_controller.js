import { Controller } from 'stimulus';

export default class extends Controller {
    static targets = [ 'navGroup' ]
    showNav() {
        this.navGroupTarget.classList.toggle('hidden');
    }
};