import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Screensaver } from './screensaver';

describe('Screensaver', () => {
  let component: Screensaver;
  let fixture: ComponentFixture<Screensaver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Screensaver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Screensaver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
