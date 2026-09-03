import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import MessageToast from 'sap/m/MessageToast';
import Table from 'sap/m/Table';

import type Router from 'sap/ui/core/routing/Router';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';

/**
 * @namespace jetbench.operations.controller
 */
export default class Main extends Controller {
  public onInit(): void {
    this.getRouter()
      .getRoute('main')
      ?.attachPatternMatched(this.onMainRouteMatched, this);
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private onMainRouteMatched(): void {
    this.refreshTable('flightRecordsTable');
    this.refreshTable('aircraftTable');
    this.refreshTable('enginesTable');
  }

  private refreshTable(tableId: string): void {
    const table = this.byId(tableId) as Table | undefined;
    const binding = table?.getBinding('items') as ODataListBinding | undefined;

    binding?.refresh();
  }

  public onCreateFlightRecord(): void {
    MessageToast.show('Create Flight Record screen will be added next.');
  }
}
