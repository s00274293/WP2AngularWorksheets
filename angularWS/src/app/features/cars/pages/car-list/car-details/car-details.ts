import { Component, inject, input, signal } from '@angular/core';

import { Car } from '../../../models/car.model';
import { CarService } from '../../../services/car.service';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoadState, withLoadState } from '../../../../../shared/load-state';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';


@Component({
  selector: 'app-car-details',
  imports: [],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css',
})
export class CarDetails {

  private carService = inject(CarService);

    readonly id = input.required<string>();

    readonly car = signal<Car | null>(null);

    readonly initial: LoadState<Car> = { status: 'loading' };

  state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => withLoadState(this.carService.getCarById(id))),
    ),
    { initialValue: this.initial },
  );

}