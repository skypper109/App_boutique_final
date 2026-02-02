export class Vente {
  id: number;
  date: string;
  montant: number;
  client: string;
  produits: number;
quantite: any;
prix: any;
  constructor(id: number, date: string, montant: number, client: string, produits: number) {
    this.id = id;
    this.date = date;
    this.montant = montant;
    this.client = client;
    this.produits = produits;
  }
}
