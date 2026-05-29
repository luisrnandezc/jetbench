/// <reference types="@openui5/ts-types" />

import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import JSONModel from 'sap/ui/model/json/JSONModel';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';

import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';

interface CreateOrganizationModelData {
  name: string;
  code: string;
  legalName: string;
  type: string;
  country: string;
  city: string;
  timezone: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
}

/**
 * @namespace jetbench.admin.controller
 */
export default class CreateOrganization extends Controller {
  private static readonly CREATE_GROUP_ID = 'createOrganizationGroup';

  public onInit(): void {
    const initial: CreateOrganizationModelData = {
      name: '',
      code: '',
      legalName: '',
      type: 'OWNER_OPERATOR',
      country: '',
      city: '',
      timezone: '',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
    };

    this.getView()?.setModel(new JSONModel(initial), 'create');
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private getCreateData(): CreateOrganizationModelData {
    const model = this.getView()?.getModel('create') as JSONModel;
    return model.getData() as CreateOrganizationModelData;
  }

  public onNavBack(): void {
    this.getRouter().navTo('main');
  }

  private validateRequired(data: CreateOrganizationModelData): string | null {
    const requiredFields: Array<keyof CreateOrganizationModelData> = [
      'name',
      'code',
      'type',
      'primaryContactName',
      'primaryContactEmail',
    ];

    for (const field of requiredFields) {
      const value = String(data[field] ?? '').trim();
      if (!value) return `Field "${field}" is required.`;
    }

    return null;
  }

  public async onSave(): Promise<void> {
    const data = this.getCreateData();

    const requiredError = this.validateRequired(data);
    if (requiredError) {
      MessageBox.warning(requiredError);
      return;
    }

    const payload = {
      name: String(data.name).trim(),
      code: String(data.code).trim(),
      legalName: String(data.legalName).trim(),
      type: String(data.type).trim(),
      country: String(data.country).trim().toUpperCase(),
      city: String(data.city).trim(),
      timezone: String(data.timezone).trim(),
      primaryContactName: String(data.primaryContactName).trim(),
      primaryContactEmail: String(data.primaryContactEmail).trim(),
      primaryContactPhone: String(data.primaryContactPhone).trim(),
      status: 'ACTIVE',
    };

    const model = this.getODataModel();
    const list = model.bindList('/Organizations', undefined, undefined, undefined, {
      $$updateGroupId: CreateOrganization.CREATE_GROUP_ID,
    }) as ODataListBinding;

    this.getView()?.setBusy(true);
    try {
      list.create(payload);

      await model.submitBatch(CreateOrganization.CREATE_GROUP_ID);

      MessageToast.show('Organization created');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Failed to create organization. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
