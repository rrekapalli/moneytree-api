import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

// Components
import { QueryBuilderComponent } from './components/query-builder/query-builder.component';
import { QueryEntityComponent } from './components/query-entity/query-entity.component';
import { QuerySwitchGroupComponent } from './components/query-switch-group/query-switch-group.component';
import { QueryButtonGroupComponent } from './components/query-button-group/query-button-group.component';
import { QueryFieldDetailsComponent } from './components/query-field-details/query-field-details.component';
import { QueryOperationComponent } from './components/query-operation/query-operation.component';
import { QueryInputComponent } from './components/query-input/query-input.component';
import { QueryRemoveButtonComponent } from './components/query-remove-button/query-remove-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    ButtonModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    MultiSelectModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
    // Components (since they are standalone)
    QueryBuilderComponent,
    QueryEntityComponent,
    QuerySwitchGroupComponent,
    QueryButtonGroupComponent,
    QueryFieldDetailsComponent,
    QueryOperationComponent,
    QueryInputComponent,
    QueryRemoveButtonComponent
  ],
  exports: [
    QueryBuilderComponent,
    QueryEntityComponent,
    QuerySwitchGroupComponent,
    QueryButtonGroupComponent,
    QueryFieldDetailsComponent,
    QueryOperationComponent,
    QueryInputComponent,
    QueryRemoveButtonComponent
  ]
})
export class QueryBuilderModule { }