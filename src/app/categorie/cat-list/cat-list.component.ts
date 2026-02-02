import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cat-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './cat-list.component.html',
  styleUrl: './cat-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CatListComponent {

  dataCategorie: any = [];
  displayedColumns: any;
  constructor() { }

  ngOnInit(): void {

  }

}
