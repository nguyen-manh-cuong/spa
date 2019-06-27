import { MatButtonModule, MatIconModule, MatInputModule } from '@angular/material';

import { CommonModule } from '@angular/common';
import { MatSelectSearchComponent } from './mat-select-search.component';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  declarations: [
    MatSelectSearchComponent
  ],
  exports: [
    MatButtonModule,
    MatInputModule,
    MatSelectSearchComponent
  ]
})
export class MatSelectSearchModule { }
