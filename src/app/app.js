import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
let App = class App {
};
App = __decorate([
    Component({
        imports: [ChatComponent],
        selector: 'app-root',
        template: '<app-chat />',
    })
], App);
export { App };
