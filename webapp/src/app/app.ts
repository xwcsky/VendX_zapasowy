import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColognesListComponent } from './shop/components/colognes-list/colognes-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('webapp');
}
