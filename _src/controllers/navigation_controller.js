import { Controller } from 'stimulus';

export default class extends Controller {
    static targets = [ 'navGroup', 'navBar', 'hamburger' ]
    showNav() {
        this.navGroupTarget.classList.toggle('hidden');
        this.navBarTarget.classList.toggle('shadow-lg');
        this.hamburgerTarget.classList.toggle('active');
    }
};