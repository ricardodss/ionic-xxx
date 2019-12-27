import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  private factoryJSON: IJSONBuilder<Teste>;

  constructor(public navCtrl: NavController) {
    this.factoryJSON = new JSONBuilder<Teste>();

    let x = this.factoryJSON
      .configuracaoGeral({ mascaraData: "dd/mm/yyyy" })
      .adicionarColuna({
        coluna1: {
          nome: "nome1"
        },
        coluna2: {
          replace: { chave: "i", valor: "u" }
          //nome: "nome2"
        },
        coluna3: {
          mascara: "dd/mm/yyyy"
          //nome: "nome1"
        }
      })
      .adicionarModelo({
        coluna1: "ricardo",
        coluna2: "david",
        coluna3: new Date()
      });
    // .getJSON();

    console.log(x.getJSON());

    this.factoryJSON.configuracaoGeral(null).removerColuna("coluna1");
  }
}

export interface IJSONBuilder<T> {
  configuracaoGeral(config: ConfiguracaoGeral): IManuseiaColuna<T>;
  removerColuna(model: T): IRemoveColuna<T>;
  carregarJSONConfiguracao(origem: string): ICriaJSON<T>;
}

export interface IManuseiaColuna<T> {
  adicionarColuna(parametrosJSON: MappedTypeConfigJSON<T>): IModeloConcreto<T>;
  removerColuna(parametrosJSON: keyof T | Array<keyof T>): IRemoveColuna<T>;
  formataValor(parametrosJSON: ConfiguracaoColuna): IFormataValor;
}

export interface IAdicionaColuna<T> {
  adicionarColuna(parametrosJSON: MappedTypeConfigJSON<T>): IAdicionaColuna<T>;
  getJSON(): string;
}

export interface IRemoveColuna<T> {
  removerColuna(parametrosJSON: ConfiguracaoColuna): IRemoveColuna<T>;
}

export interface IFormataValor {
  formataValor(): IFormataValor;
}

export interface IModeloConcreto<T> {
  adicionarModelo(model: T): ICriaJSON<T>;
}

export interface ICriaJSON<T> {
  getJSON(): string;
}

export class ConfiguracaoColuna {
  mascara?: string | RegExp;
  replace?: ChaveValor | ChaveValor[];
  nome?: string;
}

export class ChaveValor {
  chave: string;
  valor: string;
}

export class ConfiguracaoGeral {
  caracterScape?: string;
  mascaraData?: string;
  padraoValorNULL?: string;
}

export class Teste {
  coluna1: string;
  coluna2: string;
  coluna3: Date;
}

// Use this:
type MappedTypeConfigJSON<T> = { [P in keyof T]?: ConfiguracaoColuna };
type PartialWithNewMember2<T> = { coluna: [keyof T] };
/**
 * Turn all properties of T into strings
 */
type Stringify<T> = { [P in keyof T]: string };

export class JSONBuilder<T> implements IJSONBuilder<T> {
  configuracaoGeral<T>(config: ConfiguracaoGeral): IManuseiaColuna<T> {
    return new ManuseiaColuna<T>(config);
  }

  removerColuna<T>(model: T): IRemoveColuna<T> {
    return null;
  }

  carregarJSONConfiguracao(origem: string): ICriaJSON<T> {
    return null;
  }
}

export class ManuseiaColuna<T> implements IManuseiaColuna<T> {
  private _configGeral?: ConfiguracaoGeral;

  constructor(config?: ConfiguracaoGeral) {
    this._configGeral = config;
  }

  adicionarColuna(configJSON: MappedTypeConfigJSON<T>): IModeloConcreto<T> {
    return new ModeloConcreto<T>(configJSON, this._configGeral);
  }
  removerColuna(tipo: keyof T | Array<keyof T>): IRemoveColuna<T> {
    return null;
  }
  formataValor(tipo: ConfiguracaoColuna): IFormataValor {
    return null;
  }
}

export class ModeloConcreto<T> implements IModeloConcreto<T> {
  private _configJSON: MappedTypeConfigJSON<T>;
  private _configGeral: ConfiguracaoGeral;

  private _novoObjeto = {};

  constructor(
    private configJSON: MappedTypeConfigJSON<T>,
    configGeral?: ConfiguracaoGeral
  ) {
    this._configJSON = configJSON;
    this._configGeral = configGeral;
  }

  adicionarModelo(modeloOriginal: T): ICriaJSON<T> {
    // monta novoObjeto
    Object.getOwnPropertyNames(this._configJSON).forEach(
      (value, index, array) => {
        console.log(value, index, array, this._configJSON[value]);

        // objeto que contém a configuração para cada coluna.
        let configuraColuna = this._configJSON[value] as ConfiguracaoColuna;

        // aplica o replace caso exista configuração especificada
        console.log(configuraColuna.replace);
        let replaceValor = configuraColuna.replace
          ? this.replace(
              modeloOriginal[value] as string,
              configuraColuna.replace
            )
          : modeloOriginal[value];

        // adiciona o nome da propriedade e valor para a nova coluna
        this._novoObjeto[
          configuraColuna.nome ? configuraColuna.nome : value
        ] = replaceValor;

        console.log(modeloOriginal[value]);

        // aplica formatação para data.
        this.verificaMascaraData(
          this._configGeral.mascaraData,
          this._configJSON[value],
          replaceValor
        );
      }
    );

    return new CriaJSON<T>(this._novoObjeto);
  }

  private verificaReplace(): string {
    return "";
  }

  private verificaMascaraData(
    mascaraGeral: string,
    mascaraColuna: string,
    valor: string
  ): string {
    // verfica se o tipo da coluna é mascaraData
    // verifica se existe padrão especificado para a coluna
    // verifica se existe padrão genérico para a coluna
    return valor;
  }

  private replace(valor: string, replacer: ChaveValor | ChaveValor[]): string {
    if (replacer instanceof Array)
      replacer.forEach((value, index) => {
        let chaveValor: ChaveValor = value as ChaveValor;
        while (valor.includes(chaveValor.chave))
          valor = valor.replace(chaveValor.chave, chaveValor.valor);
      });
    else
      while (valor.includes(replacer.chave))
        valor = valor.replace(replacer.chave, replacer.valor);

    return valor;
  }
}

export class CriaJSON<T> implements CriaJSON<T> {
  private _jsonObject: any;

  constructor(jsonObject: any) {
    this._jsonObject = jsonObject;
  }

  getJSON() {
    return JSON.stringify(this._jsonObject);
  }
}
