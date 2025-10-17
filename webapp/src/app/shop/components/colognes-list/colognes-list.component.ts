import { Component, OnDestroy, OnInit } from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import { ColognesApiService } from '../../services/colognes-api.service';
import { Cologne } from '../../../common/model/interfaces';
import { CologneComponent } from '../cologne/cologne.component';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-colognes-list',
  imports: [
    CologneComponent,
    AsyncPipe
  ],
  templateUrl: './colognes-list.component.html',
  styleUrl: './colognes-list.component.scss'
})
export class ColognesListComponent implements OnInit, OnDestroy {
  colognes$: Observable<Cologne[]> | undefined;

  private destroy$ = new Subject<void>();

  constructor(private colognesApiService: ColognesApiService) {
  }

  ngOnInit(): void {
    this.loadColognes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadColognes(): void {
    this.colognes$ = this.colognesApiService.getColognes();
  }
}
