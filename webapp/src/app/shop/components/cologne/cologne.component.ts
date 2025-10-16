import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cologne',
  imports: [],
  templateUrl: './cologne.component.html',
  styleUrl: './cologne.component.scss'
})
export class CologneComponent {
  @Input() brandName: string | undefined;
  @Input() cologneName: string | undefined;
}
