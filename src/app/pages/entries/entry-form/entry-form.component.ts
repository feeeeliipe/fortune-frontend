import { Component, OnInit, AfterContentChecked} from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 
import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, toArray, catchError } from 'rxjs/operators';
import toastr from "toastr";
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories: Array<Category>;

  imaskConfig = {
    mask: Number,
    scale: 2, 
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  }

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(private entryService: EntryService, 
              private route: ActivatedRoute, 
              private router: Router, 
              private fb: FormBuilder,
              private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if(this.currentAction == "new") {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {text: text, value: value}    
      }
    )
  }

  // PRIVATE METHODS
  private setCurrentAction() {
    this.route.snapshot.url[0].path == "new" ? this.currentAction = "new" : this.currentAction = "edit";
  }
  
  private buildEntryForm() {
    this.entryForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ['expense', [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry() {
    if(this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))
      ).subscribe(entry => {
        this.entry = entry;
        this.entryForm.patchValue(this.entry);
      }, 
      error => {
        alert("Ocorreu um erro no servidor.");
      });
    }
  }

  private loadCategories() {
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories
    })
  }

  private setPageTitle() {
    if(this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de lançamento'
    } else {
      const entryName = this.entry.name || "";
      this.pageTitle = 'Editando lançamento: ' + entryName;
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.create(entry).subscribe(
      entry => {
        this.actionsForSuccess(entry)
      },
      error => {
        this.actionsForError(error);
      }
    )
  }

  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry).subscribe(
      entry => {
        this.actionsForSuccess(entry)
      },
      error => {
        this.actionsForError(error);
      }
    )
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success("Categoria criada com sucesso!");
    
    // REDIRECIONA O USUÁRIO PARA FORÇAR O RECARREGAMENTO DO COMPONENTE 
    // A propriedade "skipLocationChange" não adiciona o historico de navegação para essa rota.
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => {
        this.router.navigate(['entries', entry.id, 'edit']);
      }
    );
  }

  private actionsForError(error: any) {
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');
    this.submittingForm = false;
    if(error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor.'];
    }
  }

}