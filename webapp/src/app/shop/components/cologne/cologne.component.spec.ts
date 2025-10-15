import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CologneComponent } from './cologne.component';

describe('Cologne', () => {
  let component: CologneComponent;
  let fixture: ComponentFixture<CologneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CologneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CologneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
