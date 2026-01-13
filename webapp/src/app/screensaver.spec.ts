import { TestBed } from '@angular/core/testing';

import { Screensaver } from './screensaver';

describe('Screensaver', () => {
  let service: Screensaver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Screensaver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
