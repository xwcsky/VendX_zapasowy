import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ColognesApiService } from '../../services/colognes-api.service';
import { Cologne } from '../../../common/model/interfaces';
import { Carousel } from 'bootstrap';
import { CologneComponent } from '../cologne/cologne.component';
import { Navigation, Pagination } from 'swiper/modules';
import Swiper from 'swiper';

@Component({
  selector: 'app-colognes-list',
  imports: [
    CologneComponent
  ],
  templateUrl: './colognes-list.component.html',
  styleUrl: './colognes-list.component.scss'
})
export class ColognesListComponent implements AfterViewInit, OnDestroy {
  @Output() selectedCologne: EventEmitter<string | undefined> = new EventEmitter();
  colognes: Cologne[] | undefined;

  swiper: Swiper | undefined;
  selectedCologneId: string | undefined;

  private destroy$ = new Subject<void>();

  constructor(private colognesApiService: ColognesApiService, private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.loadColognes();
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
    this.colognesApiService.getColognes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: colognes => {
          this.colognes = colognes;
          console.log(colognes);
          this.cdr.detectChanges();
          setTimeout(() => this.initSwiper(), 0);
        },
      });
  }

  private initSwiper(): void {
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
}
