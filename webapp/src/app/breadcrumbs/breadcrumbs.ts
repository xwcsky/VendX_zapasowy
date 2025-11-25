import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss'
})
export class BreadcrumbsComponent {

  @Input() showPaymentStep = false;
  @Output() breadcrumbClick = new EventEmitter<string>();

  get breadcrumbs() {
    const items = [
      { label: 'Strona główna', url: '/' },
      { label: 'Sklep', url: '/shop' }
    ];

    if (this.showPaymentStep) {
      items.push({ label: 'Płatność', url: '' });
    }

    return items;
  }

  handleClick(url: string) {
    this.breadcrumbClick.emit(url);
  }
}
