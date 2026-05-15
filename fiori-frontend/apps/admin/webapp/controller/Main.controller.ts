import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import Event from 'sap/ui/base/Event';
import MessageToast from 'sap/m/MessageToast';
import MessageBox from 'sap/m/MessageBox';

import Dialog from 'sap/m/Dialog';
import Input from 'sap/m/Input';
import Select from 'sap/m/Select';
import ColumnListItem from 'sap/m/ColumnListItem';

import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
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

  private getODataModel(): ODataModel {
    return this.getView()!.getModel() as ODataModel;
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

  //------------------------------
  // Create organization dialog
  //------------------------------

  public onOpenCreateOrganizationDialog(): void {
    const oDialog = this.byId('createOrganizationDialog') as Dialog;
    oDialog.open();
  }

  public onCloseCreateOrganizationDialog(): void {
    const oDialog = this.byId('createOrganizationDialog') as Dialog;
    oDialog.close();
  }

  public onCreateOrganization(): void {
    const sName = (this.byId('orgNameInput') as Input).getValue().trim();
    const sCode = (this.byId('orgCodeInput') as Input).getValue().trim();
    const sCountry = (this.byId('orgCountryInput') as Input).getValue().trim();

    if (!sName || !sCode || !sCountry) {
      MessageToast.show('Please fill in all required fields.');
      return;
    }

    const oModel = this.getODataModel();

    const oListBinding = oModel.bindList('/Organizations') as ODataListBinding;

    oListBinding.create({
      name: sName,
      code: sCode,
      country: sCountry,
    });

    oModel
      .submitBatch(oModel.getUpdateGroupId())
      .then(() => {
        this.refreshOrganizationsTable();
        this.clearOrganizationDialog();
        this.onCloseCreateOrganizationDialog();
        MessageToast.show('Organization created successfully.');
      })
      .catch(() => {
        MessageBox.error('Failed to create organization. Please try again.');
      });
  }

  private clearOrganizationDialog(): void {
    (this.byId('orgNameInput') as Input).setValue('');
    (this.byId('orgCodeInput') as Input).setValue('');
    (this.byId('orgCountryInput') as Input).setValue('');
  }

  private refreshOrganizationsTable(): void {
    const oTable = this.byId('organizationsTable') as Table;
    const oBinding = oTable.getBinding('items') as ODataListBinding | undefined;
    oBinding?.refresh();
  }

  //------------------------------
  // User creation dialog
  //------------------------------

  public onOpenCreateUserDialog(): void {
    const oDialog = this.byId('createUserDialog') as Dialog;
    oDialog.open();
  }

  public onCloseCreateUserDialog(): void {
    const oDialog = this.byId('createUserDialog') as Dialog;
    oDialog.close();
  }

  public onCreateUser(): void {
    const sFirstName = (this.byId('userFirstNameInput') as Input)
      .getValue()
      .trim();
    const sLastName = (this.byId('userLastNameInput') as Input)
      .getValue()
      .trim();
    const sEmail = (this.byId('userEmailInput') as Input).getValue().trim();

    const sRole = (this.byId('userRoleSelect') as Select).getSelectedKey();

    const oOrganizationSelect = this.byId('userOrganizationSelect') as Select;
    const sOrganizationID = oOrganizationSelect.getSelectedKey();

    if (!sFirstName || !sLastName || !sEmail || !sRole || !sOrganizationID) {
      MessageToast.show('Please fill in all required fields.');
      return;
    }

    const oModel = this.getODataModel();
    const oListBinding = oModel.bindList('/Users') as ODataListBinding;

    const oCreatedContext = oListBinding.create({
      firstName: sFirstName,
      lastName: sLastName,
      email: sEmail,
      role: sRole,
      organization_ID: sOrganizationID,
      isActive: true,
    });

    oModel
      .submitBatch(oModel.getUpdateGroupId())
      .then(() => oCreatedContext.created())
      .then(() => {
        this.refreshUsersTable();
        this.clearUserDialog();
        this.onCloseCreateUserDialog();
        MessageToast.show('User created successfully.');
      })
      .catch(() => {
        MessageBox.error('Failed to create user. Please try again.');
      });
  }

  private clearUserDialog(): void {
    (this.byId('userFirstNameInput') as Input).setValue('');
    (this.byId('userLastNameInput') as Input).setValue('');
    (this.byId('userEmailInput') as Input).setValue('');

    const oRoleSelect = this.byId('userRoleSelect') as Select;
    oRoleSelect.setSelectedKey('ORG_USER');

    const oOrganizationSelect = this.byId('userOrganizationSelect') as Select;
    oOrganizationSelect.setSelectedKey('');
  }

  private refreshUsersTable(): void {
    const oTable = this.byId('usersTable') as Table;
    const oBinding = oTable.getBinding('items') as ODataListBinding | undefined;
    oBinding?.refresh();
  }
}
