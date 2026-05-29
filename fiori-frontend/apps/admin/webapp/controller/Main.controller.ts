import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import Event from 'sap/ui/base/Event';
import MessageBox from 'sap/m/MessageBox';

import ColumnListItem from 'sap/m/ColumnListItem';

import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';
import Table from 'sap/m/Table';

/**
 * @namespace jetbench.admin.controller
 */
export default class Main extends Controller {
  public onInit(): void {
    this.getRouter()
      .getRoute('main')
      ?.attachPatternMatched(this.onMainRouteMatched, this);
  }

  private onMainRouteMatched(): void {
    this.refreshOrganizationsTable();
    this.refreshUsersTable();
  }

  private getRouter() {
    return UIComponent.getRouterFor(this);
  }

  //------------------------------
  // Organization navigation
  //------------------------------

  public onOrganizationPress(oEvent: Event): void {
    const oItem = oEvent.getSource() as ColumnListItem;
    const oContext = oItem.getBindingContext();

    if (!oContext) {
      MessageBox.error('Could not read selected organization.');
      return;
    }

    const sID = oContext.getProperty('ID') as string;

    this.getRouter().navTo('editOrganization', {
      ID: sID,
    });
  }

  //------------------------------
  // User navigation
  //------------------------------

  public onUserPress(oEvent: Event): void {
    const oItem = oEvent.getSource() as ColumnListItem;
    const oContext = oItem.getBindingContext();

    if (!oContext) {
      MessageBox.error('Could not read selected user');
      return;
    }

    const sID = oContext.getProperty('ID') as string;

    this.getRouter().navTo('editUser', {
      ID: sID,
    });
  }

  public onCreateOrganization(): void {
    this.getRouter().navTo('createOrganization');
  }

  private refreshOrganizationsTable(): void {
    const oTable = this.byId('organizationsTable') as Table;
    const oBinding = oTable.getBinding('items') as ODataListBinding | undefined;
    oBinding?.refresh();
  }

  public onCreateUser(): void {
    this.getRouter().navTo('createUser');
  }

  private refreshUsersTable(): void {
    const oTable = this.byId('usersTable') as Table;
    const oBinding = oTable.getBinding('items') as ODataListBinding | undefined;
    oBinding?.refresh();
  }
}
