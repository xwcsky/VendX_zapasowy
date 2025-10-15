import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ColognesList} from './shop/components/colognes-list/colognes-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ColognesList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('webapp');
}
