import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Car, CreateCarDto } from '../../../models/car.model';
import { Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { CarService } from '../../../services/car.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-form',
  imports: [ReactiveFormsModule],
  templateUrl: './car-form.html',
  styleUrl: './car-form.css',
})
export class CarForm {
     private formBuilder = inject(FormBuilder);
     private carService = inject(CarService);
     private router = inject(Router);
     saving = signal(false);
     saveError = signal<string | null>(null);


   carForm = this.formBuilder.nonNullable.group({
     make: ['', Validators.required],
     model: ['', Validators.required],
     year: this.formBuilder.control<number|null> (null)
   });


  onSubmit(): void {


    const { make, model, year } = this.carForm.getRawValue();
    const newCar: CreateCarDto = { make, model, year: year ?? undefined };

    this.saving.set(true);
    this.saveError.set(null);

    this.carService.addCar(newCar).subscribe({
      next: (response) => {
        console.log('Car added successfully:', response);
        this.router.navigate(['/cars']);
      },
    error: (err: Error) => {
      this.saveError.set(err.message);
      this.saving.set(false);
    },
    });
  }

}

