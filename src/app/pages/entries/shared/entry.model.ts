import { Category } from '../../categories/shared/category.model';
import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';

export class Entry extends BaseResourceModel {
    constructor(public _id?: string,
                public description?: string,
                public longDescription?: string, 
                public type?: string,
                public amount?: string,
                public dueDate?: Date,
                public paidDate?: Date,
                public paid?: boolean,
                public category?: Category) {
        super();
    }

    /* 
    Um novo objeto do tipo entry é instanciado para garantir que os metodos 
    criados na classe de modelo possam ser utilizados durante a aplicação.
    Exemplo: paidText()
    */
    static fromJson(jsonData: any) {
        return Object.assign(new Entry(), jsonData);
    }

    static types = {
        expense: 'Despesa',
        revenue: 'Receita',
        investment: 'Investimento'
    }

    get paidText(): string {
        return this.paid ? 'Pago' : 'Pendente';
    }
}