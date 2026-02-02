import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error-generale',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './error-generale.component.html',
  styleUrl: './error-generale.component.scss'
})
export class ErrorGeneraleComponent {
  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }
}
