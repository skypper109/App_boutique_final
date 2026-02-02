export class Produit {
  id!: number;
  nom!: string;
  reference?: string;
  description!: string;
  prixUnitaire!: number;
  quantite!: number;
  totalMontant!: number;
  marque!: string;
  modele!: string;
  image!: File;
  dateAchat!: Date;
  dateFinGarantie!: Date;
  categorie_id!: number;
}
