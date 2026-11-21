import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Car, CreateCarDto } from '../../../models/car.model';
import { Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { CarService } from '../../../services/car.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { input, OnInit } from '@angular/core';
import { notBlank } from '../../../../../shared/validators/not-blank.validator';
import { forbiddenValue } from '../../../../../shared/validators/validatorFactory.validator';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-car-form',
  imports: [ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    RouterLink
  ],
  templateUrl: './car-form.html',
  styleUrl: './car-form.css',
})
export class CarForm implements OnInit {
     private formBuilder = inject(FormBuilder);
     private carService = inject(CarService);
     private router = inject(Router);
     saving = signal(false);
     saveError = signal<string | null>(null);
     private snackBar = inject(MatSnackBar);
     readonly id = input<string>();  // note this is optional by default


   readonly currentYear = new Date().getFullYear();

  carForm = this.formBuilder.nonNullable.group({
    make: ['', [Validators.required, notBlank, forbiddenValue("test"), Validators.minLength(2), Validators.maxLength(30)]],
    model: ['', [Validators.required, notBlank, Validators.maxLength(30)]],
    year: this.formBuilder.control<number | null>(null, [Validators.min(1950), Validators.max(this.currentYear + 1),]),
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return; // adding a new car, nothing to load

    this.carService.getCarById(id).subscribe({
      next: (car) =>
        this.carForm.patchValue({ make: car.make, model: car.model, year: car.year ?? null }),
      error: (err: Error) => this.saveError.set(err.message),
    });
  }

  onSubmit(): void {


    const { make, model, year } = this.carForm.getRawValue();
    const newCar: CreateCarDto = { make, model, year: year ?? undefined };
    console.log('Submitting:', newCar);

    this.saving.set(true);
    this.saveError.set(null);
    this.carForm.disable() 

    const id = this.id();

    const request = id
      ? this.carService.updateCar(id, newCar)
      : this.carService.addCar(newCar);


    request.subscribe({
      next: (response) => {
        this.snackBar.open(`${newCar.make} ${newCar.model} saved`, 'Close', { duration: 10000 });
        console.log('Car added successfully:', response);
        this.router.navigate(['/cars']);
      },

      
    error: (err: Error) => {
      this.saveError.set(err.message);
      this.saving.set(false);
      this.carForm.enable() 
    },
    });
  }

}

