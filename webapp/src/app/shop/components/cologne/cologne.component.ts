import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Cologne} from '../../../common/model/interfaces';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-cologne',
  templateUrl: './cologne.component.html',
  imports: [
    NgClass
  ],
  styleUrl: './cologne.component.scss'
})
export class CologneComponent implements OnInit {
  @Input() cologneData?: Cologne;
  @Input() isSelected?: boolean;

  constructor() {
  }

  ngOnInit(): void {}
}
