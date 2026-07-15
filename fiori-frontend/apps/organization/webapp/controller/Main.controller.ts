import Controller from 'sap/ui/core/mvc/Controller';
import MessageToast from 'sap/m/MessageToast';
import Event from 'sap/ui/base/Event';
import ColumnListItem from 'sap/m/ColumnListItem';

/**
 * @namespace jetbench.organization.controller
 */
export default class Main extends Controller {
  public onInit(): void {
    // Milestone 7 only needs the OData bindings in the XML view.
    // Later milestones will add route-based edit/create pages.
  }

  public onCreateUser(): void {
    MessageToast.show('Create User screen will be added next.');
  }

  public onCreateAircraft(): void {
    MessageToast.show('Create Aircraft screen will be added next.');
  }

  public onCreateEngine(): void {
    MessageToast.show('Create Engine screen will be added next.');
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
    MessageToast.show(`Selected aircraft: ${sID}`);
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
