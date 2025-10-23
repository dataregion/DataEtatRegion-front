import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'lib-spinner',
    imports: [CommonModule],
    template: '<span class="loadingspinner"></span>',
    styles: [`
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0px;
        }
        .loadingspinner {
            display: block;
            pointer-events: none;
            width: 5em;
            height: 5em;
            border: 0.4em solid transparent;
            border-color: #eee;
            border-top-color: #000099;
            border-radius: 50%;
            animation: loadingspin 1s linear infinite;
        }
        @keyframes loadingspin {
            100% {
                transform: rotate(360deg)
            }
        }
    `]
})
export class SpinnerComponent {
}
