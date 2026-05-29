/// <reference types="@openui5/ts-types" />

import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import JSONModel from 'sap/ui/model/json/JSONModel';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';

import type Router from 'sap/ui/core/routing/Router';
import type Event from 'sap/ui/base/Event';
import type Input from 'sap/m/Input';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';

interface CreateUserModelData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization_ID: string;
}

/**
 * @namespace jetbench.admin.controller
 */
export default class CreateUser extends Controller {
  private static readonly CREATE_GROUP_ID = 'createGroup';

  public onInit(): void {
    const initial: CreateUserModelData = {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      organization_ID: '',
    };

    this.getView()?.setModel(new JSONModel(initial), 'create');
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private getCreateData(): CreateUserModelData {
    const m = this.getView()?.getModel('create') as JSONModel;
    return m.getData() as CreateUserModelData;
  }

  public onNavBack(): void {
    this.getRouter().navTo('main');
  }

  private validateRequired(d: CreateUserModelData): string | null {
    const requiredFields: Array<keyof CreateUserModelData> = [
      'firstName',
      'lastName',
      'email',
      'role',
      'organization_ID',
    ];

    for (const f of requiredFields) {
      const v = String(d[f] ?? '').trim();
      if (!v) return `Field "${f}" is required.`;
    }

    return null;
  }

  public async onSave(): Promise<void> {
    const d = this.getCreateData();

    const requiredError = this.validateRequired(d);
    if (requiredError) {
      MessageBox.warning(requiredError);
      return;
    }

    const payload = {
      firstName: String(d.firstName).trim(),
      lastName: String(d.lastName).trim(),
      email: String(d.email).trim(),
      role: String(d.role).trim(),
      organization_ID: String(d.organization_ID).trim(),
      isActive: true,
    };

    const model = this.getODataModel();

    // Bind list with an update group so we can submit explicitly
    const list = model.bindList('/Users', undefined, undefined, undefined, {
      $$updateGroupId: CreateUser.CREATE_GROUP_ID,
    }) as ODataListBinding;

    this.getView()?.setBusy(true);
    try {
      list.create(payload);

      await model.submitBatch(CreateUser.CREATE_GROUP_ID);

      MessageToast.show('User created');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Failed to create user. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
