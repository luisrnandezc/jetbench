import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import MessageToast from 'sap/m/MessageToast';
import Event from 'sap/ui/base/Event';
import ColumnListItem from 'sap/m/ColumnListItem';
import type Router from 'sap/ui/core/routing/Router';
import Table from 'sap/m/Table';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';

/**
 * @namespace jetbench.organization.controller
 */
export default class Main extends Controller {
  public onInit(): void {
    this.getRouter()
      .getRoute('main')
      ?.attachPatternMatched(this.onRouteMatched, this);
  }

  private onRouteMatched(): void {
    this.refreshTable('organizationsTable');
    this.refreshTable('usersTable');
    this.refreshTable('aircraftTable');
    this.refreshTable('enginesTable');
  }

  private refreshTable(sTableId: string): void {
    const oTable = this.byId(sTableId) as Table | undefined;
    const oBinding = oTable?.getBinding('items') as
      | ODataListBinding
      | undefined;

    oBinding?.refresh();
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  public onCreateUser(): void {
    MessageToast.show('Create User screen will be added later.');
  }

  public onCreateAircraft(): void {
    this.getRouter().navTo('createAircraft');
  }

  public onCreateEngine(): void {
    MessageToast.show('Create Engine screen will be added later.');
  }

  public onUserPress(oEvent: Event): void {
    const oItem = oEvent.getSource() as ColumnListItem;
    const oContext = oItem.getBindingContext();

    if (!oContext) {
      MessageToast.show('Could not read selected user.');
      return;
    }

    const sID = oContext.getProperty('ID') as string;
    MessageToast.show(`Selected user: ${sID}`);
  }

  public onAircraftPress(oEvent: Event): void {
    const oItem = oEvent.getSource() as ColumnListItem;
    const oContext = oItem.getBindingContext();

    if (!oContext) {
      MessageToast.show('Could not read selected aircraft.');
      return;
    }

    const sID = oContext.getProperty('ID') as string;

    this.getRouter().navTo('editAircraft', {
      ID: sID,
    });
  }

  public onEnginePress(oEvent: Event): void {
    const oItem = oEvent.getSource() as ColumnListItem;
    const oContext = oItem.getBindingContext();

    if (!oContext) {
      MessageToast.show('Could not read selected engine.');
      return;
    }

    const sID = oContext.getProperty('ID') as string;
    MessageToast.show(`Selected engine: ${sID}`);
  }
}
