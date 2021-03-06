import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms'; 

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';
import { generalConfig } from "../../../shared/config/general.configs";

import { BaseResourceFormComponent } from 'src/app/shared/components/base-resource-form/base-resource-form.component';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent extends BaseResourceFormComponent<Entry> implements OnInit {

  categories: Array<Category>;
  imaskConfig = generalConfig.imaskConfig;
  ptBR = generalConfig.ptBR;

  constructor(protected injector: Injector, 
              protected entryService: EntryService, 
              private categoryService: CategoryService) {
    super(injector, new Entry(), entryService, Entry.fromJson);
  }

  ngOnInit() {
    this.loadCategories();
    super.ngOnInit();
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {text: text, value: value}    
      }
    )
  }

  // PROTECTED METHODS
  protected prepareFormValues(resource): Entry {
    resource.amount = resource.amount + '';
    resource.dueDate = new Date(resource.dueDate);
    resource.paidDate = new Date(resource.paidDate);
    resource.category = resource.category._id;
    return resource;
  }
  
  protected creationPageTitle(): string {
    return "Novo Lançamento";
  }

  protected editionPageTitle(): string {
    let title = this.resource.description || '';
    title = "Editando lançamento: " + title;
    return title;
  }

  protected buildResourceForm() {
    this.resourceForm = this.formBuilder.group({
      _id: [null],
      description: [null, [Validators.required, Validators.minLength(2)]],
      longDescription: [null],
      type: ['expense', [Validators.required]],
      amount: [null, [Validators.required]],
      dueDate: [null, [Validators.required]],
      paidDate: [null],
      paid: [true, [Validators.required]],
      category: [null, [Validators.required]]
    });
  }

  protected prepareValuesToServer(entry): Entry {
    let amount = entry.amount;
    entry.amount = amount.replace(",", ".");
    return entry;
  }

  private loadCategories() {
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories
    })
  }
}
