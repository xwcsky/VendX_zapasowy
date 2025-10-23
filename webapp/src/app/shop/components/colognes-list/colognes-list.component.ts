import {AfterViewChecked, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ColognesApiService } from '../../services/colognes-api.service';
import { Cologne } from '../../../common/model/interfaces';
import { AsyncPipe } from '@angular/common';
import { Carousel } from 'bootstrap';
import { CologneComponent } from '../cologne/cologne.component';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

@Component({
  selector: 'app-colognes-list',
  imports: [
    AsyncPipe,
    CologneComponent
  ],
  templateUrl: './colognes-list.component.html',
  styleUrl: './colognes-list.component.scss'
})
export class ColognesListComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Output() selectedCologne: EventEmitter<string | undefined> = new EventEmitter();
  colognes$: Observable<Cologne[]> | undefined;

  swiper: Swiper | undefined;
  selectedCologneId: string | undefined;

  private destroy$ = new Subject<void>();

  constructor(private colognesApiService: ColognesApiService) {
  }

  ngOnInit(): void {
    this.loadColognes();
  }

  ngAfterViewChecked() {
    this.swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      slidesPerView: 3,
      spaceBetween: 0,
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next',
      }
    });
    const carouselEl = document.querySelector('#mainCarousel');
    if (carouselEl) new Carousel(carouselEl, { touch: true, ride: false });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCologne(cologneId: string): void {
    this.selectedCologneId = cologneId;
    this.selectedCologne.emit(this.selectedCologneId);
  }

  private loadColognes(): void {
    this.colognes$ = this.colognesApiService.getColognes();
  }
}
