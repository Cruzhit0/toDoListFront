import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumCheckboxComponent } from './premium-checkbox.component';

describe('PremiumCheckboxComponent', () => {
  let component: PremiumCheckboxComponent;
  let fixture: ComponentFixture<PremiumCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
