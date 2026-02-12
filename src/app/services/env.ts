import { environment } from "../../environments/environment";

export class Env {
  public static API_URL = environment.apiUrl;
  // public static API_URL2 = environment.apiUrl;

  public static PRODUITS = Env.API_URL + '/produits';
  public static CATEGORIES = Env.API_URL + '/categories';
  public static VENTES = Env.API_URL + '/ventes';

  public static TOPVENTE = Env.API_URL + '/topvente';
  public static VENTERECENTE = Env.API_URL + '/recentvente';
  public static REAPPROVISIONNEMENT = Env.API_URL + '/reappro';

  public static VENTEHISTORIQUE = Env.API_URL + '/historique';
  public static VENTESPARMOIS = Env.API_URL + '/ventesparmois';
  public static VENTESPARANNEE = Env.API_URL + '/ventesparannee';
  public static VENTESPARJOUR = Env.API_URL + '/ventesparjour';
  public static VENTESPARCATEGORIE = Env.API_URL + '/ventesparcategorie';
  public static VENTESPARPRODUIT = Env.API_URL + '/ventesparproduit';
  public static VENTESPARCLIENT = Env.API_URL + '/ventesparclient';
  public static CHIFFREDAFFAIRE = Env.API_URL + '/chiffre';
  public static CHIFFRE = Env.API_URL + '/chiffre';
  public static ANNULEVENTE = Env.API_URL + '/annulevente';
  public static RETOURVENTE = Env.API_URL + '/retourvente';


  public static ANNEEVENTE = Env.API_URL + '/anneeVente';
  public static INVENTAIRE = Env.API_URL + '/inventaires';
  public static LOGIN = Env.API_URL + '/login';
  public static REGISTER = Env.API_URL + '/register';
  public static USER = Env.API_URL + '/user';
  public static LOGOUT = Env.API_URL + '/logout';
  public static FACTURE = Env.API_URL + '/facture';
 
  public static CLIENT = Env.API_URL + '/clients';
  public static FACTURATION = Env.API_URL + '/facturations';
  public static FACTURATIONDATE = Env.API_URL + '/facturations';
  public static CLIENTFIDELE = Env.API_URL + '/clientsfidele';
  public static CLIENTCOUNT = Env.API_URL + '/clientcount';
  public static SUMMARY = Env.API_URL + '/summary';


  public static PROFIL = Env.API_URL + '/profil';
  public static BOUTIQUES = Env.API_URL + '/boutiques';
  public static BOUTIQUES_STORE_WITH_MANAGER = Env.BOUTIQUES + '/store-with-manager';
  public static PRODUITS_TRASHED = Env.PRODUITS + '/trashed';
  public static PRODUITS_RESTORE = Env.PRODUITS + '/restore';

  public static CREDITS = Env.API_URL + '/credits';
  public static CREDIT_PAYMENTS = Env.API_URL + '/credits/payments';
  public static CREDIT_DEBTORS = Env.API_URL + '/credits/debtors';
  public static CREDIT_STATEMENT = Env.API_URL + '/credits/statement';
  public static PROFORMAS = Env.API_URL + '/proformas';
  public static PROFORMA_CONVERT = Env.API_URL + '/proformas';

  // User and Boutique Status Check
  public static CHECK_USER_STATUS = Env.API_URL + '/user/check-status';
  public static CHECK_BOUTIQUE_STATUS = Env.API_URL + '/boutique/check-status';
  
  public static EXPENSES = Env.API_URL + '/expenses';
  public static EXPENSES_DASHBOARD = Env.API_URL + '/expenses/dashboard';
  
  // PDF Generation
  public static PDF_GENERATE = Env.API_URL + '/pdf/generate';
  public static PDF_PREVIEW = Env.API_URL + '/pdf/preview';
}
